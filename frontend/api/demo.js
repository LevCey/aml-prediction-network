const CANTON_API = process.env.CANTON_API_URL;
const PARTY_SUFFIX = process.env.CANTON_PARTY_SUFFIX || '';
const PKG = 'aml-network';

const BANKS = [
  { key: 'Bank_A', userId: 'banka', name: 'Bank A' },
  { key: 'Bank_B', userId: 'bankb', name: 'Bank B' },
  { key: 'Bank_C', userId: 'bankc', name: 'Bank C' },
  { key: 'Bank_D', userId: 'bankd', name: 'Bank D' },
];

const SCENARIOS = {
  high:   { base: 0.85, variance: 0.08 },
  medium: { base: 0.70, variance: 0.08 },
  low:    { base: 0.28, variance: 0.12 },
};

let marketCount = 47;

// --- Canton Ledger API helpers ---

async function cantonFetch(path, body, method = 'POST') {
  const opts = body
    ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) }
    : { method, signal: AbortSignal.timeout(8000) };
  const r = await fetch(`${CANTON_API}${path}`, opts);
  if (!r.ok) throw new Error(`Canton ${path} returned ${r.status}`);
  return r.json();
}

async function submitCommand(userId, commandId, actAs, commands) {
  return cantonFetch('/v2/commands/submit-and-wait-for-transaction', {
    commands: { userId, commandId, actAs, commands },
  });
}

function findCreated(res, templateFragment) {
  for (const evt of res?.transaction?.events || []) {
    const c = evt.CreatedEvent;
    if (c && String(c.templateId || '').includes(templateFragment))
      return { contractId: c.contractId, args: c.createArgument || {} };
  }
  return null;
}

// --- Reputation loading ---

let reputationCache = null;
let reputationCacheTime = 0;

async function loadReputations() {
  if (reputationCache && Date.now() - reputationCacheTime < 60000) return reputationCache;

  try {
    const { offset } = await cantonFetch('/v2/state/ledger-end', null, 'GET');
    const party = `Bank_A${PARTY_SUFFIX}`;
    const data = await cantonFetch('/v2/state/active-contracts', {
      filter: {
        filtersByParty: {
          [party]: {
            cumulative: [{
              identifierFilter: { TemplateFilter: { value: { templateId: `#${PKG}:BankReputation:BankReputation`, includeCreatedEventBlob: false } } },
            }],
          },
        },
      },
      verbose: true,
      activeAtOffset: offset,
    });

    const reps = {};
    for (const item of Array.isArray(data) ? data : []) {
      const key = Object.keys(item.contractEntry || {})[0];
      if (!key) continue;
      const args = item.contractEntry[key].createdEvent?.createArgument || {};
      const name = (args.bank || '').split('::')[0];
      reps[name] = { score: parseFloat(args.reputationScore) || 50 };
    }
    reputationCache = reps;
    reputationCacheTime = Date.now();
    return reps;
  } catch {
    return { Bank_A: { score: 92 }, Bank_B: { score: 85 }, Bank_C: { score: 78 }, Bank_D: { score: 74 } };
  }
}

function reputationToWeight(score) {
  if (score >= 90) return 2.0;
  if (score >= 75) return 1.5;
  if (score >= 50) return 1.0;
  if (score >= 25) return 0.75;
  return 0.5;
}

// --- On-chain demo workflow ---

function generateVotes(banks, base, variance, reps) {
  return banks.map((b, i) => {
    const rep = reps[b.key] || { score: 50 };
    const weight = reputationToWeight(rep.score);
    const confidence = Math.min(0.95, Math.max(0.15, base + (Math.random() - 0.5) * variance * 2));
    return { ...b, confidence, weight, party: b.key + PARTY_SUFFIX };
  });
}

