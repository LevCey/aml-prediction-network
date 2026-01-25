import React, { useState } from 'react';
import './App.css';

// Mock data for demo
const mockTransactions = [
  {
    id: 'TX_001',
    amount: 9500,
    destination: 'Crypto Exchange',
    riskScore: 0.92,
    status: 'BLOCKED',
    timestamp: '2026-01-25 10:30:00',
    sarFiled: true,
    sarId: 'SAR-TX_001',
    sarStatus: 'ACKNOWLEDGED'
  },
  {
    id: 'TX_002',
    amount: 4200,
    destination: 'Wire Transfer',
    riskScore: 0.45,
    status: 'APPROVED',
    timestamp: '2026-01-25 11:15:00',
    sarFiled: false
  },
  {
    id: 'TX_003',
    amount: 8900,
    destination: 'High-Risk Jurisdiction',
    riskScore: 0.78,
    status: 'REVIEW',
    timestamp: '2026-01-25 12:00:00',
    sarFiled: false
  }
];

const mockPredictions = [
  { bank: 'Bank A', confidence: 0.85, stake: 200 },
  { bank: 'Bank B', confidence: 0.75, stake: 150 },
  { bank: 'Bank C', confidence: 0.70, stake: 100 }
];

function App() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'market' | 'patterns' | 'regulator'>('dashboard');

  return (
    <div className="App">
      <header className="header">
        <h1>AML Prediction Network</h1>
        <p className="subtitle">Privacy-Preserving Fraud Detection | Built on Canton Network</p>
      </header>

      <nav className="tabs">
        <button
          className={selectedTab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={selectedTab === 'market' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('market')}
        >
          Prediction Markets
        </button>
        <button
          className={selectedTab === 'patterns' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('patterns')}
        >
          Fraud Patterns
        </button>
        <button
          className={selectedTab === 'regulator' ? 'tab active' : 'tab'}
          onClick={() => setSelectedTab('regulator')}
        >
          Regulator View
        </button>
      </nav>

      <main className="content">
        {selectedTab === 'dashboard' && <DashboardView />}
        {selectedTab === 'market' && <PredictionMarketView />}
        {selectedTab === 'patterns' && <PatternsView />}
        {selectedTab === 'regulator' && <RegulatorView />}
      </main>

      <footer className="footer">
        <p>🏆 Canton Catalyst 2026 Winner</p>
      </footer>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="dashboard">
      <h2>Transaction Monitoring</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">1,247</div>
          <div className="stat-label">Transactions Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">23</div>
          <div className="stat-label">Fraud Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">89%</div>
          <div className="stat-label">Detection Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">-68%</div>
          <div className="stat-label">False Positives</div>
        </div>
      </div>

      <h3>Recent Transactions</h3>
      <div className="transactions-list">
        {mockTransactions.map(tx => (
          <div key={tx.id} className="transaction-card">
            <div className="tx-header">
              <span className="tx-id">{tx.id}</span>
              <span className={`tx-status ${tx.status.toLowerCase()}`}>
                {tx.status}
              </span>
            </div>
            <div className="tx-details">
              <div className="tx-row">
                <span className="label">Amount:</span>
                <span className="value">${tx.amount.toLocaleString()}</span>
              </div>
              <div className="tx-row">
                <span className="label">Destination:</span>
                <span className="value">{tx.destination}</span>
              </div>
              <div className="tx-row">
                <span className="label">Risk Score:</span>
                <span className="value risk-score">{(tx.riskScore * 100).toFixed(1)}%</span>
              </div>
              <div className="tx-row">
                <span className="label">Time:</span>
                <span className="value">{tx.timestamp}</span>
              </div>
            </div>
            <div className="risk-bar">
              <div
                className="risk-fill"
                style={{
                  width: `${tx.riskScore * 100}%`,
                  backgroundColor: tx.riskScore > 0.8 ? '#e74c3c' : tx.riskScore > 0.6 ? '#f39c12' : '#27ae60'
                }}
              />
            </div>
            {tx.sarFiled && (
              <div className="sar-alert">
                <div className="sar-header">
                  <span className="sar-icon">📋</span>
                  <span className="sar-title">SAR Auto-Filed</span>
                </div>
                <div className="sar-details">
                  <span>ID: {tx.sarId}</span>
                  <span className={`sar-status ${tx.sarStatus?.toLowerCase()}`}>
                    {tx.sarStatus === 'ACKNOWLEDGED' ? '✓ ' : ''}{tx.sarStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictionMarketView() {
  const totalStake = mockPredictions.reduce((sum, p) => sum + p.stake, 0);
  const weightedRisk = mockPredictions.reduce((sum, p) => sum + (p.confidence * p.stake), 0) / totalStake;

  return (
    <div className="prediction-market">
      <h2>Active Prediction Market</h2>

      <div className="market-card">
        <div className="market-header">
          <h3>Transaction TX_001 - $9,500 to Crypto Exchange</h3>
          <span className="market-status">VOTING OPEN</span>
        </div>

        <div className="risk-score-large">
          <div className="score-label">Weighted Risk Score</div>
          <div className="score-value">{(weightedRisk * 100).toFixed(1)}%</div>
          <div className="score-action">
            {weightedRisk > 0.8 ? 'RECOMMENDED ACTION: BLOCK' :
             weightedRisk > 0.6 ? 'RECOMMENDED ACTION: REVIEW' :
             'RECOMMENDED ACTION: APPROVE'}
          </div>
        </div>

        <h4>Bank Predictions</h4>
        <div className="predictions-list">
          {mockPredictions.map((pred, idx) => (
            <div key={idx} className="prediction-item">
              <div className="pred-header">
                <span className="bank-name">{pred.bank}</span>
                <span className="confidence">{(pred.confidence * 100).toFixed(0)}% Fraud</span>
              </div>
              <div className="pred-details">
                <span>Stake: ${pred.stake}</span>
                <span>Weight: {((pred.stake / totalStake) * 100).toFixed(1)}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${pred.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="market-info">
          <p><strong>Total Stake:</strong> ${totalStake}</p>
          <p><strong>Participants:</strong> {mockPredictions.length} banks</p>
          <p><strong>Deadline:</strong> 23 hours remaining</p>
        </div>
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

// Mock audit log data
const mockAuditLog = [
  { id: 'LOG-001', timestamp: '2026-01-25 10:35:01', action: 'SAR_FILED', actor: 'Bank A', txId: 'TX_001', details: 'Auto-filed SAR due to risk score 0.92' },
  { id: 'LOG-002', timestamp: '2026-01-25 10:35:00', action: 'MARKET_CLOSED', actor: 'Bank A', txId: 'TX_001', details: 'Risk score: 92.0%' },
  { id: 'LOG-003', timestamp: '2026-01-25 10:32:00', action: 'VOTE_SUBMITTED', actor: 'Bank B', txId: 'TX_001', details: 'Confidence: 90%, Stake: $100' },
  { id: 'LOG-004', timestamp: '2026-01-25 10:31:00', action: 'VOTE_SUBMITTED', actor: 'Bank A', txId: 'TX_001', details: 'Confidence: 95%, Stake: $100' },
  { id: 'LOG-005', timestamp: '2026-01-25 10:30:00', action: 'PATTERN_MATCHED', actor: 'System', txId: 'TX_001', details: 'Matched pattern: RAPID_CRYPTO' },
];

const mockSARs = [
  { sarId: 'SAR-TX_001', txId: 'TX_001', riskScore: 0.92, filingBank: 'Bank A', filedAt: '2026-01-25 10:35:01', status: 'ACKNOWLEDGED' },
];

function RegulatorView() {
  return (
    <div className="regulator-view">
      <h2>🏛️ Regulator Dashboard</h2>
      <p className="regulator-subtitle">FinCEN Observer Mode - Read-Only Access</p>

      <div className="regulator-stats">
        <div className="stat-card">
          <div className="stat-value">1</div>
          <div className="stat-label">Active SARs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Audit Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">3</div>
          <div className="stat-label">Banks Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">100%</div>
          <div className="stat-label">Compliance Rate</div>
        </div>
      </div>

      <div className="regulator-section">
        <h3>📋 SAR Reports</h3>
        <div className="sar-list">
          {mockSARs.map(sar => (
            <div key={sar.sarId} className="sar-card">
              <div className="sar-card-header">
                <span className="sar-id">{sar.sarId}</span>
                <span className={`sar-status-badge ${sar.status.toLowerCase()}`}>{sar.status}</span>
              </div>
              <div className="sar-card-body">
                <div><strong>Transaction:</strong> {sar.txId}</div>
                <div><strong>Risk Score:</strong> {(sar.riskScore * 100).toFixed(1)}%</div>
                <div><strong>Filing Bank:</strong> {sar.filingBank}</div>
                <div><strong>Filed At:</strong> {sar.filedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="regulator-section">
        <h3>📜 Audit Log</h3>
        <div className="audit-log">
          {mockAuditLog.map(log => (
            <div key={log.id} className="audit-entry">
              <div className="audit-time">{log.timestamp}</div>
              <div className={`audit-action ${log.action.toLowerCase()}`}>{log.action}</div>
              <div className="audit-actor">{log.actor}</div>
              <div className="audit-tx">{log.txId}</div>
              <div className="audit-details">{log.details}</div>
            </div>
          ))}
        </div>
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
