const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';
const PARTY_SUFFIX = '::122031dacd1d842e4499cf58bc1391ec402816ebc0edf2a240b0ff9322f7e7b97a3a';
const PKG = 'aml-network';

let cachedReputations = null;
let cacheTime = 0;
let marketCount = 47;
let httpAgent = null;

const BANKS = [
  { key: 'Bank_A', userId: 'banka', name: 'Bank A' },
  { key: 'Bank_B', userId: 'bankb', name: 'Bank B' },
  { key: 'Bank_C', userId: 'bankc', name: 'Bank C' },
  { key: 'Bank_D', userId: 'bankd', name: 'Bank D' },
];

// Lazy-init keep-alive agent (Canton DevNet has ~4 connection limit)
function getAgent() {
  if (!httpAgent) {
    try {
      const http = require('http');
      httpAgent = new http.Agent({ keepAlive: true, maxSockets: 1 });
    } catch { httpAgent = false; }
  }
  return httpAgent || undefined;
}

async function cantonFetch(path, body, method = 'POST') {
  const agent = getAgent();
  const url = `${CANTON_API}${path}`;

  // Use node:http for keep-alive if available, otherwise fetch
  if (agent) {
    const http = require('http');
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : '';
      const parsed = new URL(url);
      const req = http.request({
        hostname: parsed.hostname, port: parsed.port, path: parsed.pathname,
        method, agent,
        headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
        timeout: 15000
      }, res => {
        let buf = '';
        res.on('data', c => buf += c);
        res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { reject(new Error('Parse error')); } });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      if (body) req.write(data);
      req.end();
    });
  }

  // Fallback to fetch
  const opts = body
    ? { method, headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) }
    : { method, headers: { 'Connection': 'keep-alive' }, signal: AbortSignal.timeout(8000) };
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`Canton ${r.status}`);
  return r.json();
}

async function cantonSubmit(userId, commandId, actAs, commands) {
  return cantonFetch('/v2/commands/submit-and-wait-for-transaction', {
    commands: { userId, commandId, actAs, commands }
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

function findCreated(res, templateFragment) {
  for (const evt of (res?.transaction?.events || [])) {
    const c = evt.CreatedEvent;
    if (c && String(c.templateId || '').includes(templateFragment))
      return { contractId: c.contractId, args: c.createArgument || {} };
  }
  return null;
}

async function loadReputations() {
  if (cachedReputations && Date.now() - cacheTime < 60000) return cachedReputations;
  try {
    const { offset } = await cantonFetch('/v2/state/ledger-end', null, 'GET');
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

async function runOnChain(txId, base, variance, reps) {
  const parties = BANKS.map(b => b.key + PARTY_SUFFIX);
  const regParty = 'Regulator' + PARTY_SUFFIX;
  const DEADLINE_SECS = 25;
  const deadline = new Date(Date.now() + DEADLINE_SECS * 1000).toISOString();
  const startTime = Date.now();

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
  let market = findCreated(createRes, ':PredictionMarket');
  if (!market) throw new Error('Failed to create market');

  // 2. Submit votes
  for (const vote of votes) {
    const voteRes = await cantonSubmit(vote.userId, `vote-${txId}-${vote.key}`, [vote.party], [{
      ExerciseCommand: {
        templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
        contractId: market.contractId,
        choice: 'SubmitVote',
        choiceArgument: { voter: vote.party, confidence: vote.confidence.toFixed(10), stake: vote.weight.toFixed(10) }
      }
    }]);
    const next = findCreated(voteRes, ':PredictionMarket');
    if (!next) throw new Error(`Vote failed for ${vote.key}`);
    market = next;
  }

  // 3. Wait for deadline then close
  const elapsed = Date.now() - startTime;
  const waitMs = Math.max(0, (DEADLINE_SECS * 1000 + 1000) - elapsed);
  if (waitMs > 0) await delay(waitMs);

  const closeRes = await cantonSubmit('banka', `close-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:PredictionMarket`,
      contractId: market.contractId,
      choice: 'CloseMarket',
      choiceArgument: {}
    }
  }]);
  const riskScoreContract = findCreated(closeRes, ':RiskScore');
  if (!riskScoreContract) throw new Error('CloseMarket failed');

  // 4. Determine action
  const actionRes = await cantonSubmit('banka', `action-${txId}`, [parties[0]], [{
    ExerciseCommand: {
      templateId: `#${PKG}:PredictionMarket:RiskScore`,
      contractId: riskScoreContract.contractId,
      choice: 'DetermineAction',
      choiceArgument: {}
    }
  }]);
  const sar = findCreated(actionRes, ':SARReport');
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

export const config = { maxDuration: 60 };

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
    console.warn('On-chain failed:', err.message);
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
