import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import './Demo.css'

const SCENARIOS = [
  { id: 'high', label: '🔴 High Risk', title: 'Crypto Wire Transfer', amount: '$25,000', destination: 'Binance (Crypto Exchange)', customer: 'Customer #4821', flags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'] },
  { id: 'medium', label: '🟡 Medium Risk', title: 'International Wire', amount: '$12,500', destination: 'Dubai Investment LLC', customer: 'Customer #7293', flags: ['Unusual amount pattern', 'New beneficiary'] },
  { id: 'low', label: '🟢 Low Risk', title: 'Domestic Transfer', amount: '$3,200', destination: 'Verified Merchant', customer: 'Customer #1156', flags: ['Slightly above average'] },
]

interface Vote { bank: string; confidence: number; stake: number; isRegulator?: boolean; txId?: string }
interface MarketResult { transactionId: string; votes: Vote[]; riskScore: number; action: string }

export default function Demo() {
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
    fetch('/api/health').then(r => r.json()).then(d => setLedgerConnected(d.status === 'ok')).catch(() => setLedgerConnected(false))
  }, [])

  useEffect(() => {
    if (step === 2 && marketResult?.votes) {
      setAnimatedPredictions([])
      marketResult.votes.forEach((_, i) => setTimeout(() => setAnimatedPredictions(prev => [...prev, i]), i * 800))
    }
  }, [step, marketResult])

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  useEffect(() => {
    if (step === 2 && marketResult && animatedPredictions.length === marketResult.votes.length) {
      const timer = setTimeout(() => setStep(3), 1500)
      return () => clearTimeout(timer)
    }
  }, [step, animatedPredictions, marketResult])

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

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setStep(5), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const startDemo = async () => {
    setStep(1)
    const res = await fetch('/api/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: scenarioId }) })
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
    const now = new Date()
    let y = 15

    // Header
    doc.setFillColor(30, 64, 170)
    doc.rect(0, 0, w, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('SUSPICIOUS ACTIVITY REPORT', w / 2, 15, { align: 'center' })
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    doc.text('FinCEN Form 111 | AML Prediction Network', w / 2, 24, { align: 'center' })
    doc.text(`Filing Date: ${now.toLocaleDateString('en-US')}`, w / 2, 31, { align: 'center' })

    doc.setTextColor(0, 0, 0)
    y = 45

    // Section 1: Filing Institution
    doc.setFillColor(240, 240, 240)
    doc.rect(15, y, w - 30, 8, 'F')
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('PART I - FILING INSTITUTION', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text('Filing Institution: JPMorgan Chase & Co.', 20, y); y += 6
    doc.text('Institution Type: Bank Holding Company', 20, y); y += 6
    doc.text('Primary Federal Regulator: OCC', 20, y); y += 6
    doc.text(`SAR Reference: SAR-${marketResult.transactionId}`, 20, y); y += 12

    // Section 2: Suspicious Activity
    doc.setFillColor(240, 240, 240)
    doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART II - SUSPICIOUS ACTIVITY INFORMATION', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Transaction ID: ${marketResult.transactionId}`, 20, y); y += 6
    doc.text(`Amount Involved: ${scenario.amount} USD`, 20, y); y += 6
    doc.text(`Date of Activity: ${now.toLocaleDateString('en-US')}`, 20, y); y += 6
    doc.text(`Destination: ${scenario.destination}`, 20, y); y += 10

    doc.setFont('helvetica', 'bold')
    doc.text('Suspicious Activity Type:', 20, y); y += 6
    doc.setFont('helvetica', 'normal')
    doc.text('[X] Structuring / Money Laundering', 25, y); y += 5
    doc.text('[X] Wire Transfer Fraud', 25, y); y += 5
    doc.text('[X] Cryptocurrency / Virtual Currency', 25, y); y += 10

    doc.setFont('helvetica', 'bold')
    doc.text('Risk Indicators:', 20, y); y += 6
    doc.setFont('helvetica', 'normal')
    scenario.flags.forEach(f => { doc.text(`• ${f}`, 25, y); y += 5 })
    y += 7

    // Section 3: Network Analysis
    doc.setFillColor(240, 240, 240)
    doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART III - NETWORK RISK ASSESSMENT', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Aggregated Risk Score: ${marketResult.riskScore}%`, 20, y); y += 6
    doc.text(`Network Decision: ${decision?.text}`, 20, y); y += 6
    doc.text('Participating Institutions:', 20, y); y += 6
    marketResult.votes.filter(v => !v.isRegulator).forEach(v => {
      doc.text(`  • ${v.bank}: ${v.confidence}% confidence ($${v.stake} stake)`, 25, y); y += 5
    })
    y += 7

    // Section 4: Ledger Verification
    doc.setFillColor(230, 255, 230)
    doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART IV - CANTON NETWORK VERIFICATION', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    doc.text('This SAR was generated through privacy-preserving consensus on Canton Network.', 20, y); y += 5
    doc.text('All votes are cryptographically verified and immutably recorded.', 20, y); y += 8
    doc.setFontSize(8)
    marketResult.votes.filter(v => v.txId).slice(0, 3).forEach(v => {
      doc.text(`${v.bank} TX: ${v.txId}`, 20, y); y += 4
    })

    // Footer
    doc.setFillColor(50, 50, 50)
    doc.rect(0, 280, w, 17, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('CONFIDENTIAL - For Law Enforcement Use Only | BSA/AML Compliant | GDPR Article 6(1)(c)', w / 2, 287, { align: 'center' })
    doc.text('Generated by AML Prediction Network | Canton Network DevNet', w / 2, 293, { align: 'center' })

    doc.save(`SAR-${marketResult.transactionId}.pdf`)
  }

  return (
    <div className="demo-app cinematic">
      <header className="cinema-header">
        <Link to="/" className="cinema-logo">
          <img src="/logo.jpg" alt="AML" className="logo-img" />
          <span>AML Prediction Network</span>
        </Link>
        <div className="cinema-status">
          <span className={`status-dot ${ledgerConnected ? 'connected' : 'disconnected'}`}></span>
          <span>Canton DevNet</span>
          {txCount > 0 && <span className="tx-counter">⛓ {txCount} TX</span>}
        </div>
        {step > 0 && <button onClick={reset} className="btn-reset">↺ Reset</button>}
      </header>

      <main className="cinema-stage">
        {step === 0 && (
          <div className="cinema-intro">
            <h1>Privacy-Preserving Fraud Detection</h1>
            <p>Real-time collaborative AML powered by Canton Network</p>
            <div className="hero-stat">
              <span className="hero-from">95%</span>
              <span className="hero-arrow">→</span>
              <span className="hero-to">~65%</span>
            </div>
            <div className="hero-label">False Positive Rate · Projected 30% Reduction</div>
            <div className="cinema-comparison">
              <div className="compare-box compare-without">
                <h3>❌ Without AML Network</h3>
                <ul><li><strong className="stat-bad">95%</strong> false positive rate</li><li>Each bank detects alone</li><li>Post-transaction detection (days/weeks)</li><li>Fraudsters cycle between banks</li></ul>
              </div>
              <div className="compare-box compare-with">
                <h3>✅ With AML Network</h3>
                <ul><li><strong className="stat-good">~65%</strong> false positive rate (projected)</li><li>Cross-bank intelligence network</li><li>Pre-transaction risk scoring</li><li>Proactive fraud prevention</li></ul>
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
            <div className={`cinema-alert ${step >= 1 ? 'visible' : ''}`}>
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h2>Suspicious Transaction Detected</h2>
                <div className="alert-title">{scenario.title}</div>
                <div className="alert-meta"><span>{scenario.amount}</span><span>→</span><span>{scenario.destination}</span></div>
                <div className="alert-flags">{scenario.flags.map((f, i) => <span key={i} className="flag">⚠️ {f}</span>)}</div>
              </div>
              <div className="alert-tx">TX-{marketResult?.transactionId.split('-')[1]}</div>
            </div>

            {step >= 2 && marketResult && (
              <div className="cinema-market">
                <div className="market-header"><span>📊 Prediction Market</span><span className="live-badge">● LIVE</span></div>
                <div className="market-votes">
                  {marketResult.votes.filter(v => !v.isRegulator).map((vote, i) => (
                    <div key={i} className={`vote-row ${animatedPredictions.includes(i) ? 'visible' : ''}`}>
                      <span className="vote-bank">🏦 {vote.bank}</span>
                      <div className="vote-bar"><div className="vote-fill" style={{ width: `${vote.confidence}%`, background: vote.confidence > 70 ? '#ef4444' : vote.confidence > 50 ? '#f59e0b' : '#22c55e' }}></div></div>
                      <span className="vote-pct">{vote.confidence}%</span>
                      <span className="vote-stake">${vote.stake}</span>
                    </div>
                  ))}
                  {marketResult.votes.filter(v => v.isRegulator).map((vote, i) => (
                    <div key={`reg-${i}`} className={`vote-row observer-row ${animatedPredictions.includes(marketResult.votes.indexOf(vote)) ? 'visible' : ''}`}>
                      <span className="vote-bank">🏛️ {vote.bank}</span>
                      <div className="vote-bar"><div className="vote-fill observer-fill" style={{ width: '100%' }}></div></div>
                      <span className="vote-pct" style={{ color: '#64748b' }}>—</span>
                      <span className="vote-stake">Observer</span>
                    </div>
                  ))}
                </div>
                {animatedPredictions.length > 0 && step < 3 && (
                  <div className="running-score"><span>Running Score:</span><span className={liveRiskScore >= 80 ? 'danger' : liveRiskScore >= 60 ? 'warning' : 'safe'}>{liveRiskScore}%</span></div>
                )}
              </div>
            )}

            {step >= 3 && marketResult && decision && (
              <div className="cinema-result">
                <div className="result-score"><div className="score-number">{displayScore}<span>%</span></div><div className="score-label">Aggregated Risk Score</div></div>
                <div className={`result-decision ${decision.type}`}><span>{decision.icon}</span><span>{decision.text}</span></div>
                {marketResult.riskScore >= 80 && (
                  <div className="result-sar"><span>📋 SAR Auto-Filed: SAR-{marketResult.transactionId}</span><button onClick={exportSarPdf} className="btn-export">Export PDF</button></div>
                )}
                {step === 3 && marketResult.riskScore >= 80 && <button onClick={() => setStep(4)} className="btn-next-scene">Next: Cross-Bank Detection →</button>}
              </div>
            )}

            {step >= 4 && (
              <div className="cinema-scene2">
                <div className="scene2-divider">
                  <span className="scene2-time">⏱ 30 minutes later...</span>
                </div>
                <div className={`cinema-alert scene2-alert ${step >= 4 ? 'visible' : ''}`}>
                  <div className="alert-icon">🚨</div>
                  <div className="alert-content">
                    <h2>Same Fraudster Detected at Bank B</h2>
                    <div className="alert-title">Crypto Wire Transfer</div>
                    <div className="alert-meta"><span>$18,500</span><span>→</span><span>KuCoin (Crypto Exchange)</span></div>
                    <div className="alert-flags">
                      <span className="flag flag-network">🔗 Known pattern from network</span>
                      <span className="flag">⚠️ Matching fraud signature</span>
                      <span className="flag">⚠️ Flagged by 4 institutions</span>
                    </div>
                  </div>
                  <div className="alert-tx">INSTANT</div>
                </div>
                {step >= 5 && (
                  <div className="cinema-result scene2-result">
                    <div className="result-score"><div className="score-number">94<span>%</span></div><div className="score-label">Network Risk Score (Pre-Transaction)</div></div>
                    <div className="result-decision danger"><span>🚨</span><span>AUTO-BLOCKED · ZERO DELAY</span></div>
                    <div className="scene2-impact">
                      <div className="impact-item"><span className="impact-num">0s</span><span className="impact-lbl">Detection Time</span></div>
                      <div className="impact-item"><span className="impact-num">$18.5K</span><span className="impact-lbl">Loss Prevented</span></div>
                      <div className="impact-item"><span className="impact-num">5</span><span className="impact-lbl">Banks Protected</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {(step === 3 || step === 5) && marketResult && (
        <footer className="cinema-footer">
          <span className="proof-badge">✓ Verified on Canton DevNet</span>
          <div className="proof-txs">{marketResult.votes.filter(v => v.txId).map((v, i) => <span key={i} className="proof-tx">{v.bank}: {v.txId!.slice(0, 8)}...</span>)}</div>
        </footer>
      )}
    </div>
  )
}
