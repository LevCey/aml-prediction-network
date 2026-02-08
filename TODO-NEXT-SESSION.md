# TODO - Next Session
> Created: 2026-02-08 18:30

## File Locations
- **UI:** `canton-devnet-demo/demo-ui/` (React + Vite + TypeScript)
- **Backend:** `canton-devnet-demo/backend/` (Node.js, Tenzro/Canton integration)
- **Vercel API routes:** `canton-devnet-demo/demo-ui/api/` (demo.js, health.js)
- **Daml contracts:** `daml/aml-network/`
- **Main component:** `canton-devnet-demo/demo-ui/src/App.tsx` (~280 lines, single file)

## Current State
- Demo UI working locally with Tenzro/Canton DevNet backend
- `vercel.json` exists with API rewrites
- Env vars needed: `TENZRO_API_KEY`, `TENZRO_TENANT_ID` (see `backend/.env.tenzro`)
- 5 banks + FinCEN regulator, 3 scenarios (high/medium/low risk)
- 3-step demo flow: Alert → Predictions → Risk Score + SAR

---

## 1. Vercel Deploy
- [x] Deploy `canton-devnet-demo/demo-ui/` to Vercel
- [x] Set root directory to `canton-devnet-demo/demo-ui`
- [x] Add env vars: `TENZRO_API_KEY`, `TENZRO_TENANT_ID`
- [x] Verify `/api/demo` and `/api/health` serverless functions work
- [x] Test: `vercel.json` rewrites already configured

## 2. Animasyonlu Demo Flow
- [x] Risk score sayaç animasyonu (0 → final score, counting up)
- [x] Vote'lar tek tek gelsin (800ms arayla, eskiden 400ms)
- [x] Her vote geldiğinde risk score'un güncellenmesi (progressive calculation)
- [x] Geçiş animasyonları (step transitions)

## 3. Before/After Toggle
- [x] "Without AML Network" vs "With AML Network" karşılaştırma modu
- [x] Without: Siloed detection, days delay, 95% false positive, fraudster escapes
- [x] With: Network detection, real-time, 12% false positive, fraudster blocked
- [x] Side-by-side layout in start card

## 4. TX Counter
- [x] "6 Canton transactions executed" gerçek zamanlı sayaç
- [x] Her Daml exercise call'da counter artmalı (1 create + 5 vote = 6 tx)
- [x] Backend'den `txId` bilgisi zaten geliyor (`votes[].txId`)
- [x] Animasyonlu counter (her step'te artış) + pulse animation

## 5. SAR PDF Export (Bonus)
- [x] PDF generation (jsPDF)
- [x] SAR report template: TX ID, risk score, votes, flags, timestamp
- [x] Download butonu (step 3'te, riskScore >= 80 olduğunda)
