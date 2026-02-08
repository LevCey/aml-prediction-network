const TENZRO_API = 'https://api.platform.tenzro.com';
const API_KEY = process.env.TENZRO_API_KEY;
const TENANT_ID = process.env.TENZRO_TENANT_ID;

export default async function handler(req, res) {
  try {
    const r = await fetch(`${TENZRO_API}/api/ledger/parties`, {
      headers: { 'X-API-Key': API_KEY, 'X-Tenant-Id': TENANT_ID }
    });
    const data = await r.json();
    res.json({ status: 'ok', mode: 'canton-devnet', parties: data.parties?.length || 0 });
  } catch (err) {
    res.json({ status: 'error', error: err.message });
  }
}
