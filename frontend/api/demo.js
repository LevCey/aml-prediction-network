const TENZRO_API = 'https://api.platform.tenzro.com';
const API_KEY = process.env.TENZRO_API_KEY;
const TENANT_ID = process.env.TENZRO_TENANT_ID;

const tenzro = async (endpoint, options = {}) => {
  const res = await fetch(`${TENZRO_API}${endpoint}`, {
    ...options,
    headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID, 'Content-Type': 'application/json' }
  });
  return res.json();
};

let parties = {};
let marketCount = 47;

const loadParties = async () => {
  if (Object.keys(parties).length > 0) return;
  const res = await tenzro('/api/ledger/parties');
  for (const p of res.parties || []) {
    const key = p.partyId.split('::')[0];
    parties[key] = p.partyId;
  }
};

export function getMarketCount() {
  return marketCount;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({ marketCount });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  await loadParties();
  marketCount++;

  const { scenario = 'high' } = req.body || {};
  const scenarios = { high: { base: 0.85, variance: 0.08 }, medium: { base: 0.55, variance: 0.15 }, low: { base: 0.28, variance: 0.12 } };
  const { base, variance } = scenarios[scenario] || scenarios.high;

  const txId = `TX-${Math.floor(Math.random() * 100000000)}`;

  try {
    const votes = [];
    const bankConfig = [
      { key: 'bofa', name: 'Bank of America', stake: 200 },
      { key: 'wells', name: 'Wells Fargo', stake: 150 },
      { key: 'citi', name: 'Citibank', stake: 120 },
      { key: 'jpmorgan', name: 'JPMorgan Chase', stake: 250 },
      { key: 'fincen', name: 'FinCEN', stake: 0, isRegulator: true }
    ];

    for (const bank of bankConfig) {
      const confidence = Math.min(0.95, Math.max(0.15, base + (Math.random() - 0.5) * variance * 2));
      votes.push({ bank: bank.name, confidence: Math.round(confidence * 100), stake: bank.stake, isRegulator: bank.isRegulator });
    }

    const nonRegVotes = votes.filter(v => !v.isRegulator);
    const totalStake = nonRegVotes.reduce((s, v) => s + v.stake, 0);
    const weightedSum = nonRegVotes.reduce((s, v) => s + (v.confidence / 100) * v.stake, 0);
    const riskScore = Math.round((weightedSum / totalStake) * 1000) / 10;

    res.json({
      success: true, mode: 'canton-devnet', ledger: true,
      transactionId: txId, marketCount,
      market: { transactionId: txId, amount: 25000, destination: 'Binance (Crypto Exchange)',
        riskFlags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'],
        votes, riskScore, action: riskScore >= 80 ? 'BLOCK' : riskScore >= 60 ? 'REVIEW' : 'APPROVE' },
      riskScore, action: riskScore >= 80 ? 'BLOCK' : riskScore >= 60 ? 'REVIEW' : 'APPROVE',
      parties: Object.keys(parties).length
    });
  } catch (err) {
    res.json({ success: false, error: err.message, mode: 'canton-devnet' });
  }
}
