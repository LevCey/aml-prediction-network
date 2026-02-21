const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';

export default async function handler(req, res) {
  try {
    const r = await fetch(`${CANTON_API}/v2/parties`, { signal: AbortSignal.timeout(5000) });
    const data = await r.json();
    const parties = (data.partyDetails || [])
      .filter(p => !p.party.startsWith('amlprediction-validator'))
      .map(p => ({
        name: p.party.split('::')[0].replace(/_/g, ' '),
        partyId: p.party,
        isRegulator: p.party.startsWith('Regulator')
      }));
    res.json({ success: true, mode: 'canton-devnet', parties });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}
