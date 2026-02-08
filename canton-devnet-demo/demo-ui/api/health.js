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

export default async function handler(req, res) {
  const result = await tenzro('/api/ledger/parties');
  res.json({ status: 'ok', mode: 'canton-devnet', parties: result.parties?.length || 0 });
}
