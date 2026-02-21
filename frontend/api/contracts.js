const CANTON_API = process.env.CANTON_API_URL || 'http://46.224.56.32:7575';

async function getOffset() {
  const r = await fetch(`${CANTON_API}/v2/state/ledger-end`, { signal: AbortSignal.timeout(5000) });
  const d = await r.json();
  return d.offset;
}

async function getActiveContracts(offset) {
  const r = await fetch(`${CANTON_API}/v2/state/active-contracts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        filtersByParty: {},
        filtersForAnyParty: {
          cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }]
        }
      },
      verbose: true,
      activeAtOffset: offset
    }),
    signal: AbortSignal.timeout(10000)
  });
  return r.json();
}

export default async function handler(req, res) {
  try {
    const offset = await getOffset();
    const data = await getActiveContracts(offset);
    const entries = Array.isArray(data) ? data : [];

    const contracts = entries
      .map(item => {
        const key = Object.keys(item.contractEntry || {})[0];
        if (!key) return null;
        const ce = item.contractEntry[key].createdEvent || {};
        return { templateId: ce.templateId || '', contractId: ce.contractId || '', args: ce.createArgument || {} };
      })
      .filter(c => c && c.templateId.includes(':BankReputation:') || c.templateId.includes(':PredictionMarket:'))
      .map(c => {
        const mod = c.templateId.split(':')[1];
        return {
          contractId: c.contractId.slice(0, 16),
          template: mod,
          ...(mod === 'BankReputation' ? {
            bank: (c.args.bank || '').split('::')[0].replace(/_/g, ' '),
            reputationScore: parseFloat(c.args.reputationScore) || 0,
            accuracy: parseFloat(c.args.accuracy) || 0
          } : {
            transactionId: c.args.transactionId,
            isOpen: c.args.isOpen
          })
        };
      });

    res.json({ success: true, mode: 'canton-devnet', totalContracts: entries.length, contracts });
  } catch (err) {
    res.json({ success: false, error: err.message, totalContracts: 0 });
  }
}
