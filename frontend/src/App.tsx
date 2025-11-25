import React, { useState } from 'react';
import './App.css';

// Mock data for demo
const mockTransactions = [
  {
    id: 'TX_001',
    amount: 9500,
    destination: 'Crypto Exchange',
    riskScore: 0.85,
    status: 'FLAGGED',
    timestamp: '2025-11-25 10:30:00'
  },
  {
    id: 'TX_002',
    amount: 4200,
    destination: 'Wire Transfer',
    riskScore: 0.45,
    status: 'APPROVED',
    timestamp: '2025-11-25 11:15:00'
  },
  {
    id: 'TX_003',
    amount: 8900,
    destination: 'High-Risk Jurisdiction',
    riskScore: 0.78,
    status: 'REVIEW',
    timestamp: '2025-11-25 12:00:00'
  }
];

const mockPredictions = [
  { bank: 'Bank A', confidence: 0.85, stake: 200 },
  { bank: 'Bank B', confidence: 0.75, stake: 150 },
  { bank: 'Bank C', confidence: 0.70, stake: 100 }
];

function App() {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'market' | 'patterns'>('dashboard');

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
      </nav>

      <main className="content">
        {selectedTab === 'dashboard' && <DashboardView />}
        {selectedTab === 'market' && <PredictionMarketView />}
        {selectedTab === 'patterns' && <PatternsView />}
      </main>

      <footer className="footer">
        <p>Canton Construct Ideathon 2025 | Prediction Markets Track</p>
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
