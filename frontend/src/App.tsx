import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Demo from './Demo';

interface Contract {
  contractId: string;
  transactionId: string;
  marketId: string;
  creator: string;
  isOpen: boolean;
  votes: number;
  createdAt: string;
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
            <p className="subtitle">Privacy-Preserving Fraud Detection | Built on Canton Network</p>
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
        <button className={selectedTab === 'market' ? 'tab active' : 'tab'} onClick={() => setSelectedTab('market')}>Prediction Markets</button>
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
  return (
    <div className="dashboard">
      <h2>Network Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{devnet.totalContracts}</div>
          <div className="stat-label">Total Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.parties.filter(p => !p.isRegulator).length}</div>
          <div className="stat-label">Active Banks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.parties.filter(p => p.isRegulator).length}</div>
          <div className="stat-label">Regulators</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.connected ? '✓' : '✗'}</div>
          <div className="stat-label">DevNet Status</div>
        </div>
      </div>

      <h3>Network Participants</h3>
      <div className="participants-grid">
        {devnet.parties.map((party, i) => (
          <div key={i} className={`participant-card ${party.isRegulator ? 'regulator' : ''}`}>
            <span className="participant-icon">{party.isRegulator ? '🏛️' : '🏦'}</span>
            <span className="participant-name">{party.name}</span>
            <span className="participant-type">{party.isRegulator ? 'Regulator' : 'Bank'}</span>
          </div>
        ))}
      </div>

      <h3>Recent Prediction Markets</h3>
      {loading ? (
        <p>Loading from Canton DevNet...</p>
      ) : devnet.contracts.length === 0 ? (
        <p className="no-data">No contracts yet. <Link to="/demo">Run a demo</Link> to create one!</p>
      ) : (
        <div className="contracts-list">
          {devnet.contracts.slice(0, 5).map((c, i) => (
            <div key={i} className="contract-card">
              <div className="contract-header">
                <span className="contract-id">{c.transactionId}</span>
                <span className={`contract-status ${c.isOpen ? 'open' : 'closed'}`}>{c.isOpen ? 'OPEN' : 'CLOSED'}</span>
              </div>
              <div className="contract-details">
                <span>Creator: {c.creator}</span>
                <span>Votes: {c.votes}</span>
              </div>
              <div className="contract-id-full">Contract: {c.contractId.slice(0, 24)}...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionMarketView({ devnet }: { devnet: DevnetStats }) {
  return (
    <div className="prediction-market">
      <h2>Prediction Markets on Canton</h2>
      
      <div className="market-info-box">
        <h3>How It Works</h3>
        <p>Banks submit confidential risk predictions on suspicious transactions. Predictions are weighted by stake and aggregated into a network-wide risk score.</p>
      </div>

      <h3>Active Markets ({devnet.contracts.filter(c => c.isOpen).length})</h3>
      {devnet.contracts.filter(c => c.isOpen).length === 0 ? (
        <p className="no-data">No active markets. <Link to="/demo">Run a demo</Link> to create one!</p>
      ) : (
        <div className="markets-list">
          {devnet.contracts.filter(c => c.isOpen).map((c, i) => (
            <div key={i} className="market-card">
              <div className="market-header">
                <h4>{c.transactionId}</h4>
                <span className="market-status">VOTING OPEN</span>
              </div>
              <p>Creator: {c.creator}</p>
              <p>Votes submitted: {c.votes}</p>
            </div>
          ))}
        </div>
      )}

      <h3>Closed Markets ({devnet.contracts.filter(c => !c.isOpen).length})</h3>
      <div className="markets-list">
        {devnet.contracts.filter(c => !c.isOpen).slice(0, 5).map((c, i) => (
          <div key={i} className="market-card closed">
            <div className="market-header">
              <h4>{c.transactionId}</h4>
              <span className="market-status closed">RESOLVED</span>
            </div>
            <p>Creator: {c.creator} | Votes: {c.votes}</p>
          </div>
        ))}
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
  return (
    <div className="regulator-view">
      <h2>🏛️ Regulator Dashboard</h2>
      <p className="regulator-subtitle">FinCEN Observer Mode - Read-Only Access</p>

      <div className="regulator-stats">
        <div className="stat-card">
          <div className="stat-value">{devnet.totalContracts}</div>
          <div className="stat-label">Total Markets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.parties.filter(p => !p.isRegulator).length}</div>
          <div className="stat-label">Banks Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{devnet.connected ? '✓' : '✗'}</div>
          <div className="stat-label">DevNet Connected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">100%</div>
          <div className="stat-label">Compliance Rate</div>
        </div>
      </div>

      <div className="regulator-section">
        <h3>📋 Recent Activity</h3>
        {devnet.contracts.length === 0 ? (
          <p className="no-data">No activity yet.</p>
        ) : (
          <div className="audit-log">
            {devnet.contracts.slice(0, 5).map((c, i) => (
              <div key={i} className="audit-entry">
                <div className="audit-action">{c.isOpen ? 'MARKET_OPEN' : 'MARKET_CLOSED'}</div>
                <div className="audit-actor">{c.creator}</div>
                <div className="audit-tx">{c.transactionId}</div>
                <div className="audit-details">{c.votes} votes submitted</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="compliance-note">
        <strong>🔒 Privacy Preserved:</strong> Regulator sees actions and outcomes, but NO customer PII is exposed. 
        All data is anonymized and compliant with BSA Section 314(b) and GDPR.
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
