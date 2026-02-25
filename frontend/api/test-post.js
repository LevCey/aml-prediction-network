const CANTON_API = 'http://46.224.56.32:7575';
const PARTY = 'Bank_A::122031dacd1d842e4499cf58bc1391ec402816ebc0edf2a240b0ff9322f7e7b97a3a';

export default async function handler(req, res) {
  const results = {};

  // Get offset first
  try {
    const r1 = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(5000) });
    const { offset } = await r1.json();
    results.offset = offset;

    // Test: single template filter (small response)
    const t2 = Date.now();
    const r2 = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: {
          filtersByParty: {
            [PARTY]: {
              cumulative: [
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:BankReputation:BankReputation', includeCreatedEventBlob: false } } } }
              ]
            }
          }
        },
        verbose: true,
        activeAtOffset: offset
      }),
      signal: AbortSignal.timeout(15000)
    });
    const text = await r2.text();
    results.singleTemplate = { ok: true, ms: Date.now() - t2, size: text.length, status: r2.status, preview: text.slice(0, 200) };

    // Test: full 4-template filter (same as contracts.js)
    const t3 = Date.now();
    const r3 = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: {
          filtersByParty: {
            [PARTY]: {
              cumulative: [
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:BankReputation:BankReputation', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:RiskScore', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:SARReport', includeCreatedEventBlob: false } } } },
                { identifierFilter: { TemplateFilter: { value: { templateId: '#aml-network:PredictionMarket:PredictionMarket', includeCreatedEventBlob: false } } } }
              ]
            }
          }
        },
        verbose: true,
        activeAtOffset: offset
      }),
      signal: AbortSignal.timeout(15000)
    });
    const text3 = await r3.text();
    results.fullQuery = { ok: true, ms: Date.now() - t3, size: text3.length, status: r3.status };
  } catch (e) {
    results.error = e.message;
  }

  res.json(results);
}
