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

const loadParties = async () => {
  if (Object.keys(parties).length > 0) return;
  const res = await tenzro('/api/ledger/parties');
  for (const p of res.parties || []) {
    const key = p.partyId.split('::')[0];
    parties[key] = p.partyId;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  await loadParties();

  const { scenario = 'high' } = req.body;
  const scenarios = { high: { base: 0.85, variance: 0.08 }, medium: { base: 0.55, variance: 0.15 }, low: { base: 0.28, variance: 0.12 } };
  const { base, variance } = scenarios[scenario] || scenarios.high;

  const txId = `TX-${Math.floor(Math.random() * 100000000)}`;
  const deadline = new Date(Date.now() + 86400000).toISOString();

  try {
    const createRes = await tenzro('/api/ledger/contracts', {
      method: 'POST',
      body: JSON.stringify({
        partyId: parties.jpmorgan,
        templateId: 'PredictionMarket:PredictionMarket',
        payload: {
          marketId: `MARKET-${Date.now()}`, transactionId: txId, creator: parties.jpmorgan,
          participants: [parties.bofa, parties.wells, parties.citi],
          deadline, votes: {}, regulator: parties.fincen, isOpen: true
        }
      })
    });

    let contractId = createRes.contractId;
    const votes = [];
    const bankConfig = [
      { key: 'bofa', name: 'Bank of America', stake: 200 },
      { key: 'wells', name: 'Wells Fargo', stake: 150 },
      { key: 'citi', name: 'Citibank', stake: 120 },
      { key: 'jpmorgan', name: 'JPMorgan Chase', stake: 250 },
      { key: 'fincen', name: 'FinCEN', stake: 300, isRegulator: true }
    ];

    for (const bank of bankConfig) {
      const confidence = Math.min(0.95, Math.max(0.15, base + (Math.random() - 0.5) * variance * 2));
      const voteRes = await tenzro(`/api/ledger/contracts/${contractId}/exercise`, {
        method: 'POST',
        body: JSON.stringify({
          partyId: parties[bank.key], choice: 'SubmitVote',
          argument: { voter: parties[bank.key], confidence: confidence.toString(), stake: bank.stake.toString() }
        })
      });
      if (voteRes.createdContractIds?.[0]) contractId = voteRes.createdContractIds[0];
      votes.push({ bank: bank.name, confidence: Math.round(confidence * 100), stake: bank.stake, isRegulator: bank.isRegulator, txId: voteRes.transactionId });
    }

    const nonRegVotes = votes.filter(v => !v.isRegulator);
    const totalStake = nonRegVotes.reduce((s, v) => s + v.stake, 0);
    const weightedSum = nonRegVotes.reduce((s, v) => s + (v.confidence / 100) * v.stake, 0);
    const riskScore = Math.round((weightedSum / totalStake) * 1000) / 10;

    res.json({
      success: true, mode: 'canton-devnet', ledger: true,
      market: { transactionId: txId, contractId, amount: 25000, destination: 'Binance (Crypto Exchange)',
        riskFlags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'],
        votes, riskScore, action: riskScore >= 80 ? 'BLOCK' : riskScore >= 60 ? 'REVIEW' : 'APPROVE' }
    });
  } catch (err) {
    res.json({ success: false, error: err.message, mode: 'canton-devnet' });
  }
}
