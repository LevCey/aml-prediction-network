# AML Prediction Network

**Privacy-Preserving Fraud Detection for Financial Institutions**

🏆 **Canton Catalyst 2026 Winner** - Currently in Mentorship Program

**Landing Page:** [https://amlprediction.com](https://amlprediction.com)

**Live Demo:** [https://amlprediction.network](https://amlprediction.network)

**Video:** [https://youtu.be/OnXVF5nY2yI](https://youtu.be/OnXVF5nY2yI)

![Dashboard Screenshot](assets/images/dashboard-screenshot.png)


---

## Problem Statement

Financial institutions spend **$206B annually** on financial crime compliance (LexisNexis, 2023), with **95% false positive rates** in AML systems. Fraudsters share information across dark web networks, but banks cannot coordinate due to:

- **Bank Secrecy Act**: Customer data cannot be shared
- **GDPR/Privacy Laws**: Strict data protection requirements
- **Siloed Systems**: Each bank operates independently
- **Slow Response**: Days/weeks to detect repeat offenders

**Result**: Same fraudsters cycle through multiple banks undetected.

---

## Solution

**AML Prediction Network** leverages **Canton Network** to create a privacy-preserving, collaborative fraud detection system using **prediction markets**.

### Key Features

1. **Privacy-Preserving Pattern Sharing**
   - Banks share fraud patterns, NOT customer PII
   - Canton's selective disclosure ensures compliance
   - Zero-knowledge proofs validate patterns without exposing data

2. **Real-Time Prediction Markets**
   - Banks stake predictions on transaction fraud likelihood
   - Weighted risk scores aggregated across network
   - Incentive alignment: Correct predictions rewarded

3. **Regulatory Compliance**
   - BSA Section 314(b) compliant
   - GDPR-friendly (no personal data sharing)
   - Immutable audit trail for regulators
   - Auto-SAR filing at threshold

4. **Network Effects**
   - Each new bank increases detection accuracy
   - Collective intelligence grows exponentially
   - First-mover advantage = defensible moat

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         AML Prediction Network              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │Bank A│  │Bank B│  │Bank C│  │Bank D│   │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬──┘   │
│      │         │         │         │       │
│  ┌───▼─────────▼─────────▼─────────▼───┐   │
│  │   Canton Network (Privacy Layer)   │   │
│  └───┬─────────────────────────────┬───┘   │
│      │                             │       │
│  ┌───▼─────────────────────────────▼───┐   │
│  │   Prediction Market Contracts      │   │
│  │   (Daml Smart Contracts)           │   │
│  └───┬─────────────────────────────┬───┘   │
│      │                             │       │
│  ┌───▼─────────────────────────────▼───┐   │
│  │   Aggregated Risk Scores           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## How Prediction Markets Work

### Example Scenario

**1. Suspicious Transaction Detected**
```
Customer X: $25K wire to crypto exchange
- First time crypto user
- Account opened 2 weeks ago
- High-risk jurisdiction
```

**2. Market Created**
```
Binary prediction: "Is this fraud?"
Deadline: 24 hours
Initial odds: 50/50
```

**3. Banks Submit Predictions**
```
Bank A: 70% fraud (stakes $100)
Bank B: 30% fraud (stakes $50)
Bank C: 80% fraud (stakes $200)
Bank D: 45% fraud (stakes $75)
```

**4. Weighted Risk Score**
```
(70×100 + 30×50 + 80×200 + 45×75) / 425 = 65%

Action:
- >80% → Auto-block + manual review
- 60-80% → Enhanced due diligence
- <40% → Pass through
```

**5. Resolution & Rewards**
```
Outcome: Confirmed fraud
Winners: Banks A, C (high confidence + correct)
Losers: Banks B, D (penalties applied)
Reputation scores updated
```

---

## Regulatory Compliance

| Regulation | Challenge | Our Solution |
|------------|-----------|--------------|
| **Bank Secrecy Act** | Cannot share customer data | Share patterns, not PII |
| **Section 314(b)** | Requires FinCEN approval | Pre-approved framework with regulator nodes |
| **GDPR** | Right to be forgotten | Personal data stays local, only aggregated patterns shared |
| **KYC Requirements** | Duplicate effort across banks | Optional shared KYC utility with consent |
| **SAR Reporting** | One-way reporting to FinCEN | Bi-directional intelligence + auto-filing |

---

## Business Model

### Target Customers

1. **Tier 1 Banks**: $100K-500K/year → Access to network intelligence
2. **Regional Banks**: $10K-50K/year → Level playing field against big players
3. **Fintechs**: API access fee → Fast KYC/AML onboarding
4. **Regulators**: Free observer nodes → Real-time supervision

### Revenue Streams

- Subscription fees (tiered by institution size)
- Transaction prediction fees
- Pattern tokenization/listing fees
- API access for third-party integrations

### ROI for Banks

- **Cost Savings**: 30% reduction in false positives = $50B+ industry-wide
- **Risk Reduction**: Real-time detection vs. weeks/months delay
- **Compliance**: Automated SAR filing and audit trails

---

## MVP Features (Hackathon Scope)

### Core Functionality

- [x] **Transaction Risk Prediction Market**
  - Submit anonymized suspicious transactions
  - Banks vote on fraud probability
  - Weighted risk score calculation
  - Basic reward/penalty mechanism

- [x] **Pattern Library**
  - 5-10 common fraud patterns (pre-loaded)
  - Banks submit new patterns (anonymized)
  - Pattern matching algorithm
  - Similarity scoring

- [x] **Privacy Dashboard**
  - Transparency: What data is shared?
  - Consent management
  - Audit log viewer

- [x] **Regulator Observer Mode**
  - Read-only access
  - Network statistics
  - Compliance report generation

### Demo Scenario

```
Scene 1: Fraudster Hits Bank A
→ Bank A detects pattern, shares anonymously
→ Network learns fraud signature

Scene 2: Same Fraudster Tries Bank B (30 mins later)
→ Instant alert: "Known pattern detected"
→ Risk score: 85%
→ Transaction auto-blocked

Scene 3: Regulator Review
→ Audit trail shows decision rationale
→ BSA/GDPR compliant
→ Saved Bank B $50K loss
```

---

## Tech Stack

**Smart Contracts**
- Daml 2.x (Canton Network SDK)
- Multi-party computation contracts
- Privacy-preserving logic

**Backend**
- Node.js / Python (Canton integration)
- PostgreSQL (local bank data)
- REST API for bank integrations

**Frontend**
- React + TypeScript
- Recharts (risk visualization)
- D3.js (transaction flow maps)

**Privacy Layer**
- Canton Network selective disclosure
- Differential privacy (pattern aggregation)
- Zero-knowledge proofs (stretch goal)

**DevOps**
- Docker containers
- Canton local sandbox
- CI/CD with GitHub Actions

---

## Success Metrics

### Hackathon Judges

- ✅ Solves real-world problem (not toy example)
- ✅ Canton-native (impossible without Canton)
- ✅ Regulatory compliance demonstrated
- ✅ Working prototype with live demo
- ✅ Clear business model + GTM strategy

### Real-World Impact

- **Fraud Detection Accuracy**: +20% improvement
- **False Positive Reduction**: -30% (saves $50B+ annually)
- **Detection Speed**: 24 hours → Real-time
- **Network Effects**: Value grows exponentially with each bank

---

## Competitive Differentiation

| Competitor | Limitation | Our Advantage |
|------------|-----------|---------------|
| **Traditional AML (FICO, SAS)** | Siloed, no network effects | Collective intelligence, gets smarter |
| **Blockchain Analytics (Chainalysis)** | Public chains only, post-facto | Traditional banking, real-time prevention |
| **Info Sharing (SWIFT, FIN-ISAC)** | Slow, manual, limited privacy | Automated, privacy-preserving, real-time |
| **Prediction Markets (Polymarket)** | Not compliant, retail focus | Regulation-first, B2B, institutional |

---

## Roadmap

### Phase 1: MVP ✅ (Hackathon)
- Prediction market contracts (Daml)
- Weighted risk scoring
- Pattern library
- Privacy dashboard & regulator observer mode
- SAR auto-filing & audit log

### Phase 2: Enhanced Network (Current)
- Pattern similarity scoring
- Automatic participant selection
- Multi-bank demo simulation
- Network effects dashboard

### Phase 3: Federated Learning Integration
- **Federated ML layer** — Banks collaboratively train fraud detection models without sharing raw data
- **Canton as FL coordinator** — Daml contracts manage FL rounds, participant registration, and aggregation rules
- **Off-chain ML training** — Each bank trains locally (Python/Flower), only encrypted model updates shared via Canton
- **Hybrid intelligence** — FL model outputs feed into prediction markets, improving bank vote accuracy
- **Closed-loop learning** — Market outcomes (confirmed fraud/legit) feed back into FL model training
- **Differential privacy** — Additional privacy guarantees on model updates before aggregation

```
Bank A (local training) ──┐
Bank B (local training) ──┤── Canton Network ──▶ Aggregated Model ──▶ Prediction Market
Bank C (local training) ──┘   (coordination)     (shared intelligence)  (enhanced votes)
```

> Inspired by real-world deployments: Singapore MAS/COSMIC, Hong Kong HKMA pilots, Banking Circle (EU). FL has demonstrated 60-80% false positive reduction and up to 300% detection improvement in production environments.

---

## Team

**Solo Developer** (hackathon submission)

Open to collaboration! Looking for:
- Compliance/AML domain experts
- Canton/Daml developers
- Frontend React developers

---

## Resources

**Regulatory References**
- FinCEN Section 314(b) Fact Sheet
- EU 6th AML Directive (Directive 2018/1673)
- Bank Secrecy Act Guidelines

**Technical Documentation**
- [Daml Documentation](https://docs.daml.com/)
- Canton Network Documentation
- Privacy-preserving smart contracts

**Market Research**
- Global AML compliance costs: $206B+ annually (LexisNexis, 2023)
- False positive rates in traditional systems: 95%+
- Financial crime detection accuracy improvements with collaborative networks

---

## License

MIT License - Open source post-hackathon

---

🏆 Canton Catalyst 2026 Winner
