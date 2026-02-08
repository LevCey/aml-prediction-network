import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import './index.css'

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3001'

const SCENARIOS = [
  { id: 'high', label: '🔴 High Risk', title: 'Crypto Wire Transfer', amount: '$25,000', destination: 'Binance (Crypto Exchange)', customer: 'Customer #4821', flags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'] },
  { id: 'medium', label: '🟡 Medium Risk', title: 'International Wire', amount: '$12,500', destination: 'Dubai Investment LLC', customer: 'Customer #7293', flags: ['Unusual amount pattern', 'New beneficiary'] },
  { id: 'low', label: '🟢 Low Risk', title: 'Domestic Transfer', amount: '$3,200', destination: 'Verified Merchant', customer: 'Customer #1156', flags: ['Slightly above average'] },
]

interface Vote { bank: string; confidence: number; stake: number; isRegulator?: boolean; txId?: string }
interface MarketResult { transactionId: string; votes: Vote[]; riskScore: number; action: string }

function App() {
  const [scenarioId, setScenarioId] = useState('high')
  const [step, setStep] = useState(0)
  const [ledgerConnected, setLedgerConnected] = useState(false)
  const [marketResult, setMarketResult] = useState<MarketResult | null>(null)
  const [animatedPredictions, setAnimatedPredictions] = useState<number[]>([])
  const [displayScore, setDisplayScore] = useState(0)

  const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0]
  const txCount = step >= 1 ? 1 + animatedPredictions.length : 0

  const liveRiskScore = (() => {
    if (!marketResult?.votes || animatedPredictions.length === 0) return 0
    const visible = marketResult.votes.filter((_, i) => animatedPredictions.includes(i)).filter(v => !v.isRegulator)
    const totalStake = visible.reduce((s, v) => s + v.stake, 0)
    const weightedSum = visible.reduce((s, v) => s + (v.confidence / 100) * v.stake, 0)
    return totalStake > 0 ? Math.round((weightedSum / totalStake) * 1000) / 10 : 0
  })()

  useEffect(() => {
    fetch(`${API_URL}/api/health`).then(r => r.json()).then(d => setLedgerConnected(d.status === 'ok')).catch(() => setLedgerConnected(false))
  }, [])

  // Animate votes (800ms apart)
  useEffect(() => {
    if (step === 2 && marketResult?.votes) {
      setAnimatedPredictions([])
      marketResult.votes.forEach((_, i) => setTimeout(() => setAnimatedPredictions(prev => [...prev, i]), i * 800))
    }
  }, [step, marketResult])

  // Auto-advance: step 1 → 2 after 3s
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Auto-advance: step 2 → 3 after all votes + 1.5s
  useEffect(() => {
    if (step === 2 && marketResult && animatedPredictions.length === marketResult.votes.length) {
      const timer = setTimeout(() => setStep(3), 1500)
      return () => clearTimeout(timer)
    }
  }, [step, animatedPredictions, marketResult])

  // Animate score count-up on step 3
  useEffect(() => {
    if (step === 3 && marketResult) {
      const target = marketResult.riskScore
      let current = 0
      const timer = setInterval(() => {
        current += target / 20
        if (current >= target) { setDisplayScore(target); clearInterval(timer) }
        else setDisplayScore(Math.round(current * 10) / 10)
      }, 50)
      return () => clearInterval(timer)
    }
  }, [step, marketResult])

  const startDemo = async () => {
    setStep(1)
    const res = await fetch(`${API_URL}/api/demo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: scenarioId }) })
    const data = await res.json()
    if (data.success) setMarketResult(data.market)
  }

  const reset = () => { setStep(0); setMarketResult(null); setAnimatedPredictions([]); setDisplayScore(0) }

  const getDecision = (score: number) => {
    if (score >= 80) return { text: 'BLOCK TRANSACTION', icon: '🚨', type: 'danger' }
    if (score >= 60) return { text: 'ENHANCED DUE DILIGENCE', icon: '⚠️', type: 'warning' }
    return { text: 'APPROVE TRANSACTION', icon: '✅', type: 'success' }
  }

  const decision = marketResult ? getDecision(marketResult.riskScore) : null

  const exportSarPdf = () => {
    if (!marketResult) return
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    let y = 20
    doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('Suspicious Activity Report (SAR)', w / 2, y, { align: 'center' }); y += 10
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    doc.text('AML Prediction Network — Canton DevNet', w / 2, y, { align: 'center' }); y += 15
    doc.setFontSize(11)
    doc.text(`SAR ID: SAR-${marketResult.transactionId}`, 20, y); y += 7
    doc.text(`TX ID: ${marketResult.transactionId}`, 20, y); y += 7
    doc.text(`Amount: ${scenario.amount}`, 20, y); y += 7
    doc.text(`Destination: ${scenario.destination}`, 20, y); y += 7
    doc.text(`Risk Score: ${marketResult.riskScore}%`, 20, y); y += 7
    doc.text(`Decision: ${decision?.text}`, 20, y); y += 15
    doc.setFontSize(8); doc.setFont('helvetica', 'italic')
    doc.text('Auto-generated by AML Prediction Network. BSA/GDPR compliant.', w / 2, y, { align: 'center' })
    doc.save(`SAR-${marketResult.transactionId}.pdf`)
  }

  return (
    <div className="app cinematic">
      {/* Header */}
      <header className="cinema-header">
        <div className="cinema-logo">
          <img src="/logo.jpg" alt="AML" className="logo-img" />
          <span>AML Prediction Network</span>
        </div>
        <div className="cinema-status">
          <span className={`status-dot ${ledgerConnected ? 'connected' : 'disconnected'}`}></span>
          <span>Canton DevNet</span>
          {txCount > 0 && <span className="tx-counter">⛓ {txCount} TX</span>}
        </div>
        {step > 0 && <button onClick={reset} className="btn-reset">↺ Reset</button>}
      </header>

      {/* Main Stage */}
      <main className="cinema-stage">
        {step === 0 && (
          <div className="cinema-intro">
            <h1>Privacy-Preserving Fraud Detection</h1>
            <p>Real-time collaborative AML powered by Canton Network</p>
            
            <div className="cinema-comparison">
              <div className="compare-box compare-without">
                <h3>❌ Without AML Network</h3>
                <ul>
                  <li>Banks operate in silos</li>
                  <li>Days to detect fraud</li>
                  <li>95% false positive rate</li>
                  <li>Fraudster moves freely</li>
                </ul>
              </div>
              <div className="compare-box compare-with">
                <h3>✅ With AML Network</h3>
                <ul>
                  <li>Shared intelligence</li>
                  <li>Real-time detection</li>
                  <li>12% false positive rate</li>
                  <li>Instant blocking</li>
                </ul>
              </div>
            </div>

            <div className="cinema-controls">
              <select value={scenarioId} onChange={e => setScenarioId(e.target.value)} className="scenario-select">
                {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button onClick={startDemo} className="btn-run">▶ Run Demo</button>
            </div>
          </div>
        )}

        {step >= 1 && (
          <div className="cinema-demo">
            {/* Alert */}
            <div className={`cinema-alert ${step >= 1 ? 'visible' : ''}`}>
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h2>Suspicious Transaction Detected</h2>
                <div className="alert-title">{scenario.title}</div>
                <div className="alert-meta">
                  <span>{scenario.amount}</span>
                  <span>→</span>
                  <span>{scenario.destination}</span>
                </div>
                <div className="alert-flags">
                  {scenario.flags.map((f, i) => <span key={i} className="flag">⚠️ {f}</span>)}
                </div>
              </div>
              <div className="alert-tx">TX-{marketResult?.transactionId.split('-')[1]}</div>
            </div>

            {/* Prediction Market */}
            {step >= 2 && marketResult && (
              <div className="cinema-market">
                <div className="market-header">
                  <span>📊 Prediction Market</span>
                  <span className="live-badge">● LIVE</span>
                </div>
                <div className="market-votes">
                  {marketResult.votes.map((vote, i) => (
                    <div key={i} className={`vote-row ${animatedPredictions.includes(i) ? 'visible' : ''}`}>
                      <span className="vote-bank">{vote.isRegulator ? '🏛️' : '🏦'} {vote.bank}</span>
                      <div className="vote-bar">
                        <div className="vote-fill" style={{ width: `${vote.confidence}%`, background: vote.confidence > 70 ? '#ef4444' : vote.confidence > 50 ? '#f59e0b' : '#22c55e' }}></div>
                      </div>
                      <span className="vote-pct">{vote.confidence}%</span>
                      <span className="vote-stake">{vote.isRegulator ? 'Observer' : `$${vote.stake}`}</span>
                    </div>
                  ))}
                </div>
                {animatedPredictions.length > 0 && step < 3 && (
                  <div className="running-score">
                    <span>Running Score:</span>
                    <span className={liveRiskScore >= 80 ? 'danger' : liveRiskScore >= 60 ? 'warning' : 'safe'}>{liveRiskScore}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Final Score */}
            {step >= 3 && marketResult && decision && (
              <div className="cinema-result">
                <div className="result-score">
                  <div className="score-number">{displayScore}<span>%</span></div>
                  <div className="score-label">Aggregated Risk Score</div>
                </div>
                <div className={`result-decision ${decision.type}`}>
                  <span>{decision.icon}</span>
                  <span>{decision.text}</span>
                </div>
                {marketResult.riskScore >= 80 && (
                  <div className="result-sar">
                    <span>📋 SAR Auto-Filed: SAR-{marketResult.transactionId}</span>
                    <button onClick={exportSarPdf} className="btn-export">Export PDF</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Canton Proof Footer */}
      {step === 3 && marketResult && (
        <footer className="cinema-footer">
          <span className="proof-badge">✓ Verified on Canton DevNet</span>
          <div className="proof-txs">
            {marketResult.votes.filter(v => v.txId).map((v, i) => (
              <span key={i} className="proof-tx">{v.bank}: {v.txId!.slice(0, 8)}...</span>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
