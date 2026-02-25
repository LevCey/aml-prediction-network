import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Demo from './Demo';

interface Vote {
  voter: string;
  confidence: number;
  weight: number;
}

interface Contract {
  contractId: string;
  template: string;
  transactionId?: string;
  isOpen?: boolean;
  creator?: string;
  votes?: Vote[];
  riskScore?: number;
  bank?: string;
  reputationScore?: number;
  accuracy?: number;
}

interface Party {
  name: string;
  partyId: string;
  isRegulator: boolean;
}

interface DevnetStats {
  connected: boolean;
  totalContracts: number;
  contracts: Contract[];
  parties: Party[];
}

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

function MainDashboard() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'market' | 'patterns' | 'regulator'>('dashboard');
  const [devnet, setDevnet] = useState<DevnetStats>({ connected: false, totalContracts: 0, contracts: [], parties: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, contractsRes, partiesRes] = await Promise.all([
          fetch('/api/health').then(r => r.json()),
          fetch('/api/contracts').then(r => r.json()),
          fetch('/api/parties').then(r => r.json())
        ]);
        setDevnet({
          connected: healthRes.status === 'ok',
          totalContracts: contractsRes.totalContracts || 0,
          contracts: contractsRes.contracts || [],
          parties: partiesRes.parties || []
        });
      } catch (e) {
        setDevnet({ connected: false, totalContracts: 0, contracts: [], parties: [] });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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
          </div>
          <Link to="/demo" className="live-demo-btn">⚡ Live Demo</Link>
        </div>
      </header>

      <nav className="tabs">
        <button className={selectedTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('dashboard')}>Dashboard</button>
        <button className={selectedTab === 'market' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('market')}>Risk Signals</button>
        <button className={selectedTab === 'patterns' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('patterns')}>Fraud Patterns</button>
        <button className={selectedTab === 'regulator' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('regulator')}>Regulator View</button>
      </nav>

      <main className="content">
        {selectedTab === 'dashboard' && <DashboardView devnet={devnet} loading={loading} />}
        {selectedTab === 'market' && <PredictionMarketView devnet={devnet} />}
        {selectedTab === 'patterns' && <PatternsView />}
        {selectedTab === 'regulator' && <RegulatorView devnet={devnet} />}
      </main>

      <footer className="footer">
        <p>🏆 Canton Catalyst 2026 Winner</p>
      </footer>
    </div>
  );
}

