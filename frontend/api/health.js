const CANTON_API = process.env.BACKEND_URL || process.env.CANTON_API_URL;
const API_KEY = process.env.API_KEY;
const AML_USERS = ['banka', 'bankb', 'bankc', 'bankd', 'regulator'];

export default async function handler(req, res) {
  try {
    const headers = {};
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
    const r = await fetch(`${CANTON_API}/v2/users`, { headers, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`Canton API returned ${r.status}`);
    const { users = [] } = await r.json();
    const count = users.filter(u => AML_USERS.includes(u.id)).length;
    res.json({ status: 'ok', mode: 'canton-devnet', parties: count });
  } catch {
    res.status(502).json({ status: 'error', mode: 'canton-devnet' });
  }
}
