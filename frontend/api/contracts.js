const CANTON_API = process.env.CANTON_API_URL;
const PARTY = process.env.CANTON_PARTY;

const TIMEOUT_OFFSET = 8000;
const TIMEOUT_CONTRACTS = 20000;

const AML_TEMPLATES = [
  'BankReputation:BankReputation',
  'PredictionMarket:RiskScore',
  'PredictionMarket:SARReport',
  'PredictionMarket:PredictionMarket',
];

/** Extract human-readable name from Canton party ID (e.g. "Bank_A::abc..." → "Bank A") */
function parseName(partyId) {
  return (partyId || '').split('::')[0].replace(/_/g, ' ');
}

/** Daml Map serializes as array of [key, value] tuples, not as a JSON object */
function parseVotes(votesRaw) {
  if (!Array.isArray(votesRaw)) return [];
  return votesRaw.flatMap(entry => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const [party, vote] = entry;
    if (!party || !vote) return [];
    return [{
      voter: parseName(party),
      confidence: Math.round(parseFloat(vote.confidence || 0) * 1000) / 10,
      weight: parseFloat(vote.stake || 1),
    }];
  });
}

/** Template ID format: packageHash:ModuleName:TemplateName → extract TemplateName */
function getTemplateName(templateId) {
  const parts = (templateId || '').split(':');
  return parts[2] || parts[1] || '';
}

/** Transform raw contract entry into a typed API response object */
function transformContract(item) {
  const key = Object.keys(item.contractEntry || {})[0];
  if (!key) return null;

  const ce = item.contractEntry[key].createdEvent || {};
  const template = getTemplateName(ce.templateId);
  const args = ce.createArgument || {};
  const base = { contractId: (ce.contractId || '').slice(0, 16), fullContractId: ce.contractId || '', template, createdAt: ce.createdAt || null, ledgerOffset: ce.offset || null };

  switch (template) {
    case 'BankReputation':
      return { ...base, bank: parseName(args.bank), reputationScore: parseFloat(args.reputationScore) || 0, accuracy: parseFloat(args.accuracy) || 0 };
    case 'PredictionMarket': {
      if (args.isOpen !== true) return null;
      const votes = parseVotes(args.votes);
      if (votes.length === 0) return null;
      return { ...base, transactionId: args.transactionId, isOpen: true, creator: parseName(args.creator), votes };
    }
    case 'RiskScore':
      return { ...base, transactionId: args.transactionId, riskScore: Math.round(parseFloat(args.score || 0) * 1000) / 10, actionTaken: args.actionTaken || null, sarFiled: args.sarFiled || false };
    case 'SARReport':
      return { ...base, transactionId: args.transactionId, riskScore: Math.round(parseFloat(args.riskScore || 0) * 1000) / 10, status: args.status };
    default:
      return null;
  }
}

// In-memory cache for warm function instances
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 25000; // 25s — frontend refreshes every 30s

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Serve from cache if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.json(cache);
  }

  try {
    const offsetRes = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(TIMEOUT_OFFSET) });
    if (!offsetRes.ok) throw new Error(`Ledger endpoint returned ${offsetRes.status}`);
    const { offset } = await offsetRes.json();

    const filter = {
      filtersByParty: {
        [PARTY]: {
          cumulative: AML_TEMPLATES.map(t => ({
            identifierFilter: { TemplateFilter: { value: { templateId: `#aml-network:${t}`, includeCreatedEventBlob: false } } },
          })),
        },
      },
    };

    const acRes = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter, verbose: true, activeAtOffset: offset }),
      signal: AbortSignal.timeout(TIMEOUT_CONTRACTS),
    });
    if (!acRes.ok) throw new Error(`Active contracts endpoint returned ${acRes.status}`);

    const entries = await acRes.json();
    const data = Array.isArray(entries) ? entries : [];
    const contracts = data.map(transformContract).filter(Boolean);

    const result = { success: true, mode: 'canton-devnet', totalContracts: data.length, contracts, offset };
    cache = result;
    cacheTime = Date.now();

    res.setHeader('Cache-Control', 's-maxage=25, stale-while-revalidate=60');
    res.json(result);
  } catch (err) {
    // Serve stale cache on error rather than showing empty dashboard
    if (cache) return res.json(cache);
    res.status(502).json({ success: false, error: err.message, totalContracts: 0, contracts: [] });
  }
}
