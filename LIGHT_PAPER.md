# AML Prediction Network
## Privacy-Preserving Collaborative Fraud Detection

**Light Paper v1.0 | February 2026**

---

## The Problem: Fighting Fraud in Silos

Financial institutions spend **$206 billion annually** on financial crime compliance¹, yet **95% of AML alerts are false positives²**. Meanwhile, criminals successfully launder an estimated **$800 billion to $2 trillion per year** — representing 2-5% of global GDP³.

Why? Because banks fight fraud in isolation.

**The Criminal Advantage:**
- Fraudsters share tactics on dark web forums
- They spread transactions across multiple banks
- Each bank sees only a fragment of the pattern
- By the time one bank detects fraud, the money has moved

**The Bank Disadvantage:**
- Privacy laws (BSA, GDPR) prevent data sharing
- Each bank operates its own siloed AML system
- No visibility into cross-institutional patterns
- Same fraudster hits multiple banks undetected

---

## A Real-World Scenario

### Without AML Prediction Network

```
Day 1, 9:00 AM
├── Fraudster deposits $8,500 at Bank A
├── Bank A's system: "Normal transaction" ✓
│
├── Fraudster deposits $9,000 at Bank B  
├── Bank B's system: "Normal transaction" ✓
│
├── Fraudster deposits $7,500 at Bank C
├── Bank C's system: "Normal transaction" ✓
│
Day 1, 2:00 PM
├── All funds wired to offshore shell company
├── Money successfully laundered
│
Day 14
└── Bank A finally detects pattern... too late
```

**Result:** $25,000 laundered. Three banks victimized. Zero coordination.

### With AML Prediction Network

```
Day 1, 9:00 AM
├── Fraudster deposits $8,500 at Bank A
├── Bank A flags: "Suspicious pattern detected"
├── → Pattern shared to network (anonymized)
│
├── Fraudster attempts $9,000 at Bank B
├── Network alert: "Known pattern match - 78% risk"
├── → Transaction blocked for review
│
├── Fraudster attempts $7,500 at Bank C
├── Network alert: "Known pattern match - 85% risk"  
├── → Transaction blocked, SAR auto-filed
│
Day 1, 2:15 PM
└── Fraud ring disrupted. $16,500 saved.
```

**Result:** Real-time detection. Cross-bank coordination. Fraud prevented.

---

## How It Works

### The Prediction Market Approach

Instead of sharing customer data, banks share **predictions** about transaction risk.

```
┌─────────────────────────────────────────────────────────┐
│                  PREDICTION MARKET                       │
│                                                          │
│   Bank A sees suspicious transaction                     │
│   → Creates anonymized market: "Is this fraud?"          │
│                                                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │  Bank A  │ │  Bank B  │ │  Bank C  │ │  Bank D  │  │
│   │  Vote:   │ │  Vote:   │ │  Vote:   │ │  Vote:   │  │
│   │  70%     │ │  30%     │ │  80%     │ │  45%     │  │
│   │  Stake:  │ │  Stake:  │ │  Stake:  │ │  Stake:  │  │
│   │  $100    │ │  $50     │ │  $200    │ │  $75     │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│   Weighted Risk Score:                                   │
│   (70×100 + 30×50 + 80×200 + 45×75) / 425 = 65%        │
│                                                          │
│   Action: Enhanced Due Diligence                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Innovation:** Banks stake reputation on their predictions. Accurate predictions are rewarded. Inaccurate predictions carry penalties. This creates **incentive alignment** — banks only share high-quality intelligence.

### Stake & Resolution Mechanism

**What is staked?** Banks stake reputation points (not real money). Each bank starts with a base reputation score. Correct predictions increase it, incorrect predictions decrease it. Higher reputation = more weight in future risk scores.

**How are markets resolved?** A prediction market resolves when one of the following occurs:
- SAR investigation outcome is reported (confirmed fraud or cleared)
- Regulatory determination is issued
- 90-day timeout with no fraud confirmation → resolved as "not fraud"

Resolution triggers automatic reputation updates for all participating banks.

### Network Bootstrap (Cold Start)

In the early phase with few participants, prediction markets are supplemented by:
- **Pre-loaded pattern library** with 50+ known fraud typologies
- **Historical data scoring** — patterns matched against known fraud databases
- **Minimum participant threshold** — markets require at least 3 votes before generating actionable risk scores

As the network grows, collective intelligence compounds and accuracy increases with each new participant.

### What Gets Shared vs. What Stays Private

| Shared on Network | Stays at Bank |
|-------------------|---------------|
| Transaction patterns | Customer names |
| Risk predictions | Account numbers |
| Behavioral signals | Personal addresses |
| Aggregated scores | Transaction details |
| Audit trail | Raw data |

**Privacy Guarantee:** Canton Network's sub-transaction privacy ensures each bank controls exactly what they share. Smart contracts enforce these boundaries cryptographically.

---

## Technical Architecture

### Built on Canton Network

```
┌─────────────────────────────────────────────────────────┐
│                    Canton Network                        │
│              (Privacy-Preserving Layer)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Bank A    │  │   Bank B    │  │  Regulator  │     │
│  │   Node      │  │   Node      │  │   Node      │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│              ┌───────────▼───────────┐                  │
│              │   Daml Smart Contracts │                  │
│              │                        │                  │
│              │  • PredictionMarket    │                  │
│              │  • FraudPattern        │                  │
│              │  • SARReport           │                  │
│              │  • AuditLog            │                  │
│              │  • BankReputation      │                  │
│              └────────────────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Why Canton?

