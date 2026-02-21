const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${CANTON_API}/v2/users`, { signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    const parties = (data.users || [])
      .filter(u => ['banka','bankb','bankc','bankd','regulator'].includes(u.id))
      .map(u => ({
        name: (u.primaryParty || '').split('::')[0].replace(/_/g, ' '),
        partyId: u.primaryParty || '',
        isRegulator: u.id === 'regulator'
      }));
    res.json({ success: true, mode: 'canton-devnet', parties });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}