async function runOnChain(txId, base, variance, reps) {
  const parties = BANKS.map(b => b.key + PARTY_SUFFIX);
  const regParty = 'Regulator' + PARTY_SUFFIX;
  const deadline = new Date(Date.now() + 3600_000).toISOString();
  const votes = generateVotes(BANKS, base, variance, reps);

  // 1. Create prediction market
  const createRes = await submitCommand('banka', `create-${txId}`, [parties[0]], [{
    CreateCommand: {
      templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
      createArguments: {
        marketId: `MARKET-${txId}`, transactionId: txId, creator: parties[0],
        participants: parties, deadline, votes: [], regulator: regParty, isOpen: true,
      },
    },
  }]);
  let market = findCreated(createRes, ':PredictionMarket');
  if (!market) throw new Error('Failed to create market');

  // 2. Submit votes from each bank
  for (const vote of votes) {
    const voteRes = await submitCommand(vote.userId, `vote-${txId}-${vote.key}`, [vote.party], [{
      ExerciseCommand: {
        templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
        contractId: market.contractId,
        choice: 'SubmitVote',
        choiceArgument: { voter: vote.party, confidence: vote.confidence.toFixed(10), stake: vote.weight.toFixed(10) },
      },
    }]);
    const next = findCreated(voteRes, ':PredictionMarket');
    if (!next) throw new Error(`Vote failed for ${vote.key}`);
    market = next;
  }

  // 3. Close market → produces RiskScore
  const closeRes = await submitCommand('banka', `close-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
      contractId: market.contractId,
      choice: 'CloseMarketEarly',
      choiceArgument: {},
    },
  }]);
  const riskScore = findCreated(closeRes, ':RiskScore');
  if (!riskScore) throw new Error('CloseMarket failed');

  // 4. Determine action → may produce SARReport
  const actionRes = await submitCommand('banka', `action-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:RiskScore`,
      contractId: riskScore.contractId,
      choice: 'DetermineAction',
      choiceArgument: {},
    },
  }]);
  const sar = findCreated(actionRes, ':SARReport');
  const score = parseFloat(riskScore.args.score) || 0;

  return {
    votes: votes.map(v => ({
      bank: v.name, confidence: Math.round(v.confidence * 1000) / 10, weight: v.weight, isRegulator: false, txId,
    })),
    riskScore: Math.round(score * 1000) / 10,
    contractIds: { market: market.contractId, riskScore: riskScore.contractId, sar: sar?.contractId || null },
  };
}

function runFallback(txId, base, variance, reps) {
  const votes = BANKS.map(b => {
    const rep = reps[b.key] || { score: 50 };
    const weight = reputationToWeight(rep.score);
    const confidence = Math.min(95, Math.max(15, Math.round((base + (Math.random() - 0.5) * variance * 2) * 100)));
    return { bank: b.name, confidence, weight, isRegulator: false, txId };
  });
  const totalWeight = votes.reduce((s, v) => s + v.weight, 0);
  const weightedSum = votes.reduce((s, v) => s + (v.confidence / 100) * v.weight, 0);
  return { votes, riskScore: Math.round((weightedSum / totalWeight) * 1000) / 10, contractIds: null };
}

// --- Handler ---

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method === 'GET') return res.json({ marketCount });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { scenario = 'high' } = req.body || {};
  const { base, variance } = SCENARIOS[scenario] || SCENARIOS.high;
  const txId = `TX-${Math.floor(Math.random() * 100000000)}`;
  const reps = await loadReputations();
  marketCount++;

  let result, onChain = false;
  try {
    result = await runOnChain(txId, base, variance, reps);
    onChain = true;
  } catch (err) {
    console.warn('On-chain failed, using fallback:', err.message);
    result = runFallback(txId, base, variance, reps);
  }

  const action = result.riskScore >= 80 ? 'BLOCK' : result.riskScore >= 60 ? 'REVIEW' : 'APPROVE';

  res.json({
    success: true, mode: 'canton-devnet', onChain, ledger: onChain,
    transactionId: txId, marketCount,
    contractIds: result.contractIds,
    market: {
      transactionId: txId, amount: 25000, destination: 'Binance (Crypto Exchange)',
      riskFlags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'],
      votes: [...result.votes, { bank: 'Regulator', confidence: 0, weight: 0, isRegulator: true, txId }],
      riskScore: result.riskScore, action,
    },
    riskScore: result.riskScore, action, parties: 5,
  });
}
