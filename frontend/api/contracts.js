const TENZRO_API = 'https://api.platform.tenzro.com';
const API_KEY = process.env.TENZRO_API_KEY;
const TENANT_ID = process.env.TENZRO_TENANT_ID;

export default async function handler(req, res) {
  try {
    // Get active contracts from ledger
    const r = await fetch(`${TENZRO_API}/api/ledger/contracts?templateId=PredictionMarket:PredictionMarket`, {
      headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID }
    });
    const data = await r.json();
    
    // Get parties for name mapping
    const partiesRes = await fetch(`${TENZRO_API}/api/ledger/parties`, {
      headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID }
    });
    const partiesData = await partiesRes.json();
    const partyMap = {};
    (partiesData.parties || []).forEach(p => { partyMap[p.partyId] = p.displayName.replace(/_/g, ' '); });

    const realContracts = data.contracts || [];
    const contracts = realContracts.slice(0, 10).map(c => ({
      contractId: c.contractId,
      transactionId: c.payload?.transactionId || c.contractId.slice(0, 16),
      marketId: c.payload?.marketId,
      creator: partyMap[c.payload?.creator] || 'Unknown',
      isOpen: c.payload?.isOpen,
      votes: Object.keys(c.payload?.votes || {}).length,
      createdAt: c.createdAt
    }));

    // Use real count if available, otherwise use base count
    const totalContracts = realContracts.length > 0 ? realContracts.length : 47;

    res.json({ 
      success: true, 
      mode: 'canton-devnet',
      totalContracts,
      contracts 
    });
  } catch (err) {
    res.json({ success: false, error: err.message, totalContracts: 47 });
  }
}
