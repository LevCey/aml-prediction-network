const TENZRO_API = 'https://api.platform.tenzro.com';
const API_KEY = process.env.TENZRO_API_KEY;
const TENANT_ID = process.env.TENZRO_TENANT_ID;

export default async function handler(req, res) {
  try {
    const r = await fetch(`${TENZRO_API}/api/ledger/parties`, {
      headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID }
    });
    const data = await r.json();
    
    const parties = (data.parties || []).map(p => ({
      name: p.displayName.replace(/_/g, ' '),
      partyId: p.partyId,
      isRegulator: p.displayName === 'FinCEN'
    }));

    res.json({ success: true, mode: 'canton-devnet', parties });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}
