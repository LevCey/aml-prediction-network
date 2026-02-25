const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';

async function getOffset() {
  const r = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(5000) });
  const d = await r.json();
  return d.offset;
}

async function getActiveContracts(offset) {
  const r = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        filtersByParty: {},
        filtersForAnyParty: {
          cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }]
        }
      },
      verbose: true,
      activeAtOffset: offset
    }),
    signal: AbortSignal.timeout(10000)
  });
  return r.json();
}

function parseName(partyId) {
  return (partyId || '').split('::')[0].replace(/_/g, ' ');
}

export default async function handler(req, res) {
  try {
    const offset = await getOffset();
    const data = await getActiveContracts(offset);
    const entries = Array.isArray(data) ? data : [];

    const TEMPLATES = [':BankReputation:', ':PredictionMarket:', ':RiskScore:', ':SARReport:'];

    const contracts = entries
      .map(item => {
        const key = Object.keys(item.contractEntry || {})[0];
        if (!key) return null;
        const ce = item.contractEntry[key].createdEvent || {};
        return { templateId: ce.templateId || '', contractId: ce.contractId || '', args: ce.createArgument || {} };
      })
      .filter(c => c && TEMPLATES.some(t => c.templateId.includes(t)))
      .map(c => {
        const template = c.templateId.split(':')[1] || '';
        const base = { contractId: c.contractId.slice(0, 16), template };

        if (template === 'BankReputation') {
          return { ...base, bank: parseName(c.args.bank), reputationScore: parseFloat(c.args.reputationScore) || 0, accuracy: parseFloat(c.args.accuracy) || 0 };
        }
        if (template === 'PredictionMarket') {
          const votes = (c.args.votes || []).map(v => ({
            voter: parseName(v.voter),
            confidence: Math.round(parseFloat(v.confidence || 0) * 1000) / 10,
            weight: parseFloat(v.stake || v.weight || 1)
          }));
          return { ...base, transactionId: c.args.transactionId, isOpen: c.args.isOpen, creator: parseName(c.args.creator), votes };
        }
        if (template === 'RiskScore') {
          return { ...base, transactionId: c.args.transactionId, riskScore: Math.round(parseFloat(c.args.score || 0) * 1000) / 10 };
        }
        if (template === 'SARReport') {
          return { ...base, transactionId: c.args.transactionId };
        }
        return base;
      });

    res.json({ success: true, mode: 'canton-devnet', totalContracts: entries.length, contracts });
  } catch (err) {
    res.json({ success: false, error: err.message, totalContracts: 0, contracts: [] });
  }
}
