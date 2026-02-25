const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';
const PARTY = process.env.CANTON_PARTY || 'Bank_A::122031dacd1d842e4499cf58bc1391ec402816ebc0edf2a240b0ff9322f7e7b97a3a';

function parseName(partyId) {
  return (partyId || '').split('::')[0].replace(/_/g, ' ');
}

// Daml Map is serialized as array of [key, value] tuples
function parseVotes(votesRaw) {
  if (!Array.isArray(votesRaw)) return [];
  return votesRaw.map(entry => {
    const [party, vote] = Array.isArray(entry) ? entry : [null, null];
    if (!party || !vote) return null;
    return {
      voter: parseName(party),
      confidence: Math.round(parseFloat(vote.confidence || 0) * 1000) / 10,
      weight: parseFloat(vote.stake || 1)
    };
  }).filter(Boolean);
}

// Template ID format: packageHash:ModuleName:TemplateName
function getTemplateName(templateId) {
  const parts = (templateId || '').split(':');
  return parts[2] || parts[1] || '';
}

export default async function handler(req, res) {
  try {
    // Get current offset
    const offsetRes = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(8000) });
    const { offset } = await offsetRes.json();

    // Targeted query: only AML templates, filtered by party (much faster than wildcard)
    const acRes = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: {
          filtersByParty: {
            [PARTY]: {
              cumulative: [
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:BankReputation:BankReputation', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:RiskScore', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:SARReport', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:PredictionMarket', includeCreatedEventBlob: false } } } },
              ]
            }
          }
        },
        verbose: true,
        activeAtOffset: offset
      }),
      signal: AbortSignal.timeout(20000)
    });
    const entries = await acRes.json();
    const data = Array.isArray(entries) ? entries : [];

    const contracts = data
      .map(item => {
        const key = Object.keys(item.contractEntry || {})[0];
        if (!key) return null;
        const ce = item.contractEntry[key].createdEvent || {};
        return { templateId: ce.templateId || '', contractId: ce.contractId || '', args: ce.createArgument || {} };
      })
      .filter(Boolean)
      .map(c => {
        const template = getTemplateName(c.templateId);
        const base = { contractId: c.contractId.slice(0, 16), template };

        if (template === 'BankReputation') {
          return { ...base, bank: parseName(c.args.bank), reputationScore: parseFloat(c.args.reputationScore) || 0, accuracy: parseFloat(c.args.accuracy) || 0 };
        }
        if (template === 'PredictionMarket') {
          if (c.args.isOpen !== true) return null;
          const votes = parseVotes(c.args.votes);
          if (votes.length === 0) return null;
          return { ...base, transactionId: c.args.transactionId, isOpen: true, creator: parseName(c.args.creator), votes };
        }
        if (template === 'RiskScore') {
          return { ...base, transactionId: c.args.transactionId, riskScore: Math.round(parseFloat(c.args.score || 0) * 1000) / 10, actionTaken: c.args.actionTaken || null, sarFiled: c.args.sarFiled || false };
        }
        if (template === 'SARReport') {
          return { ...base, transactionId: c.args.transactionId, riskScore: Math.round(parseFloat(c.args.riskScore || 0) * 1000) / 10, status: c.args.status };
        }
        return null;
      })
      .filter(Boolean);

    res.json({ success: true, mode: 'canton-devnet', totalContracts: data.length, contracts, offset });
  } catch (err) {
    res.json({ success: false, error: err.message, totalContracts: 0, contracts: [] });
  }
}