function DashboardView({ devnet, loading }: { devnet: DevnetStats; loading: boolean }) {
  const riskScores = devnet.contracts.filter(c => c.template === 'RiskScore');
  const openMarkets = devnet.contracts.filter(c => c.template === 'PredictionMarket' && c.isOpen);
  const sarReports = devnet.contracts.filter(c => c.template === 'SARReport');
  const reputations = devnet.contracts.filter(c => c.template === 'BankReputation');

  const parties = devnet.parties.length > 0 ? devnet.parties : [
    { name: 'Regulator', partyId: '', isRegulator: true },
    { name: 'Bank A', partyId: '', isRegulator: false },
    { name: 'Bank B', partyId: '', isRegulator: false },
    { name: 'Bank C', partyId: '', isRegulator: false },
    { name: 'Bank D', partyId: '', isRegulator: false },
  ];

  const assessments = [...riskScores, ...openMarkets];

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
        <div className="stat-card success">
          <div className="stat-value">{devnet.connected ? '✓' : '✗'}</div>
          <div className="stat-label">DEVNET {devnet.connected ? 'LIVE' : 'OFFLINE'}</div>
        </div>
      </div>

      <h3>Network Participants</h3>
      {reputations.length > 0 ? (
        <div className="participants-grid">
          {parties.map((party, i) => {
            const rep = reputations.find(r => r.bank === party.name);
            return (
              <div key={i} className={`participant-card ${party.isRegulator ? 'regulator' : ''}`}>
                <span className="participant-icon">{party.isRegulator ? '🏛️' : '🏦'}</span>
                <div className="participant-info">
                  <span className="participant-name">{party.name}</span>
                  <span className="participant-type">
                    {party.isRegulator ? 'Regulator' : rep ? `Score: ${rep.reputationScore} | Acc: ${Math.round((rep.accuracy || 0) * 100)}%` : 'Bank'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="participants-grid">
          {parties.map((party, i) => (
            <div key={i} className={`participant-card ${party.isRegulator ? 'regulator' : ''}`}>
              <span className="participant-icon">{party.isRegulator ? '🏛️' : '🏦'}</span>
              <div className="participant-info">
                <span className="participant-name">{party.name}</span>
                <span className="participant-type">{party.isRegulator ? 'Regulator' : 'Bank'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3>Recent Risk Assessments {loading && '(loading...)'}</h3>
      <div className="contracts-list">
        {assessments.length > 0 ? assessments.slice(0, 10).map((c, i) => {
          const score = c.riskScore ?? 0;
          const action = score >= 80 ? 'BLOCKED' : score >= 60 ? 'REVIEW' : 'APPROVED';
          return (
            <div key={i} className="contract-card">
              <div className="contract-header">
                <span className="contract-id">{c.transactionId || c.contractId}</span>
                <span className={`contract-status ${c.isOpen ? 'open' : 'closed'}`}>
                  {c.template === 'PredictionMarket' ? '● ACTIVE' : '● RESOLVED'}
                </span>
              </div>
              <div className="contract-details">
                <span><strong>Type:</strong> {c.template}</span>
                {c.creator && <span><strong>Creator:</strong> {c.creator}</span>}
                {c.votes && <span><strong>Votes:</strong> {c.votes.length}</span>}
                {c.riskScore != null && <span><strong>Risk:</strong> {c.riskScore}%</span>}
                {c.template === 'RiskScore' && <span className={`action-badge ${action.toLowerCase()}`}>{action}</span>}
              </div>
            </div>
          );
        }) : (
          <div className="contract-card">
            <div className="contract-details">
              <span>{devnet.connected ? 'No active risk assessments on DevNet' : 'DevNet bağlantısı kurulamadı'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PredictionMarketView({ devnet }: { devnet: DevnetStats }) {
  const riskScores = devnet.contracts.filter(c => c.template === 'RiskScore');
  const openMarkets = devnet.contracts.filter(c => c.template === 'PredictionMarket');
  const reputations = devnet.contracts.filter(c => c.template === 'BankReputation');

  const resolvedCount = riskScores.length;
  const blockedCount = riskScores.filter(c => (c.riskScore ?? 0) >= 80).length;
  const avgAccuracy = reputations.length > 0
    ? Math.round(reputations.reduce((s, r) => s + (r.accuracy || 0), 0) / reputations.length * 100)
    : 0;

  return (
    <div className="prediction-market">
      <h2>Risk Signal Aggregation on Canton</h2>
      
      <div className="market-info-box">
        <h3>How It Works</h3>
        <p>Institutions submit confidential risk signals on suspicious transactions. Signals are weighted by reputation and aggregated into a network-wide risk score. All commitments are recorded on Canton Network for immutable audit trail.</p>
      </div>

      <div className="market-stats">
        <div className="market-stat"><span className="stat-num">{resolvedCount + openMarkets.length}</span><span className="stat-lbl">Total Markets</span></div>
        <div className="market-stat"><span className="stat-num">{blockedCount}</span><span className="stat-lbl">Blocked</span></div>
        <div className="market-stat"><span className="stat-num">{avgAccuracy > 0 ? `${avgAccuracy}%` : '—'}</span><span className="stat-lbl">Avg Accuracy</span></div>
        <div className="market-stat"><span className="stat-num">{openMarkets.length}</span><span className="stat-lbl">Active</span></div>
      </div>

      <h3>Active Markets</h3>
      <div className="markets-list">
        {openMarkets.length > 0 ? openMarkets.map((m, i) => (
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
        )) : (
          <div className="contract-card">
            <div className="contract-details"><span>No active markets — all markets resolved</span></div>
          </div>
        )}
      </div>

      <h3>Resolved Assessments</h3>
      <div className="markets-list">
        {riskScores.length > 0 ? riskScores.map((m, i) => {
          const score = m.riskScore ?? 0;
          const action = score >= 80 ? 'BLOCKED' : score >= 60 ? 'REVIEW' : 'APPROVED';
          return (
            <div key={i} className={`market-card resolved`}>
              <div className="market-header">
                <div className="market-title">
                  <span className="market-tx">{m.transactionId}</span>
                </div>
                <span className="market-status resolved">● RESOLVED</span>
              </div>
              <div className="market-footer">
                <span className="risk-score">Risk Score: <strong>{score}%</strong></span>
                <span className={`action-badge ${action.toLowerCase()}`}>{action}</span>
              </div>
            </div>
          );
        }) : (
          <div className="contract-card">
            <div className="contract-details"><span>{devnet.connected ? 'No resolved assessments yet' : 'DevNet bağlantısı kurulamadı'}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function PatternsView() {
  const patterns = [
    {
      id: 'PAT_001',
      name: 'Classic Structuring',
      category: 'Structuring',
      detected: 12,
      accuracy: 94
    },
    {
      id: 'PAT_002',
      name: 'Crypto Exchange Laundering',
      category: 'Layering',
      detected: 8,
      accuracy: 87
    },
    {
      id: 'PAT_003',
      name: 'Smurfing Network',
      category: 'Smurfing',
      detected: 5,
      accuracy: 91
    }
  ];

  return (
    <div className="patterns">
      <h2>Fraud Pattern Library</h2>

      <div className="patterns-grid">
        {patterns.map(pattern => (
          <div key={pattern.id} className="pattern-card">
            <div className="pattern-header">
              <h4>{pattern.name}</h4>
              <span className="pattern-category">{pattern.category}</span>
            </div>
            <div className="pattern-stats">
              <div className="pattern-stat">
                <span className="stat-number">{pattern.detected}</span>
                <span className="stat-text">Times Detected</span>
              </div>
              <div className="pattern-stat">
                <span className="stat-number">{pattern.accuracy}%</span>
                <span className="stat-text">Accuracy</span>
              </div>
            </div>
            <div className="pattern-id">{pattern.id}</div>
          </div>
        ))}
      </div>

      <div className="pattern-info">
        <h3>How Pattern Sharing Works</h3>
        <ol>
          <li><strong>Detection:</strong> Bank detects fraud pattern</li>
          <li><strong>Anonymization:</strong> Pattern hashed, no customer data</li>
          <li><strong>Sharing:</strong> Pattern broadcast to network</li>
          <li><strong>Matching:</strong> Other banks check for similarities</li>
          <li><strong>Prevention:</strong> Real-time alerts on pattern match</li>
        </ol>
        <p className="privacy-note">
          <strong>Privacy Guaranteed:</strong> No customer names, account numbers, or PII shared.
          Only behavioral patterns protected by Canton Network's selective disclosure.
        </p>
      </div>
    </div>
  );
}

export default App;

function RegulatorView({ devnet }: { devnet: DevnetStats }) {
  const [showVerification, setShowVerification] = useState(false);

  const sampleActivity = [
    { time: '10:35:01', action: 'SAR_FILED', bank: 'Bank A', tx: 'TX-89234521', detail: 'Auto-filed SAR, risk score 87.2%' },
    { time: '10:35:00', action: 'MARKET_CLOSED', bank: 'Bank A', tx: 'TX-89234521', detail: 'Decision: BLOCK' },
    { time: '10:34:12', action: 'SIGNAL', bank: 'Bank D', tx: 'TX-89234521', detail: '84% confidence, w: 2.0' },
    { time: '10:33:45', action: 'SIGNAL', bank: 'Bank C', tx: 'TX-89234521', detail: '88% confidence, w: 1.2' },
    { time: '10:32:18', action: 'SIGNAL', bank: 'Bank B', tx: 'TX-89234521', detail: '85% confidence, w: 1.5' },
    { time: '10:31:02', action: 'SIGNAL', bank: 'Bank A', tx: 'TX-89234521', detail: '89% confidence, w: 1.8' },
    { time: '10:30:00', action: 'MARKET_OPEN', bank: 'Bank A', tx: 'TX-89234521', detail: 'Suspicious crypto transfer $25K' },
  ];

  return (
    <div className="regulator-view">
      <h2>🏛️ Regulator Dashboard</h2>
      <p className="regulator-subtitle">Regulator Observer Mode - Read-Only Access</p>

      <div className="regulator-stats">
        <div className="stat-card">
          <div className="stat-value">{devnet.totalContracts}</div>
          <div className="stat-label">ACTIVE CONTRACTS</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.parties.filter(p => !p.isRegulator).length || 0}</div>
          <div className="stat-label">INSTITUTIONS ACTIVE</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{devnet.connected ? '✓' : '✗'}</div>
          <div className="stat-label">DEVNET {devnet.connected ? 'LIVE' : 'OFFLINE'}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{devnet.contracts.filter(c => c.template === 'SARReport').length}</div>
          <div className="stat-label">SAR REPORTS</div>
        </div>
      </div>

      <div className="regulator-section">
        <h3>📋 Real-Time Audit Log</h3>
        <div className="audit-log">
          {sampleActivity.map((log, i) => (
            <div key={i} className="audit-entry">
              <span className="audit-time">{log.time}</span>
              <span className={`audit-action ${log.action.toLowerCase().replace('_', '-')}`}>{log.action}</span>
              <span className="audit-bank">{log.bank}</span>
              <span className="audit-tx">{log.tx}</span>
              <span className="audit-detail">{log.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="compliance-note">
        <strong>🔒 Privacy Preserved:</strong> Regulator sees actions and outcomes, but NO customer PII is exposed. 
        All data is anonymized and protected by Canton Network's selective disclosure.
      </div>

      <div className="regulator-section verification-section">
        <h3 onClick={() => setShowVerification(!showVerification)} style={{cursor: 'pointer'}}>
          🔗 Canton DevNet Verification {showVerification ? '▼' : '▶'}
        </h3>
        {showVerification && (
          <div className="verification-content">
            <p className="verification-note">Live connection to Tenzro Canton DevNet - Party IDs are cryptographically unique</p>
            <div className="verification-grid">
              {devnet.parties.map((party, i) => (
                <div key={i} className="verification-item">
                  <span className="verification-name">{party.isRegulator ? '🏛️' : '🏦'} {party.name}</span>
                  <code className="verification-id">{party.partyId}</code>
                </div>
              ))}
            </div>
            <div className="verification-footer">
              <span className="verification-badge">✓ tenzro-devnet</span>
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
              <li>Behavioral patterns (hashed)</li>
              <li>Risk scores (aggregated)</li>
              <li>Fraud outcomes</li>
              <li>Audit trail</li>
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
          <span className="badge">314(b) ✓</span>
        </div>
      </div>
    </div>
  );
}
