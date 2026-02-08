import { useState, useEffect } from 'react'
import './index.css'

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001'

const BANKS = [
  { id: 'jpmorgan', name: 'JPMorgan Chase', icon: '🏦' },
  { id: 'bofa', name: 'Bank of America', icon: '🏦' },
  { id: 'wells', name: 'Wells Fargo', icon: '🏦' },
  { id: 'citi', name: 'Citibank', icon: '🏦' },
  { id: 'fincen', name: 'FinCEN', icon: '🏛️' },
]

const SCENARIOS = [
  { id: 'high', label: '🔴 High Risk Scenario', title: 'Crypto Wire Transfer', amount: '$25,000', destination: 'Binance (Crypto Exchange)', customer: 'Customer #4821', flags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'] },
  { id: 'medium', label: '🟡 Medium Risk Scenario', title: 'International Wire', amount: '$12,500', destination: 'Dubai Investment LLC', customer: 'Customer #7293', flags: ['Unusual amount pattern', 'New beneficiary'] },
  { id: 'low', label: '🟢 Low Risk Scenario', title: 'Domestic Transfer', amount: '$3,200', destination: 'Verified Merchant', customer: 'Customer #1156', flags: ['Slightly above average'] },
]

const FRAUD_PATTERNS = [
  { name: 'Classic Structuring', type: 'Structuring', detected: 12, accuracy: 94 },
  { name: 'Crypto Exchange Laundering', type: 'Layering', detected: 8, accuracy: 87 },
  { name: 'Smurfing Network', type: 'Smurfing', detected: 5, accuracy: 91 },
]

interface Vote { bank: string; confidence: number; stake: number; isRegulator?: boolean; txId?: string }
interface MarketResult { transactionId: string; contractId?: string; votes: Vote[]; riskScore: number; action: string; mode?: string; marketId?: string }

type Tab = 'dashboard' | 'patterns' | 'regulator'

function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [scenarioId, setScenarioId] = useState('high')
  const [step, setStep] = useState(0)
  const [ledgerConnected, setLedgerConnected] = useState(false)
  const [marketResult, setMarketResult] = useState<MarketResult | null>(null)
  const [animatedPredictions, setAnimatedPredictions] = useState<number[]>([])
  const [auditLog, setAuditLog] = useState<{time: string; type: string; bank: string; tx: string; detail: string}[]>([])

  const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0]

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then(r => r.json()).then(d => setLedgerConnected(d.status === 'ok')).catch(() => setLedgerConnected(false))
  }, [])

  useEffect(() => {
    if (step >= 2 && marketResult?.votes) {
      setAnimatedPredictions([])
      marketResult.votes.forEach((_, i) => setTimeout(() => setAnimatedPredictions(prev => [...prev, i]), i * 400))
    }
  }, [step, marketResult])

  const startDemo = async () => {
    setStep(1); setAuditLog([])
    const res = await fetch(`${API_URL}/api/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: scenarioId }) })
    const data = await res.json()
    if (data.success) {
      setMarketResult(data.market)
      const now = new Date().toLocaleTimeString()
      setAuditLog([{ time: now, type: 'PATTERN_MATCHED', bank: 'System', tx: data.market.transactionId, detail: `Matched pattern: ${scenario.title}` }])
    }
  }

  const nextStep = () => {
    const now = new Date().toLocaleTimeString()
    if (step === 1) {
      setStep(2)
      const newLogs = marketResult?.votes.map(v => ({ time: now, type: 'VOTE_SUBMITTED', bank: v.bank, tx: marketResult.transactionId, detail: `Confidence: ${v.confidence}%, Stake: $${v.stake}` })) || []
      setAuditLog(prev => [...newLogs, ...prev])
    } else if (step === 2) {
      setStep(3)
      setAuditLog(prev => [
        ...(marketResult && marketResult.riskScore >= 80 ? [{ time: now, type: 'SAR_FILED', bank: 'JPMorgan Chase', tx: marketResult.transactionId, detail: `Auto-filed SAR due to risk score ${(marketResult.riskScore / 100).toFixed(2)}` }] : []),
        { time: now, type: 'MARKET_CLOSED', bank: 'System', tx: marketResult?.transactionId || '', detail: `Risk score: ${marketResult?.riskScore}%` },
        ...prev
      ])
    }
  }

  const reset = () => { setStep(0); setMarketResult(null); setAnimatedPredictions([]); setAuditLog([]) }

  const getDecision = (score: number) => {
    if (score >= 80) return { text: 'BLOCK TRANSACTION', icon: '🚨', type: 'danger' }
    if (score >= 60) return { text: 'ENHANCED DUE DILIGENCE', icon: '⚠️', type: 'warning' }
    return { text: 'APPROVE TRANSACTION', icon: '✅', type: 'success' }
  }

  const decision = marketResult ? getDecision(marketResult.riskScore) : null
  const typeColor: Record<string, string> = { SAR_FILED: '#ef4444', MARKET_CLOSED: '#a855f7', VOTE_SUBMITTED: '#3b82f6', PATTERN_MATCHED: '#f59e0b' }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo"><img src="/logo.jpg" alt="AML" className="logo-img" /><h1>AML Prediction<br/>Network</h1></div>
        <nav className="nav-section">
          <div className="nav-label">OVERVIEW</div>
          <div className={`nav-item ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}><span>📊</span> Dashboard</div>
          <div className={`nav-item ${tab === 'patterns' ? 'active' : ''}`} onClick={() => setTab('patterns')}><span>🔍</span> Fraud Patterns</div>
          <div className={`nav-item ${tab === 'regulator' ? 'active' : ''}`} onClick={() => setTab('regulator')}><span>🏛️</span> Regulator View</div>
        </nav>
        <nav className="nav-section">
          <div className="nav-label">NETWORK</div>
          <div className="nav-item"><span>🏦</span> Participants</div>
          <div className="nav-item"><span>📜</span> Contracts</div>
          <div className="nav-item"><span>🔗</span> Ledger</div>
        </nav>
        <nav className="nav-section">
          <div className="nav-label">SETTINGS</div>
          <div className="nav-item"><span>⚙️</span> Configuration</div>
          <div className="nav-item"><span>🔑</span> API Keys</div>
        </nav>
      </aside>

      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <span className={`status-dot ${ledgerConnected ? 'connected' : 'disconnected'}`}></span>
            <span>Canton Network</span>
            <span className="header-subtitle">via Canton DevNet</span>
          </div>
          <div className="header-right">
            {tab === 'dashboard' && <>
              <select value={scenarioId} onChange={e => { setScenarioId(e.target.value); reset(); }} className="scenario-select">
                {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              {step > 0 && <button onClick={reset} className="btn-reset">Reset</button>}
            </>}
          </div>
        </header>

        {/* ===== DASHBOARD TAB ===== */}
        {tab === 'dashboard' && <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-label">Network Participants</div><div className="stat-value">5</div><div className="stat-change positive">↑ 2 this month</div></div>
            <div className="stat-card"><div className="stat-label">Transactions Analyzed</div><div className="stat-value">12,847</div><div className="stat-change positive">↑ 23% vs last week</div></div>
            <div className="stat-card"><div className="stat-label">Fraud Prevented</div><div className="stat-value">$2.4M</div><div className="stat-change positive">↑ 156% improvement</div></div>
            <div className="stat-card"><div className="stat-label">False Positive Rate</div><div className="stat-value">12%</div><div className="stat-change negative">↓ 83% reduction</div></div>
          </div>

          <div className="demo-grid">
            <div className="demo-left">
              {step === 0 ? (
                <div className="start-card">
                  <h2>🎬 AML Prediction Network Demo</h2>
                  <p>Experience real-time fraud detection powered by Canton Network</p>
                  <button onClick={startDemo} className="btn-start">Start Demo</button>
                </div>
              ) : (
                <>
                  {/* Alert */}
                  <div className="alert-card">
                    <div className="card-header"><span>🚨</span> Suspicious Transaction Alert<span className="tx-id">TX-{marketResult?.transactionId.split('-')[1]}</span></div>
                    <div className="alert-type"><span>⚠️</span> {scenario.title}</div>
                    <div className="alert-meta">Detected by JPMorgan Chase • Just now</div>
                    <div className="alert-details">
                      <div><span className="label">Amount</span><span className="value">{scenario.amount}</span></div>
                      <div><span className="label">Destination</span><span className="value">{scenario.destination}</span></div>
                      <div><span className="label">Customer</span><span className="value">{scenario.customer}</span></div>
                    </div>
                    <div className="risk-flags">
                      <div className="flags-header"><span className="label">Risk Flags</span><span className="count">{scenario.flags.length}</span> detected</div>
                      {scenario.flags.map((f, i) => <div key={i} className="flag"><span>⚠️</span> {f}</div>)}
                    </div>
                  </div>

                  {/* Prediction Market */}
                  {step >= 2 && marketResult && (
                    <div className="market-card">
                      <div className="card-header"><span>📊</span> Prediction Market<span className="live-badge">● Live on Canton</span></div>
                      <div className="predictions">
                        {marketResult.votes.map((vote, i) => (
                          <div key={i} className={`prediction ${animatedPredictions.includes(i) ? 'visible' : ''}`}>
                            <span className="bank-icon">{vote.isRegulator ? '🏛️' : '🏦'}</span>
                            <span className="bank-name">{vote.bank}</span>
                            <div className="prediction-bar"><div className="bar-fill" style={{ width: `${vote.confidence}%`, background: vote.confidence > 70 ? '#ef4444' : vote.confidence > 50 ? '#f59e0b' : '#22c55e' }}></div></div>
                            <span className="prediction-value">{vote.confidence}%</span>
                            <span className="stake">${vote.stake} stake</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Score + SAR */}
                  {step >= 3 && marketResult && decision && (
                    <>
                      <div className="score-card">
                        <div className="card-header"><span>⚡</span> Aggregated Risk Score</div>
                        <div className="score-display"><span className="score-value">{marketResult.riskScore}</span><span className="score-percent">%</span></div>
                        <div className="score-label">Fraud Probability</div>
                        <div className={`decision ${decision.type}`}><span>{decision.icon}</span> {decision.text}</div>
                      </div>
                      {marketResult.riskScore >= 80 && (
                        <div className="sar-card">
                          <div className="sar-header"><span>📋</span> SAR Auto-Filed</div>
                          <div className="sar-body">
                            <div className="sar-id">ID: SAR-{marketResult.transactionId}</div>
                            <span className="sar-status">✓ ACKNOWLEDGED</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {step > 0 && step < 3 && <button onClick={nextStep} className="btn-next">Next Step →</button>}
            </div>

            {/* Right Column */}
            <div className="demo-right">
              <div className="participants-card">
                <div className="card-header"><span>🌐</span> Network Participants</div>
                {BANKS.map(bank => (
                  <div key={bank.id} className="participant">
                    <span>{bank.icon}</span><span className="name">{bank.name}</span>
                    <span className={`status ${bank.id === 'fincen' ? 'observer' : 'connected'}`}>{bank.id === 'fincen' ? 'Observer Mode' : 'Connected'}</span>
                  </div>
                ))}
              </div>

              {/* Audit Log */}
              <div className="activity-card">
                <div className="card-header"><span>📜</span> Audit Log</div>
                {auditLog.length === 0 ? <div className="empty-log">Start demo to see activity</div> : (
                  auditLog.map((log, i) => (
                    <div key={i} className="audit-entry">
                      <span className="audit-time">{log.time}</span>
                      <span className="audit-type" style={{ background: typeColor[log.type] || '#6b7280' }}>{log.type}</span>
                      <span className="audit-bank">{log.bank}</span>
                      <span className="audit-detail">{log.detail}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Ledger Proof */}
              {step === 3 && marketResult && (
                <div className="ledger-proof-card">
                  <div className="card-header"><span>🔗</span> Canton Ledger Proof</div>
                  <div className="ledger-badge">✓ Verified on Canton DevNet</div>
                  {marketResult.votes.filter(v => v.txId).map((v, i) => (
                    <div key={i} className="ledger-tx"><span className="tx-bank">{v.bank}</span><span className="tx-id">{v.txId!.slice(0, 8)}...</span></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>}

        {/* ===== FRAUD PATTERNS TAB ===== */}
        {tab === 'patterns' && (
          <div className="tab-content">
            <h2 className="tab-title">Fraud Pattern Library</h2>
            <div className="patterns-grid">
              {FRAUD_PATTERNS.map((p, i) => (
                <div key={i} className="pattern-card">
                  <div className="pattern-header"><span className="pattern-name">{p.name}</span><span className="pattern-type">{p.type}</span></div>
                  <div className="pattern-stats">
                    <div><span className="pattern-value">{p.detected}</span><span className="pattern-label">TIMES DETECTED</span></div>
                    <div><span className="pattern-value">{p.accuracy}%</span><span className="pattern-label">ACCURACY</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="info-card">
              <h3>How Pattern Sharing Works</h3>
              <ol className="pattern-steps">
                <li><strong>Detection:</strong> Bank detects fraud pattern</li>
                <li><strong>Anonymization:</strong> Pattern hashed, no customer data</li>
                <li><strong>Sharing:</strong> Pattern broadcast to network</li>
                <li><strong>Matching:</strong> Other banks check for similarities</li>
                <li><strong>Prevention:</strong> Real-time alerts on pattern match</li>
              </ol>
            </div>
            <div className="privacy-banner">🔒 <strong>Privacy Preserved:</strong> Only behavioral patterns are shared. No customer PII is ever exposed.</div>
          </div>
        )}

        {/* ===== REGULATOR VIEW TAB ===== */}
        {tab === 'regulator' && (
          <div className="tab-content">
            <div className="regulator-header">
              <h2>🏛️ Regulator Dashboard</h2>
              <span className="regulator-subtitle">FinCEN Observer Mode - Read-Only Access</span>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Active SARs</div><div className="stat-value">{step >= 3 && marketResult && marketResult.riskScore >= 80 ? 1 : 0}</div></div>
              <div className="stat-card"><div className="stat-label">Audit Events</div><div className="stat-value">{auditLog.length}</div></div>
              <div className="stat-card"><div className="stat-label">Banks Active</div><div className="stat-value">4</div></div>
              <div className="stat-card"><div className="stat-label">Compliance Rate</div><div className="stat-value">100%</div></div>
            </div>

            {/* SAR Reports */}
            {step >= 3 && marketResult && marketResult.riskScore >= 80 && (
              <div className="sar-report-card">
                <div className="card-header"><span>📋</span> SAR Reports</div>
                <div className="sar-report-entry">
                  <div className="sar-report-left">
                    <div className="sar-report-id">SAR-{marketResult.transactionId}</div>
                    <div>Transaction: {marketResult.transactionId}</div>
                    <div>Filing Bank: JPMorgan Chase</div>
                  </div>
                  <div className="sar-report-right">
                    <div>Risk Score: {marketResult.riskScore}%</div>
                    <div>Filed At: {new Date().toLocaleString()}</div>
                    <span className="sar-status-badge">ACKNOWLEDGED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log */}
            <div className="audit-log-card">
              <div className="card-header"><span>📜</span> Audit Log</div>
              {auditLog.length === 0 ? <div className="empty-log">Run a demo scenario to generate audit events</div> : (
                auditLog.map((log, i) => (
                  <div key={i} className="audit-row">
                    <span className="audit-time">{log.time}</span>
                    <span className="audit-type" style={{ background: typeColor[log.type] || '#6b7280' }}>{log.type}</span>
                    <span className="audit-bank">{log.bank}</span>
                    <span className="audit-tx">{log.tx}</span>
                    <span className="audit-detail">{log.detail}</span>
                  </div>
                ))
              )}
            </div>

            {/* Compliance Breakdown */}
            <div className="compliance-card">
              <div className="card-header"><span>🔐</span> Compliance Breakdown</div>
              <div className="compliance-grid">
                <div className="compliance-col">
                  <h4 className="compliance-yes">✓ What IS Shared</h4>
                  <div className="compliance-item">Behavioral patterns (hashed)</div>
                  <div className="compliance-item">Risk scores (aggregated)</div>
                  <div className="compliance-item">Fraud outcomes</div>
                  <div className="compliance-item">Audit trail</div>
                </div>
                <div className="compliance-col">
                  <h4 className="compliance-no">✗ What is NOT Shared</h4>
                  <div className="compliance-item">Customer names</div>
                  <div className="compliance-item">Account numbers</div>
                  <div className="compliance-item">Transaction details</div>
                  <div className="compliance-item">Bank-specific PII</div>
                </div>
              </div>
              <div className="compliance-badges">
                <span className="compliance-badge">BSA ✓</span>
                <span className="compliance-badge">GDPR ✓</span>
                <span className="compliance-badge">314(b) ✓</span>
              </div>
            </div>

            <div className="privacy-banner">🔒 <strong>Privacy Preserved:</strong> Regulator sees actions and outcomes, but NO customer PII is exposed. All data is anonymized and compliant with BSA Section 314(b) and GDPR.</div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
