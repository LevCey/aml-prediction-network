import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Demo from './Demo';

// --- Types ---

interface Vote {
  voter: string;
  confidence: number;
  weight: number;
}

interface Contract {
  contractId: string;
  fullContractId?: string;
  template: string;
  createdAt?: string;
  ledgerOffset?: number;
  transactionId?: string;
  isOpen?: boolean;
  creator?: string;
  votes?: Vote[];
  riskScore?: number;
  bank?: string;
  reputationScore?: number;
  accuracy?: number;
  actionTaken?: string | null;
  sarFiled?: boolean;
  status?: string;
}

interface Party {
  name: string;
  partyId: string;
  isRegulator: boolean;
}

interface DevnetState {
  connected: boolean;
  totalContracts: number;
  contracts: Contract[];
  parties: Party[];
}

// --- Helpers ---

function riskAction(score: number): string {
  if (score >= 80) return 'BLOCKED';
  if (score >= 60) return 'REVIEW';
  return 'APPROVED';
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function ContractId({ contract }: { contract: Contract }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <span className="contract-id-wrap" onClick={() => setExpanded(!expanded)} title="Click to show full on-chain contract ID">
      {expanded ? (
        <code className="contract-id-full">{contract.fullContractId}</code>
      ) : (
        <span className="contract-id">{contract.transactionId || contract.contractId}</span>
      )}
      {contract.ledgerOffset && <span className="ledger-offset">Ledger #{contract.ledgerOffset.toLocaleString()}</span>}
    </span>
  );
}

function byTemplate(contracts: Contract[], template: string): Contract[] {
  return contracts.filter(c => c.template === template);
}

// --- App ---

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// --- Main Dashboard ---

function MainDashboard() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'market' | 'patterns' | 'regulator'>('dashboard');
  const [devnet, setDevnet] = useState<DevnetState>({ connected: false, totalContracts: 0, contracts: [], parties: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (fresh = false) => {
    const suffix = fresh ? `?fresh=1&t=${Date.now()}` : '';
    try {
      const [health, contracts, parties] = await Promise.all([
        fetch(`/api/health${suffix}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/contracts${suffix}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`/api/parties${suffix}`, { cache: 'no-store' }).then(r => r.json()),
      ]);
      setDevnet({
        connected: health.status === 'ok',
        totalContracts: contracts.totalContracts || 0,
        contracts: contracts.contracts || [],
        parties: parties.parties || [],
      });
      setLastUpdated(new Date());
    } catch {
      setDevnet({ connected: false, totalContracts: 0, contracts: [], parties: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 15000);

    const onFocus = () => fetchData(true);
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData(true);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const tabs = [
    { key: 'dashboard' as const, label: 'Dashboard' },
    { key: 'market' as const, label: 'Risk Signals' },
    { key: 'patterns' as const, label: 'Fraud Patterns' },
    { key: 'regulator' as const, label: 'Regulator View' },
  ];

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <img src="/logo.jpg" alt="AML" className="header-logo" />
          <div>
            <h1>AML Prediction Network</h1>
            <p className="subtitle">From Shared Ledgers to Shared Judgment | Built on Canton Network</p>
          </div>
        </div>
        <div className="header-right">
          <div className="devnet-status">
            <span className={`status-dot ${devnet.connected ? 'connected' : ''}`}></span>
            <span>Canton DevNet</span>
            {devnet.connected && <span className="contract-count">{devnet.totalContracts} contracts</span>}
            {lastUpdated && <span className="last-updated">{lastUpdated.toLocaleTimeString()}</span>}
            <button className="refresh-btn" onClick={() => fetchData(true)} title="Refresh data">↻</button>
          </div>
          <Link to="/demo" className="live-demo-btn">⚡ Live Demo</Link>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={selectedTab === t.key ? 'tab active' : 'tab'} onClick={() => setSelectedTab(t.key)}>{t.label}</button>
        ))}
      </nav>

      <main className="content">
        {selectedTab === 'dashboard' && <DashboardView devnet={devnet} loading={loading} />}
        {selectedTab === 'market' && <PredictionMarketView devnet={devnet} />}
        {selectedTab === 'patterns' && <PatternsView />}
        {selectedTab === 'regulator' && <RegulatorView devnet={devnet} />}
      </main>

      <footer className="footer">
        <p>🏆 Canton Construct 2025 Winner — Catalyst Mentorship 2026</p>
      </footer>
    </div>
  );
}

// --- Dashboard View ---

function DashboardView({ devnet, loading }: { devnet: DevnetState; loading: boolean }) {
  const riskScores = byTemplate(devnet.contracts, 'RiskScore');
  const openMarkets = byTemplate(devnet.contracts, 'PredictionMarket');
  const sarReports = byTemplate(devnet.contracts, 'SARReport');
  const reputations = byTemplate(devnet.contracts, 'BankReputation');
  const assessments = [...riskScores, ...openMarkets].sort((a, b) => 
    (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  const parties = devnet.parties.length > 0 ? devnet.parties : [
    { name: 'Regulator', partyId: '', isRegulator: true },
    { name: 'Bank A', partyId: '', isRegulator: false },
    { name: 'Bank B', partyId: '', isRegulator: false },
    { name: 'Bank C', partyId: '', isRegulator: false },
    { name: 'Bank D', partyId: '', isRegulator: false },
  ];

  return (
    <div className="dashboard">
      <h2>Network Overview</h2>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-value">{devnet.totalContracts}</div>
          <div className="stat-label">ACTIVE CONTRACTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{parties.filter(p => !p.isRegulator).length}</div>
          <div className="stat-label">INSTITUTIONS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sarReports.length}</div>
          <div className="stat-label">SAR REPORTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{riskScores.filter(c => (c.riskScore ?? 0) >= 80).length}</div>
          <div className="stat-label">BLOCKED</div>
        </div>
      </div>

      <h3>Network Participants</h3>
      <div className="participants-grid">
        {parties.map((party, i) => {
          const rep = reputations.find(r => r.bank === party.name);
          return (
            <div key={i} className={`participant-card ${party.isRegulator ? 'regulator' : ''}`}>
              <span className="participant-icon">{party.isRegulator ? '🏛️' : '🏦'}</span>
              <div className="participant-info">
                <span className="participant-name">{party.name}</span>
                <span className="participant-type">
                  {party.isRegulator ? 'Regulator' : rep ? `Score ${rep.reputationScore}% · Accuracy ${Math.round((rep.accuracy || 0) * 100)}%` : 'Bank'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <h3>Recent Risk Assessments {loading && '(loading...)'} <span className="live-feed-badge">● Live Feed</span></h3>
      <div className="contracts-list">
        {assessments.length > 0 ? assessments.slice(0, 10).map((c, i) => {
          const score = c.riskScore ?? 0;
          const action = riskAction(score);
          return (
            <div key={i} className="contract-card">
              <div className="contract-header">
                <ContractId contract={c} />
                <span className={`contract-status ${c.isOpen ? 'open' : 'closed'}`}>
                  {c.template === 'PredictionMarket' ? '● ACTIVE' : '● RESOLVED'}
                </span>
              </div>
              <div className="contract-details">
                <span><strong>Type:</strong> {c.template}</span>
                {c.createdAt && <span className="contract-time">{formatTime(c.createdAt)}</span>}
                {c.creator && <span><strong>Creator:</strong> {c.creator}</span>}
                {c.votes && <span><strong>Votes:</strong> {c.votes.length}</span>}
                {c.riskScore != null && <span className={`risk-colored ${c.riskScore >= 80 ? 'risk-high' : c.riskScore >= 60 ? 'risk-medium' : 'risk-low'}`}><strong>Risk: {c.riskScore}%</strong></span>}
                {c.template === 'RiskScore' && <span className={`action-badge ${action.toLowerCase()}`}>{action}</span>}
              </div>
            </div>
          );
        }) : (
          <div className="contract-card">
            <div className="contract-details">
              <span>{devnet.connected ? 'No active risk assessments on DevNet' : 'Connecting to DevNet...'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="privacy-note canton-privacy">
        <strong>🔒 Privacy by Design:</strong> Transactions on Canton are visible only to authorized participants.
        There is no public, permissionless block explorer. Access is governed by participant entitlements.
        Click a transaction ID to view its on-chain contract reference.
      </div>
    </div>
  );
}

function PredictionMarketView({ devnet }: { devnet: DevnetState }) {
  const [showInfo, setShowInfo] = useState(false);
  const riskScores = byTemplate(devnet.contracts, 'RiskScore');
  const openMarkets = byTemplate(devnet.contracts, 'PredictionMarket');
  const reputations = byTemplate(devnet.contracts, 'BankReputation');
  const sortedScores = [...riskScores].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const blockedCount = riskScores.filter(c => (c.riskScore ?? 0) >= 80).length;
  const avgAccuracy = reputations.length > 0
    ? Math.round(reputations.reduce((s, r) => s + (r.accuracy || 0), 0) / reputations.length * 100)
    : 0;

  return (
    <div className="prediction-market">
      <h2>Risk Signal Aggregation on Canton</h2>

      <div className="market-info-box collapsible" onClick={() => setShowInfo(!showInfo)}>
        <h3>ℹ️ How It Works {showInfo ? '▼' : '▶'}</h3>
        {showInfo && <p>Participating institutions submit confidential risk signals on suspicious transactions. Signals are weighted by institutional reputation and aggregated into a network-wide risk score. Commitments are recorded on Canton Network to ensure an immutable audit trail.</p>}
      </div>

      <div className="market-stats">
        <div className="market-stat"><span className="stat-num">{riskScores.length + openMarkets.length}</span><span className="stat-lbl">Total Markets</span></div>
        <div className="market-stat"><span className="stat-num">{blockedCount}</span><span className="stat-lbl">Blocked</span></div>
        <div className="market-stat"><span className="stat-num">{avgAccuracy > 0 ? `${avgAccuracy}%` : '—'}</span><span className="stat-lbl">Avg Accuracy</span></div>
        <div className="market-stat"><span className="stat-num">{riskScores.length}</span><span className="stat-lbl">Resolved</span></div>
      </div>

      {openMarkets.length > 0 && (
        <>
          <h3>Active Markets</h3>
          <div className="markets-list">
            {openMarkets.map((m, i) => (
              <div key={i} className="market-card active">
                <div className="market-header">
                  <div className="market-title">
                    <span className="market-tx">{m.transactionId}</span>
                    <span className="market-amount">Creator: {m.creator}</span>
                  </div>
                  <span className="market-status active">● ACTIVE</span>
                </div>
                {m.votes && m.votes.length > 0 && (
                  <div className="market-votes">
                    {m.votes.map((v, j) => (
                      <div key={j} className="vote-item">
                        <span className="vote-bank">🏦 {v.voter}</span>
                        <div className="vote-bar-wrap">
                          <div className="vote-bar-bg">
                            <div className="vote-bar-fill" style={{ width: `${v.confidence}%`, background: v.confidence > 70 ? '#ef4444' : v.confidence > 50 ? '#f59e0b' : '#22c55e' }}></div>
                          </div>
                          <span className="vote-pct">{v.confidence}%</span>
                        </div>
                        <span className="vote-weight">w: {v.weight}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="market-footer">
                  <span className="risk-score">Votes: <strong>{m.votes?.length || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>Resolved Assessments <span className="live-feed-badge">● Live Feed</span></h3>
      <div className="resolved-grid">
        {sortedScores.length > 0 ? sortedScores.slice(0, 14).map((m, i) => {
          const score = m.riskScore ?? 0;
          const action = riskAction(score);
          return (
            <div key={i} className="market-card resolved">
              <div className="market-header">
                <div className="market-title"><ContractId contract={m} /></div>
                <span className="market-status resolved">● RESOLVED</span>
              </div>
              <div className="market-footer">
                <span className={`risk-colored ${score >= 80 ? 'risk-high' : score >= 60 ? 'risk-medium' : 'risk-low'}`}>Risk Score: <strong>{score}%</strong></span>
                <span className={`action-badge ${action.toLowerCase()}`}>{action}</span>
                {m.createdAt && <span className="contract-time">{formatTime(m.createdAt)}</span>}
              </div>
            </div>
          );
        }) : (
          <div className="contract-card">
            <div className="contract-details"><span>{devnet.connected ? 'No resolved assessments yet' : 'Connecting to DevNet...'}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Patterns View (reference library — TransactionPattern not deployed on DevNet) ---

const FRAUD_PATTERNS = [
  { name: 'Classic Structuring', category: 'Structuring', detected: 12, accuracy: 94, sharedBy: 4 },
  { name: 'Crypto Exchange Laundering', category: 'Layering', detected: 8, accuracy: 87, sharedBy: 3 },
  { name: 'Smurfing Network', category: 'Smurfing', detected: 5, accuracy: 91, sharedBy: 3 },
  { name: 'Shell Company Transfers', category: 'Layering', detected: 3, accuracy: 82, sharedBy: 2 },
  { name: 'Rapid Cross-Border Movement', category: 'Integration', detected: 6, accuracy: 79, sharedBy: 4 },
];

function PatternsView() {
  const [showProcess, setShowProcess] = useState(false);

  return (
    <div className="patterns">
      <h2>Fraud Pattern Library</h2>
      <p className="section-subtitle">Reference patterns used for behavioral matching across the network</p>

      <div className="patterns-grid">
        {FRAUD_PATTERNS.map((pattern, i) => (
          <div key={i} className="pattern-card">
            <div className="pattern-header">
              <h4>{pattern.name}</h4>
              <span className={`pattern-category ${pattern.category.toLowerCase()}`}>{pattern.category}</span>
            </div>
            <div className="pattern-stats">
              <div className="pattern-stat">
                <span className="stat-number">{pattern.detected}</span>
                <span className="stat-text">Times Detected</span>
              </div>
              <div className="pattern-stat" title="Historical detection precision across participating institutions">
                <span className="stat-number">{pattern.accuracy}%</span>
                <span className="stat-text">Accuracy ⓘ</span>
              </div>
            </div>
            <div className="pattern-meta">Shared by {pattern.sharedBy} institutions</div>
          </div>
        ))}
      </div>

      <div className="market-info-box collapsible" onClick={() => setShowProcess(!showProcess)}>
        <h3>ℹ️ How Cross-Institution Pattern Sharing Works {showProcess ? '▼' : '▶'}</h3>
        {showProcess && (
          <ol className="pattern-process">
            <li><strong>Detection:</strong> A participating institution identifies a behavioral fraud pattern</li>
            <li><strong>Anonymization:</strong> The pattern is hashed; no customer data included</li>
            <li><strong>Sharing:</strong> The anonymized pattern is shared with entitled network participants</li>
            <li><strong>Matching:</strong> Other institutions check for similarity against live transactions</li>
            <li><strong>Prevention:</strong> Real-time alerts triggered upon pattern match</li>
          </ol>
        )}
      </div>

      <div className="privacy-note canton-privacy">
        <strong>🔒 Privacy Guaranteed:</strong> No customer identifiers, account numbers, or PII are shared.
        Only behavioral risk patterns are exchanged under Canton Network's selective disclosure model.
      </div>
    </div>
  );
}

// --- Regulator View ---

function RegulatorView({ devnet }: { devnet: DevnetState }) {
  const [showVerification, setShowVerification] = useState(true);
  const sarReports = byTemplate(devnet.contracts, 'SARReport');
  const riskScores = byTemplate(devnet.contracts, 'RiskScore');
  const blockedCount = riskScores.filter(c => (c.riskScore ?? 0) >= 80).length;

  const ACTION_LABELS: Record<string, string> = {
    BLOCKED: 'Blocked', REVIEW: 'Under Review', APPROVED: 'Approved',
    MARKET_CLOSED: 'Market Closed', SAR_FILED: 'SAR Filed',
  };

  // Build audit log from real on-chain data, newest first
  const sortedScores = [...riskScores].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const auditEntries = sortedScores.slice(0, 5).flatMap(c => {
    const score = c.riskScore ?? 0;
    const action = riskAction(score);
    const entries = [
      { action, tx: c.transactionId || '', detail: `Risk score: ${score}%`, time: c.createdAt },
      { action: 'MARKET_CLOSED', tx: c.transactionId || '', detail: `Decision: ${action}`, time: c.createdAt },
    ];
    if (c.sarFiled) {
      entries.unshift({ action: 'SAR_FILED', tx: c.transactionId || '', detail: `Auto-filed SAR, risk score ${score}%`, time: c.createdAt });
    }
    return entries;
  });

  return (
    <div className="regulator-view">
      <h2>🏛️ Regulator Dashboard</h2>
      <p className="regulator-subtitle">Regulator Observer Mode — Read-Only Access</p>

      <div className="regulator-stats">
        <div className="stat-card">
          <div className="stat-value">{devnet.totalContracts}</div>
          <div className="stat-label">ACTIVE CONTRACTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.parties.filter(p => !p.isRegulator).length || 0}</div>
          <div className="stat-label">PARTICIPATING INSTITUTIONS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{blockedCount}</div>
          <div className="stat-label">BLOCKED</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{sarReports.length}</div>
          <div className="stat-label">SAR REPORTS</div>
        </div>
      </div>

      <div className="regulator-section">
        <h3>📋 On-Chain Audit Log <span className="live-feed-badge">● Live</span></h3>
        <p className="section-subtitle">Immutable record of risk assessments, market closures, and enforcement decisions</p>
        <div className="audit-log">
          {auditEntries.length > 0 ? auditEntries.map((log, i) => (
            <div key={i} className="audit-entry">
              <span className={`audit-action ${log.action.toLowerCase().replace('_', '-')}`}>{ACTION_LABELS[log.action] || log.action}</span>
              <span className="audit-tx">{log.tx}</span>
              <span className="audit-detail">{log.detail}</span>
              {log.time && <span className="contract-time">{formatTime(log.time)}</span>}
            </div>
          )) : (
            <div className="audit-entry">
              <span className="audit-detail">{devnet.connected ? 'No audit entries yet' : 'Connecting to DevNet...'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="privacy-note canton-privacy">
        <strong>🔒 Privacy Preserved:</strong> Regulator sees actions and outcomes, but no customer PII is exposed.
        All data is anonymized and protected under Canton Network's selective disclosure model.
      </div>

      <div className="regulator-section verification-section">
        <h3 className="clickable-header" onClick={() => setShowVerification(!showVerification)}>
          🔗 Canton DevNet Verification {showVerification ? '▼' : '▶'}
        </h3>
        {showVerification && (
          <div className="verification-content">
            <p className="verification-note">Live connection to Canton DevNet — Party IDs are cryptographically unique</p>
            <div className="verification-grid">
              {devnet.parties.map((party, i) => (
                <div key={i} className="verification-item">
                  <span className="verification-name">{party.isRegulator ? '🏛️' : '🏦'} {party.name}</span>
                  <code className="verification-id">{party.partyId}</code>
                  <span className="verification-label">Party ID — cryptographic identifier on Canton ledger</span>
                </div>
              ))}
            </div>
            <div className="verification-footer">
              <span className="verification-badge">✓ Canton DevNet</span>
              <span className="verification-badge">✓ Canton Network</span>
              <span className="verification-badge">✓ {devnet.parties.length} Parties Active</span>
            </div>
          </div>
        )}
      </div>

      <div className="regulator-section compliance-breakdown">
        <h3>🔐 Compliance Breakdown</h3>
        <div className="compliance-grid">
          <div className="compliance-column">
            <h4 className="shared-title">✓ What IS Shared</h4>
            <ul>
              <li>Behavioral patterns (hashed representations)</li>
              <li>Aggregated risk scores</li>
              <li>Fraud outcome classifications</li>
              <li>Immutable audit metadata</li>
            </ul>
          </div>
          <div className="compliance-column">
            <h4 className="not-shared-title">✗ What is NOT Shared</h4>
            <ul>
              <li>Customer names</li>
              <li>Account numbers</li>
              <li>Transaction details</li>
              <li>Bank-specific PII</li>
            </ul>
          </div>
        </div>
        <div className="compliance-badges">
          <span className="badge">BSA ✓</span>
          <span className="badge">GDPR ✓</span>
          <span className="badge">USA PATRIOT Act §314(b) ✓</span>
        </div>
      </div>
    </div>
  );
}
