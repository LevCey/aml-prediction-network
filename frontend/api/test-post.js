const CANTON_API = 'http://46.224.56.32:7575';

export default async function handler(req, res) {
  const results = {};
  
  // Test 1: GET ledger-end
  try {
    const t1 = Date.now();
    const r1 = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(8000) });
    results.ledgerEnd = { ok: true, ms: Date.now() - t1, data: await r1.json() };
  } catch (e) {
    results.ledgerEnd = { ok: false, error: e.message };
  }

  // Test 2: Minimal POST to active-contracts (no filter, just see if POST works)
  try {
    const t2 = Date.now();
    const r2 = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: { filtersByParty: {} }, verbose: false }),
      signal: AbortSignal.timeout(15000)
    });
    const text = await r2.text();
    results.minimalPost = { ok: true, ms: Date.now() - t2, size: text.length, status: r2.status };
  } catch (e) {
    results.minimalPost = { ok: false, error: e.message };
  }

  res.json(results);
}
