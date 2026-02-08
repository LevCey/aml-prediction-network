import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Tenzro Config
const TENZRO_API = 'https://api.platform.tenzro.com';
const API_KEY = process.env.TENZRO_API_KEY;
const TENANT_ID = process.env.TENZRO_TENANT_ID;

if (!API_KEY || !TENANT_ID) {
  console.error('Missing TENZRO_API_KEY or TENZRO_TENANT_ID. Copy .env.tenzro.example to .env.tenzro and fill in credentials.');
  process.exit(1);
}

const tenzro = async (endpoint, options = {}) => {
  const res = await fetch(`${TENZRO_API}${endpoint}`, {
    ...options,
    headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID, 'Content-Type': 'application/json', ...options.headers }
  });
  return res.json();
};

// Cache parties
let parties = {};
const loadParties = async () => {
  const res = await tenzro('/api/ledger/parties');
  for (const p of res.parties || []) {
    const key = p.displayName.toLowerCase().replace(/_/g, '');
    parties[key] = p.partyId;
  }
  console.log('Parties loaded:', Object.keys(parties));
};

// Health check
app.get('/api/health', async (req, res) => {
  const result = await tenzro('/api/ledger/parties');
  res.json({ status: 'ok', mode: 'tenzro-devnet', parties: result.parties?.length || 0 });
});

// Get parties
app.get('/api/parties', async (req, res) => {
  const result = await tenzro('/api/ledger/parties');
  const list = (result.parties || []).map(p => ({
    name: p.displayName.replace(/_/g, ' '),
    identifier: p.partyId,
    isRegulator: p.displayName === 'FinCEN'
  }));
  res.json({ success: true, parties: list, mode: 'tenzro-devnet' });
});

// Run full demo on Tenzro DevNet
app.post('/api/demo', async (req, res) => {
  const { scenario = 'high' } = req.body;
  const scenarios = { high: { base: 0.78, variance: 0.12 }, medium: { base: 0.55, variance: 0.15 }, low: { base: 0.28, variance: 0.12 } };
  const { base, variance } = scenarios[scenario] || scenarios.high;

  const txId = `TX-${Math.floor(Math.random() * 100000000)}`;
  const marketId = `MARKET-${Date.now()}`;
  const deadline = new Date(Date.now() + 86400000).toISOString();

  try {
    // Create PredictionMarket contract
    const createRes = await tenzro('/api/ledger/contracts', {
      method: 'POST',
      body: JSON.stringify({
        partyId: parties.jpmorganchase,
        templateId: 'PredictionMarket:PredictionMarket',
        payload: {
          marketId, transactionId: txId, creator: parties.jpmorganchase,
          participants: [parties.bankofamerica, parties.wellsfargo, parties.citibank],
          deadline, votes: {}, regulator: parties.fincen, isOpen: true
        }
      })
    });

    let contractId = createRes.contractId;
    const votes = [];
    const bankConfig = [
      { key: 'bankofamerica', name: 'Bank of America', stake: 200 },
      { key: 'wellsfargo', name: 'Wells Fargo', stake: 150 },
      { key: 'citibank', name: 'Citibank', stake: 120 },
      { key: 'jpmorganchase', name: 'JPMorgan Chase', stake: 250 },
      { key: 'fincen', name: 'FinCEN', stake: 300, isRegulator: true }
    ];

    // Submit votes
    for (const bank of bankConfig) {
      const confidence = Math.min(0.95, Math.max(0.15, base + (Math.random() - 0.5) * variance * 2));
      
      const voteRes = await tenzro(`/api/ledger/contracts/${contractId}/exercise`, {
        method: 'POST',
        body: JSON.stringify({
          partyId: parties[bank.key],
          choice: 'SubmitVote',
          argument: { voter: parties[bank.key], confidence: confidence.toString(), stake: bank.stake.toString() }
        })
      });

      // Daml returns new contract ID after each choice
      if (voteRes.createdContractIds?.[0]) contractId = voteRes.createdContractIds[0];
      
      votes.push({ bank: bank.name, confidence: Math.round(confidence * 100), stake: bank.stake, isRegulator: bank.isRegulator, txId: voteRes.transactionId });
    }

    // Calculate weighted risk score
    const totalStake = votes.reduce((s, v) => s + v.stake, 0);
    const weightedSum = votes.reduce((s, v) => s + (v.confidence / 100) * v.stake, 0);
    const riskScore = Math.round((weightedSum / totalStake) * 1000) / 10;

    res.json({
      success: true,
      mode: 'tenzro-devnet',
      ledger: true,
      market: {
        marketId, transactionId: txId, contractId,
        amount: 25000, destination: 'Binance (Crypto Exchange)',
        riskFlags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'],
        votes, riskScore,
        action: riskScore >= 80 ? 'BLOCK' : riskScore >= 60 ? 'REVIEW' : 'APPROVE'
      }
    });
  } catch (err) {
    res.json({ success: false, error: err.message, mode: 'tenzro-devnet' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`AML Backend [TENZRO DEVNET] on port ${PORT}`);
  await loadParties();
});