| Requirement | Canton Solution |
|-------------|-----------------|
| Data privacy | Sub-transaction privacy — share specific fields only |
| Regulatory compliance | Immutable audit trail for regulators |
| Multi-party coordination | Native support for multi-party workflows |
| Enterprise-grade | Built for financial institutions |

**No other blockchain offers this combination.** Public blockchains expose all data. Private blockchains lack interoperability. Canton provides selective disclosure with cryptographic guarantees.

### Integration Models

Banks can connect to the network in two ways, depending on their size and technical capacity:

**Model 1: Direct Node (Enterprise)**

For large institutions that require full control over their data and identity.

```
Bank's Own Canton Node
        │
        │  Daml Ledger API (direct)
        ▼
   Canton Network
```

- Bank runs its own Canton participant node
- Daml `party` identity lives on the bank's own infrastructure
- Full sovereignty over keys and data
- Best for: Tier 1 banks, institutions with dedicated compliance teams

**Model 2: Hosted Access (API)**

For smaller banks and fintechs that want fast onboarding without infrastructure overhead.

```
Bank / Fintech
        │
        │  REST API (standard HTTP)
        ▼
AML Prediction Network Backend
        │
        │  Daml Ledger API
        ▼
   Canton Network (party hosted on our node)
```

- No Canton node required — connect via standard REST API
- We create and host a Daml `party` on behalf of the institution
- Bank authenticates via API keys, all Canton complexity is abstracted away
- 2-4 week integration, zero blockchain knowledge needed
- Best for: Regional banks, fintechs, pilot participants

**Migration Path:** Institutions can start with Model 2 (API) and migrate to Model 1 (Direct Node) as their usage grows — no contract changes required, only the infrastructure layer changes.

---

## Regulatory Compliance

### BSA Section 314(b) Ready

Section 314(b) of the USA PATRIOT Act **already allows** voluntary information sharing between financial institutions for AML purposes, with safe harbor protection from liability.

**Current Problem:** Banks don't use 314(b) effectively because:
- Manual, slow process
- No standardized format
- Privacy concerns about over-sharing

**Our Solution:** Automated, privacy-preserving 314(b) compliance:
- Share patterns, not customer data
- Instant network-wide alerts
- Cryptographic proof of what was shared

### Automatic SAR Filing

When risk score exceeds threshold (≥80%), the system:
1. Auto-generates SAR report
2. Includes full audit trail
3. Notifies regulator node
4. Documents decision rationale

**Regulator Benefits:**
- Real-time visibility into network activity
- Higher quality SARs (fewer false positives)
- Complete audit trail for examinations

---

## ROI Comparison

### Current State: Chainalysis

| Metric | Value |
|--------|-------|
| Annual cost | $200,000 - $500,000 |
| Coverage | Primarily blockchain analytics |
| False positive rate | Industry standard (~95%) |
| Cross-bank intelligence | None |
| Traditional banking | Not covered |

### With AML Prediction Network

| Metric | Value |
|--------|-------|
| Annual cost | $75,000 - $150,000 |
| Coverage | Blockchain + Traditional banking |
| False positive reduction | 30-50% (network intelligence) |
| Cross-bank intelligence | Real-time |
| Compliance automation | SAR auto-filing |

### Example: Mid-Size Bank ($50B AUM)

**Current AML Costs:**
- Software: $300,000/year
- Compliance staff (10 FTE): $1,200,000/year
- False positive investigation: 8,000 hours/year
- **Total: $1,500,000/year**

**With AML Prediction Network:**
- Software: $100,000/year
- Compliance staff (7 FTE): $840,000/year
- False positive investigation: 4,000 hours/year (50% reduction)
- **Total: $940,000/year**

**Annual Savings: $560,000 (37%)**

---

## Competitive Differentiation

| Capability | Chainalysis | Elliptic | Consilient (FL) | AML Prediction Network |
|------------|-------------|----------|-----------------|------------------------|
| Blockchain coverage | ✅ | ✅ | ❌ | ✅ |
| Traditional banking | ⚠️ (expanding) | ❌ | ✅ | ✅ |
| Cross-bank collaboration | ❌ | ❌ | ✅ | ✅ |
| Incentive alignment | ❌ | ❌ | ❌ | ✅ |
| Explainable decisions | ✅ | ✅ | ⚠️ (limited) | ✅ |
| Immutable audit trail | ❌ | ❌ | ❌ | ✅ |
| Real-time prediction | ❌ | ❌ | ✅ | ✅ |

