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
- [ ] Deploy `canton-devnet-demo/demo-ui/` to Vercel
- [ ] Set root directory to `canton-devnet-demo/demo-ui`
- [ ] Add env vars: `TENZRO_API_KEY`, `TENZRO_TENANT_ID`
- [ ] Verify `/api/demo` and `/api/health` serverless functions work
- [ ] Test: `vercel.json` rewrites already configured

## 2. Animasyonlu Demo Flow
- [ ] Risk score sayaç animasyonu (0 → final score, counting up)
- [ ] Vote'lar tek tek gelsin (şu an `setTimeout` ile 400ms arayla geliyor, daha belirgin yapılabilir)
- [ ] Her vote geldiğinde risk score'un güncellenmesi (progressive calculation)
- [ ] Geçiş animasyonları (step transitions)

## 3. Before/After Toggle
- [ ] "Without AML Network" vs "With AML Network" karşılaştırma modu
- [ ] Without: Siloed detection, days delay, 95% false positive, fraudster escapes
- [ ] With: Network detection, real-time, 12% false positive, fraudster blocked
- [ ] Toggle/tab switch veya side-by-side layout

## 4. TX Counter
- [ ] "6 Canton transactions executed" gerçek zamanlı sayaç
- [ ] Her Daml exercise call'da counter artmalı (1 create + 5 vote = 6 tx)
- [ ] Backend'den `txId` bilgisi zaten geliyor (`votes[].txId`)
- [ ] Animasyonlu counter (her step'te artış)

## 5. SAR PDF Export (Bonus)
- [ ] PDF generation (jsPDF veya react-pdf)
- [ ] SAR report template: TX ID, risk score, votes, flags, timestamp
- [ ] Download butonu (step 3'te, riskScore >= 80 olduğunda)
