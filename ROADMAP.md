# AML Prediction Network - Roadmap

## 🎯 Current Status (January 25, 2026)
- ✅ Hackathon winner (Canton Catalyst 2026)
- ✅ Landing page: amlprediction.com
- ✅ Demo app: amlprediction.network
- ✅ Waitlist form active
- ✅ Social media: Twitter, LinkedIn, YouTube
- ✅ Compliance module (SAR auto-filing, Audit Log, Regulator View)
- 🔄 Mentorship program ongoing (until Feb 13)

---

## 🏦 Compliance Module (MVP)

### Core Principle
> Compliance is not an add-on module — it's a natural outcome of the DAML model

### DAML Template Structure
```daml
template PredictionMarket
  with
    creator : Party
    participants : [Party]
    regulator : Party
  where
    signatory creator
    observer participants ++ [regulator]  -- Regulator sees but cannot act
```

### Compliance UI (4 Tabs)

#### 1️⃣ Dashboard
- Transaction list
- Risk score display
- SAR alert (automatic)

#### 2️⃣ Prediction Markets
- Active voting
- Bank votes
- Weighted risk score

#### 3️⃣ Fraud Patterns
- Pattern library
- Shared patterns

#### 4️⃣ Regulator View
- SAR Reports list
- Audit Log
- Compliance Breakdown

### Auditor Node Permissions
| Permission | Available |
|------------|-----------|
| View active contracts | ✅ |
| View history | ✅ |
| Execute choices | ❌ |
| Delete data | ❌ |

---

## 📊 Phase 2 Features

### Pattern Similarity Scoring
- [ ] Characteristics-based similarity calculation
- [ ] 80%+ similarity = match
- [ ] MVP: exact match, Phase 2: similarity scoring

### Automatic Participant Selection
- [ ] FraudPattern observers become automatic participants
- [ ] Network membership system
- [ ] MVP: manual list, Phase 2: automatic

### Automatic Market Closing
- [ ] Market auto-closes when deadline reached
- [ ] Canton Automation or backend trigger
- [ ] MVP: manual, Phase 2: automatic

### Network Effects Dashboard
- [ ] Real metrics: bank count, detection rate, false positive rate
- [ ] Time-based growth chart
- [ ] Before/After comparison
- [ ] After DevNet deployment with real data

### SAR Auto-Filing ✅
- [x] Auto-create SAR when risk threshold (≥80%) exceeded
- [x] SARReport template (DAML)
- [x] AuditLog template (DAML)
- [x] Regulator AcknowledgeSAR choice
- [x] Frontend: SAR alert in transaction card
- [x] Frontend: Regulator View with SAR list + Audit Log

### Multi-Bank Demo
- [ ] 2-3 bank simulation
- [ ] Bank A shares pattern → Bank B sees instantly
- [ ] Privacy + collaboration demonstration

---

## 🎤 Key Demo Messages

1. **"The auditor can see everything, but cannot take any action."**
2. **"I cannot disable this rule from the backend."**
3. **"Even if we shut down our product, the ledger keeps running."**

---

## 📝 Notes

- Banks pay for "no risk" feeling, not "wow UI"
- Compliance should be natural, not bolted-on
- Small but deep MVP > Wide but shallow MVP
- RegTech market: $130B+ (2026), 31.87% annual growth