*Note: Chainalysis acquired Alterya (Jan 2025) for payment fraud detection, expanding beyond pure blockchain analytics.*

**Our Unique Value:** We're the only solution that combines cross-bank collaboration with incentive alignment and regulatory-grade explainability.

---

## Vision: Federated Learning Integration

### The Next Leap — From Human Intelligence to Hybrid Intelligence

Prediction markets capture collective human judgment. But what if each bank's vote was backed by a machine learning model trained on the entire network's fraud patterns — without ever sharing raw data?

**Federated Learning (FL)** makes this possible. Each bank trains a local ML model on its own data, then shares only encrypted model updates (not data) via Canton Network. These updates are aggregated into a global model that every bank benefits from.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Bank A     │  │   Bank B     │  │   Bank C     │
│ Local ML     │  │ Local ML     │  │ Local ML     │
│ Training     │  │ Training     │  │ Training     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │ encrypted        │                 │
       │ model updates    │                 │
       ▼                  ▼                 ▼
┌─────────────────────────────────────────────────┐
│            Canton Network                       │
│  • FL round coordination (Daml contracts)       │
│  • Encrypted update routing (blind sync domains)│
│  • Aggregation verification & audit trail       │
└──────────────────────┬──────────────────────────┘
                       ▼
              Aggregated Global Model
                       │
                       ▼
              Prediction Market
              (enhanced bank votes)
```

### Why Canton is Uniquely Suited for FL

| FL Requirement | Canton Capability |
|----------------|-------------------|
| Data stays local | Participant nodes = sovereign data stores |
| Encrypted model sharing | End-to-end encrypted messaging, blind sync domains |
| Coordination rules | Daml contracts enforce FL round logic |
| Audit trail | Immutable record of every FL round |
| Regulator visibility | Observer nodes monitor FL governance |

### Closed-Loop Intelligence

Market outcomes (confirmed fraud or legitimate) feed back into FL model training, creating a self-improving cycle:

**FL Model → Better Predictions → Market Resolution → Better Training Data → Better FL Model**

### Real-World Validation

This approach is already proven in production:
- **Singapore MAS/COSMIC**: 60-70% false positive reduction across participating banks
- **Hong Kong HKMA**: Airstar Bank & livi bank running FL-based AML pilots
- **Banking Circle (EU)**: Improved cross-border payment fraud detection with FL
- **Australia**: Regional banks using collective FL intelligence to match Tier 1 capabilities

> FL has demonstrated 60-80% false positive reduction and up to 300% detection improvement in production environments.

### Our Unique Position

No existing solution combines all three:

| | Prediction Markets | Federated Learning | Blockchain Privacy |
|---|:---:|:---:|:---:|
| **Consilient** | ❌ | ✅ | ❌ |
| **Polymarket** | ✅ | ❌ | ❌ |
| **Chainalysis** | ❌ | ❌ | ❌ |
| **AML Prediction Network** | ✅ | ✅ | ✅ |

---

## Current Status

- ✅ Working prototype on Canton sandbox
- ✅ SAR auto-filing implemented
- ✅ Regulator view with audit logs
- ✅ Canton Catalyst 2026 Winner — Currently in Mentorship Program
- ⏳ DevNet deployment (in progress)
- 🎯 Seeking design partners for pilot

---

## Next Steps

**For Banks:**
- Free pilot program for early adopters
- 2-4 week integration via REST API
- No disruption to existing systems

**For Fintechs:**
- API sandbox access for testing
- Pay-per-query pricing during pilot

**For Regulators:**
- Free observer node with real-time network visibility
- Compliance report generation pilot

### Roadmap

| Phase | Timeline | Milestone |
|-------|----------|-----------|
| ✅ MVP | Q1 2026 | Working prototype, Canton Catalyst Winner |
| 🔄 Pilot | Q2 2026 | 3-5 design partner banks on DevNet |
| 🎯 Beta | Q3 2026 | Production deployment, regulator onboarding |
| 🚀 Launch | Q4 2026 | Public network, API marketplace |
| 🧠 FL Integration | 2027 | Federated Learning layer, hybrid intelligence |

**Contact:**
- Website: [amlprediction.com](https://amlprediction.com)
- Live Demo: [amlprediction.network](https://amlprediction.network)
- Email: levent@amlprediction.com

---

## References

¹ LexisNexis Risk Solutions, "True Cost of Financial Crime Compliance Study — Global Report," September 2023. Covers total financial crime compliance costs including AML, KYC, sanctions, and fraud.

² PwC, Datos Insights, Trapets — multiple industry studies consistently report AML false positive rates between 90-98%.

³ UNODC (United Nations Office on Drugs and Crime) estimate. Some recent studies (Napier AI, 2025) suggest figures as high as $5.5 trillion.

---

*AML Prediction Network — Because fraudsters collaborate. Banks should too.*
