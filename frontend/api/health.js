const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${CANTON_API}/v2/users`, { signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    const amlUsers = (data.users || []).filter(u => ['banka','bankb','bankc','bankd','regulator'].includes(u.id));
    res.json({ status: 'ok', mode: 'canton-devnet', parties: amlUsers.length });
  } catch {
    res.json({ status: 'error', mode: 'canton-devnet' });
  }
}
