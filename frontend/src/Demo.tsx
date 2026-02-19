import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import './Demo.css'

const SCENARIOS = [
  { id: 'high', label: '🔴 High Risk — Crypto Wire Transfer', title: 'Crypto Wire Transfer', amount: '$25,000', destination: 'Crypto Exchange', customer: 'Entity #4821', flags: ['New account (< 30 days)', 'First crypto transaction', 'High-risk jurisdiction'] },
  { id: 'medium', label: '🟡 Medium Risk — International Wire', title: 'International Wire', amount: '$12,500', destination: 'Offshore Investment LLC', customer: 'Entity #7293', flags: ['Unusual amount pattern', 'New beneficiary'] },
  { id: 'low', label: '🟢 Low Risk — Domestic Transfer', title: 'Domestic Transfer', amount: '$3,200', destination: 'Verified Merchant', customer: 'Entity #1156', flags: ['Slightly above average'] },
]

const STEPS = ['Scenario', 'Detection', 'Decide', 'Network']

interface Vote { bank: string; confidence: number; weight: number; isRegulator?: boolean; txId?: string }
interface MarketResult { transactionId: string; votes: Vote[]; riskScore: number; action: string }

export default function Demo() {
  const [scenarioId, setScenarioId] = useState('high')
  const [step, setStep] = useState(0)
  const [ledgerConnected, setLedgerConnected] = useState(false)
  const [marketResult, setMarketResult] = useState<MarketResult | null>(null)
  const [animatedPredictions, setAnimatedPredictions] = useState<number[]>([])
  const [displayScore, setDisplayScore] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [userDecision, setUserDecision] = useState<string | null>(null)
  const [showScene2Result, setShowScene2Result] = useState(false)

  const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0]

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setLedgerConnected(d.status === 'ok')).catch(() => setLedgerConnected(false))
  }, [])

  // Step 1→2: auto-advance after detection animation
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Step 2: animate prediction bars
  useEffect(() => {
    if (step === 2 && marketResult?.votes) {
      setAnimatedPredictions([])
      marketResult.votes.forEach((_, i) => setTimeout(() => setAnimatedPredictions(prev => [...prev, i]), i * 600))
    }
  }, [step, marketResult])

  // Step 2: animate score counter
  useEffect(() => {
    if (step === 2 && marketResult && animatedPredictions.length === marketResult.votes.length) {
      const target = marketResult.riskScore
      let current = 0
      const timer = setInterval(() => {
        current += target / 20
        if (current >= target) { setDisplayScore(target); clearInterval(timer) }
        else setDisplayScore(Math.round(current * 10) / 10)
      }, 50)
      return () => clearInterval(timer)
    }
  }, [step, animatedPredictions, marketResult])

  // Step 3: show scene2 result after delay
  useEffect(() => {
    if (step === 3) {
      setShowScene2Result(false)
      const timer = setTimeout(() => setShowScene2Result(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const startDemo = async () => {
    setStep(1)
    setUserDecision(null)
    setShowScene2Result(false)
    const res = await fetch('/api/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario: scenarioId }) })
    const data = await res.json()
    if (data.success) setMarketResult(data.market)
  }

  const reset = useCallback(() => {
    setStep(0); setMarketResult(null); setAnimatedPredictions([]); setDisplayScore(0)
    setUserDecision(null); setShowConfirm(false); setShowScene2Result(false)
  }, [])

  const handleDecision = (action: string) => {
    if (action === 'block') { setShowConfirm(true); return }
    setUserDecision(action)
  }

  const confirmBlock = () => {
    setShowConfirm(false)
    setUserDecision('block')
  }

  const getDecisionLabel = (score: number) => {
    if (score >= 80) return { text: 'BLOCK TRANSACTION', icon: '🚨', type: 'danger' }
    if (score >= 60) return { text: 'ENHANCED DUE DILIGENCE', icon: '⚠️', type: 'warning' }
    return { text: 'APPROVE TRANSACTION', icon: '✅', type: 'success' }
  }

  const decision = marketResult ? getDecisionLabel(marketResult.riskScore) : null

  const exportSarPdf = () => {
    if (!marketResult) return
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    const now = new Date()
    let y = 15

    doc.setFillColor(15, 17, 19); doc.rect(0, 0, w, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('SUSPICIOUS ACTIVITY REPORT', w / 2, 15, { align: 'center' })
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    doc.text('AML Prediction Network — Canton DevNet', w / 2, 24, { align: 'center' })
    doc.text(`Filing Date: ${now.toLocaleDateString('en-US')}`, w / 2, 31, { align: 'center' })
    doc.setTextColor(0, 0, 0); y = 45

    doc.setFillColor(240, 240, 240); doc.rect(15, y, w - 30, 8, 'F')
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('PART I — TRANSACTION DETAILS', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Transaction ID: ${marketResult.transactionId}`, 20, y); y += 6
    doc.text(`Amount: ${scenario.amount} USD`, 20, y); y += 6
    doc.text(`Destination: ${scenario.destination}`, 20, y); y += 6
    doc.text(`SAR Reference: SAR-${marketResult.transactionId}`, 20, y); y += 12

    doc.setFillColor(240, 240, 240); doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART II — RISK INDICATORS', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    scenario.flags.forEach(f => { doc.text(`• ${f}`, 25, y); y += 6 }); y += 7

    doc.setFillColor(240, 240, 240); doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART III — NETWORK RISK ASSESSMENT', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Aggregated Risk Score: ${marketResult.riskScore}%`, 20, y); y += 6
    doc.text(`Network Decision: ${decision?.text}`, 20, y); y += 6
    doc.text('Participating Institutions:', 20, y); y += 6
    marketResult.votes.filter(v => !v.isRegulator).forEach(v => {
      doc.text(`  • ${v.bank}: ${v.confidence}% confidence (weight: ${v.weight})`, 25, y); y += 5
    }); y += 7

    doc.setFillColor(230, 255, 230); doc.rect(15, y, w - 30, 8, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('PART IV — CANTON NETWORK VERIFICATION', 20, y + 6); y += 15
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
    doc.text('This SAR was generated through privacy-preserving belief aggregation on Canton Network.', 20, y); y += 5
    doc.text('All signals are cryptographically verified and immutably recorded.', 20, y)

    doc.setFillColor(50, 50, 50); doc.rect(0, 280, w, 17, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(8)
    doc.text('CONFIDENTIAL — Generated by AML Prediction Network | Canton Network DevNet', w / 2, 287, { align: 'center' })
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
          <span className={`status-dot ${ledgerConnected ? 'connected' : ''}`} />
          <span>Canton DevNet</span>
        </div>
        {step > 0 && <button onClick={reset} className="btn-reset">↺ Reset</button>}
      </header>

      {step > 0 && (
        <div className="stepper">
          {STEPS.map((label, i) => {
            const s = i + 1
            const cls = step >= s ? (step > s ? 'done' : 'active') : ''
            return (
              <div key={i} className={`stepper-item ${cls}`}>
                <div className="stepper-dot">{step > s ? '✓' : i + 1}</div>
                <span className="stepper-label">{label}</span>
              </div>
            )
          })}
        </div>
      )}

      <main className="cinema-stage">
        {/* Step 0: Intro */}
        {step === 0 && (
          <div className="cinema-intro">
            <h1>From Shared Ledgers to Shared Judgment</h1>
            <p>See how institutions coordinate risk decisions without sharing data</p>
            <div className="intro-mechanism">
              <div className="mech-step"><div className="mech-icon">🏦🏦🏦</div><div className="mech-text">Each institution computes a local confidence signal</div></div>
              <div className="mech-arrow">→</div>
              <div className="mech-step"><div className="mech-icon">⚡</div><div className="mech-text">Canton aggregates signals with privacy boundaries</div></div>
              <div className="mech-arrow">→</div>
              <div className="mech-step"><div className="mech-icon">🎯</div><div className="mech-text">Shared risk score emerges — no data disclosed</div></div>
            </div>
            <div className="cinema-controls">
              <select value={scenarioId} onChange={e => setScenarioId(e.target.value)} className="scenario-select">
                {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button onClick={startDemo} className="btn-run">▶ Start Simulation</button>
            </div>
          </div>
        )}

        {/* Step 1: Detection */}
        {step === 1 && (
          <div className="cinema-demo step-pane">
            <div className="cinema-alert">
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h2>Suspicious Activity Detected</h2>
                <div className="alert-title">{scenario.title}</div>
                <div className="alert-meta"><span>{scenario.amount}</span><span>→</span><span>{scenario.destination}</span></div>
                <div className="alert-flags">{scenario.flags.map((f, i) => <span key={i} className="flag">⚠️ {f}</span>)}</div>
              </div>
              <div className="alert-tx">TX-{marketResult?.transactionId.split('-')[1]}</div>
            </div>
            <div className="step-hint">Analyzing across network...</div>
          </div>
        )}

        {/* Step 2: Aggregation & Decision */}
        {step === 2 && marketResult && (
          <div className="cinema-demo step-pane">
            <div className="cinema-market">
              <div className="market-header"><span>Risk Signal Aggregation</span><span className="live-badge">● LIVE</span></div>
              <div className="market-votes">
                {marketResult.votes.filter(v => !v.isRegulator).map((vote, i) => (
                  <div key={i} className={`vote-row ${animatedPredictions.includes(i) ? 'visible' : ''}`}>
                    <span className="vote-bank">🏦 {vote.bank}</span>
                    <div className="vote-bar"><div className="vote-fill" style={{ width: `${vote.confidence}%` }} /></div>
                    <span className="vote-pct">{vote.confidence}%</span>
                    <span className="vote-weight">w: {vote.weight}</span>
                  </div>
                ))}
                {marketResult.votes.filter(v => v.isRegulator).map((vote, i) => (
                  <div key={`r${i}`} className={`vote-row observer-row ${animatedPredictions.includes(marketResult.votes.indexOf(vote)) ? 'visible' : ''}`}>
                    <span className="vote-bank">🏛️ {vote.bank}</span>
                    <div className="vote-bar"><div className="vote-fill observer-fill" style={{ width: '100%' }} /></div>
                    <span className="vote-pct" style={{ color: 'var(--text-muted)' }}>—</span>
                    <span className="vote-weight">Observer</span>
                  </div>
                ))}
              </div>
            </div>

            {animatedPredictions.length === marketResult.votes.length && (
              <>
                <div className="cinema-result compact">
                  <div className="result-score">
                    <div className="score-number">{displayScore}<span>%</span></div>
                    <div className="score-label">Aggregated Risk Score</div>
                  </div>
                </div>

                {!userDecision && (
                  <div className="decision-actions">
                    <button className="btn-decision btn-block" onClick={() => handleDecision('block')}>🚨 Block Transaction</button>
                    <button className="btn-decision btn-flag" onClick={() => handleDecision('flag')}>📋 Flag for SAR</button>
                    <button className="btn-decision btn-allow" onClick={() => handleDecision('allow')}>✅ Allow</button>
                  </div>
                )}

                {userDecision && (
                  <div className="decision-outcome">
                    <div className={`result-decision ${decision!.type}`}>
                      <span>{decision!.icon}</span><span>{decision!.text}</span>
                    </div>
                    {(userDecision === 'block' || userDecision === 'flag') && marketResult.riskScore >= 60 && (
                      <div className="result-sar">
                        <span>📋 SAR Auto-Filed: SAR-{marketResult.transactionId}</span>
                        <button onClick={exportSarPdf} className="btn-export">Export PDF</button>
                      </div>
                    )}
                    <button onClick={() => setStep(3)} className="btn-next-scene">Next: Cross-Bank Detection →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Cross-Bank Network Impact */}
        {step === 3 && marketResult && (
          <div className="cinema-demo step-pane">
            <div className="scene2-divider"><span className="scene2-time">⏱ 30 minutes later...</span></div>
            <div className="cinema-alert scene2-alert">
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h2>Same Entity Detected at Bank B</h2>
                <div className="alert-title">Crypto Wire Transfer</div>
                <div className="alert-meta"><span>$18,500</span><span>→</span><span>Crypto Exchange</span></div>
                <div className="alert-flags">
                  <span className="flag flag-network">🔗 Known pattern from network</span>
                  <span className="flag">⚠️ Matching risk signature</span>
                  <span className="flag">⚠️ Flagged by 4 institutions</span>
                </div>
              </div>
              <div className="alert-tx">INSTANT</div>
            </div>

            {showScene2Result && (
              <div className="cinema-result scene2-result">
                <div className="result-score">
                  <div className="score-number">94<span>%</span></div>
                  <div className="score-label">Network Risk Score (Pre-Transaction)</div>
                </div>
                <div className="result-decision danger"><span>🚨</span><span>AUTO-BLOCKED · ZERO DELAY</span></div>
                <div className="scene2-impact">
                  <div className="impact-item"><span className="impact-num">Instant</span><span className="impact-lbl">Detection</span></div>
                  <div className="impact-item"><span className="impact-num">$18.5K</span><span className="impact-lbl">Loss Prevented</span></div>
                  <div className="impact-item"><span className="impact-num">4</span><span className="impact-lbl">Institutions Coordinated</span></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Confirm Block</h3>
            <p>Blocking will prevent this transaction and auto-file a SAR.</p>
            <div className="modal-actions">
              <button className="btn-decision btn-block" onClick={confirmBlock}>Confirm Block</button>
              <button className="btn-modal-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="cinema-footer">
        <span className="proof-badge">✓ Verified on Canton DevNet</span>
      </footer>
    </div>
  )
}
