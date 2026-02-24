const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';
const PARTY_SUFFIX = '::122031dacd1d842e4499cf58bc1391ec402816ebc0edf2a240b0ff9322f7e7b97a3a';
const PKG = 'aml-network';

let cachedReputations = null;
let cacheTime = 0;
let marketCount = 47;

const BANKS = [
  { key: 'Bank_A', userId: 'banka', name: 'Bank A' },
  { key: 'Bank_B', userId: 'bankb', name: 'Bank B' },
  { key: 'Bank_C', userId: 'bankc', name: 'Bank C' },
  { key: 'Bank_D', userId: 'bankd', name: 'Bank D' },
];

async function cantonFetch(path, body) {
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) }
    : { signal: AbortSignal.timeout(5000) };
  const r = await fetch(`${CANTON_API}${path}`, opts);
  return r.json();
}

// Submit command and return transaction with events
async function cantonSubmit(userId, commandId, actAs, commands) {
  return cantonFetch('/v2/commands/submit-and-wait-for-transaction', {
    commands: { userId, commandId, actAs, commands }
  });
}

// Find a created event matching a template fragment
function findCreated(res, templateFragment) {
  const events = res?.transaction?.events || [];
  for (const evt of events) {
    const created = evt.CreatedEvent;
    if (created && String(created.templateId || '').includes(templateFragment)) {
      return { contractId: created.contractId, args: created.createArgument || {} };
    }
  }
  return null;
}

async function loadReputations() {
  if (cachedReputations && Date.now() - cacheTime < 60000) return cachedReputations;
  try {
    const { offset } = await cantonFetch('/v2/state/ledger-end');
    const data = await cantonFetch('/v2/state/active-contracts', {
      filter: { filtersByParty: {}, filtersForAnyParty: { cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }] } },
      verbose: true, activeAtOffset: offset
    });
    const reps = {};
    for (const item of (Array.isArray(data) ? data : [])) {
      const key = Object.keys(item.contractEntry || {})[0];
      if (!key) continue;
      const ce = item.contractEntry[key].createdEvent || {};
      if (!String(ce.templateId).includes(':BankReputation:')) continue;
      const args = ce.createArgument || {};
      const name = (args.bank || '').split('::')[0];
      reps[name] = { score: parseFloat(args.reputationScore) || 50, accuracy: parseFloat(args.accuracy) || 0.5 };
    }
    cachedReputations = reps;
    cacheTime = Date.now();
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

// Full on-chain flow: Create → Vote × 4 → CloseEarly → DetermineAction
async function runOnChain(txId, base, variance, reps) {
  const parties = BANKS.map(b => b.key + PARTY_SUFFIX);
  const regParty = 'Regulator' + PARTY_SUFFIX;
  const deadline = new Date(Date.now() + 600000).toISOString();

  const votes = BANKS.map((b, i) => {
    const rep = reps[b.key] || { score: 50 };
    const weight = reputationToWeight(rep.score);
    const confidence = Math.min(0.95, Math.max(0.15, base + (Math.random() - 0.5) * variance * 2));
    return { ...b, confidence, weight, party: parties[i] };
  });

  // 1. Create PredictionMarket
  const createRes = await cantonSubmit('banka', `create-${txId}`, [parties[0]], [{
    CreateCommand: {
      templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
      createArguments: {
        marketId: `MARKET-${txId}`, transactionId: txId, creator: parties[0],
        participants: parties, deadline, votes: [], regulator: regParty, isOpen: true
      }
    }
  }]);
  let market = findCreated(createRes, ':PredictionMarket:');
  if (!market) throw new Error('Failed to create market');

  // 2. Submit votes sequentially
  for (const vote of votes) {
    const voteRes = await cantonSubmit(vote.userId, `vote-${txId}-${vote.key}`, [vote.party], [{
      ExerciseCommand: {
        templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
        contractId: market.contractId,
        choice: 'SubmitVote',
        choiceArgument: { voter: vote.party, confidence: String(vote.confidence), stake: String(vote.weight) }
      }
    }]);
    const next = findCreated(voteRes, ':PredictionMarket:');
    if (!next) throw new Error(`Vote failed for ${vote.key}`);
    market = next;
  }

  // 3. Close market early (all votes in)
  const closeRes = await cantonSubmit('banka', `close-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
      contractId: market.contractId,
      choice: 'CloseMarketEarly',
      choiceArgument: {}
    }
  }]);
  const riskScoreContract = findCreated(closeRes, ':RiskScore:');
  if (!riskScoreContract) throw new Error('CloseMarketEarly failed');

  // 4. Determine action (auto-files SAR if score >= 0.8)
  const actionRes = await cantonSubmit('banka', `action-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:RiskScore`,
      contractId: riskScoreContract.contractId,
      choice: 'DetermineAction',
      choiceArgument: {}
    }
  }]);
  const sar = findCreated(actionRes, ':SARReport:');

  const onChainScore = parseFloat(riskScoreContract.args.score) || 0;

  return {
    votes: votes.map(v => ({
      bank: v.name, confidence: Math.round(v.confidence * 1000) / 10,
      weight: v.weight, isRegulator: false, txId
    })),
    riskScore: Math.round(onChainScore * 1000) / 10,
    contractIds: {
      market: market.contractId,
      riskScore: riskScoreContract.contractId,
      sar: sar?.contractId || null
    }
  };
}

// Fallback: compute locally
function runFallback(txId, base, variance, reps) {
  const votes = BANKS.map(b => {
    const rep = reps[b.key] || { score: 50 };
    const weight = reputationToWeight(rep.score);
    const confidence = Math.min(95, Math.max(15, Math.round((base + (Math.random() - 0.5) * variance * 2) * 100)));
    return { bank: b.name, confidence, weight, isRegulator: false, txId };
  });
  const totalWeight = votes.reduce((s, v) => s + v.weight, 0);
  const weightedSum = votes.reduce((s, v) => s + (v.confidence / 100) * v.weight, 0);
  const riskScore = Math.round((weightedSum / totalWeight) * 1000) / 10;
  return { votes, riskScore, contractIds: null };
}

export function getMarketCount() { return marketCount; }

export default async function handler(req, res) {
  if (req.method === 'GET') return res.json({ marketCount });
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { scenario = 'high' } = req.body || {};
  const scenarios = { high: { base: 0.85, variance: 0.08 }, medium: { base: 0.70, variance: 0.08 }, low: { base: 0.28, variance: 0.12 } };
  const { base, variance } = scenarios[scenario] || scenarios.high;
  const txId = `TX-${Math.floor(Math.random() * 100000000)}`;

  const reps = await loadReputations();
  marketCount++;

  let result, onChain = false;
  try {
    result = await runOnChain(txId, base, variance, reps);
    onChain = true;
  } catch (err) {
    console.warn('On-chain flow failed, using fallback:', err.message);
    result = runFallback(txId, base, variance, reps);
  }

  const allVotes = [...result.votes, { bank: 'Regulator', confidence: 0, weight: 0, isRegulator: true, txId }];
  const action = result.riskScore >= 80 ? 'BLOCK' : result.riskScore >= 60 ? 'REVIEW' : 'APPROVE';

  res.json({
    success: true, mode: 'canton-devnet', onChain, ledger: onChain,
    transactionId: txId, marketCount,
    contractIds: result.contractIds,
    market: {
      transactionId: txId, amount: 25000, destination: 'Binance (Crypto Exchange)',
      riskFlags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'],
      votes: allVotes, riskScore: result.riskScore, action
    },
    riskScore: result.riskScore, action, parties: 5
  });
}
