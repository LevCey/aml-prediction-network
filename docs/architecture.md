# AML Prediction Network — Architecture

**From Shared Ledgers to Shared Judgment**

---

## Overview

AML Prediction Network is a privacy-preserving coordination layer built on Canton Network using Daml smart contracts. It enables financial institutions to aggregate probabilistic risk beliefs without exposing underlying data.

The system does not centralize detection. It coordinates judgment.

---

## Core Components

### Smart Contracts (Daml)

#### TransactionPattern.daml

Stores anonymized behavioral patterns and suspicious transaction templates.

- **FraudPattern** — Behavioral signature (e.g., "structuring", "new_account", "crypto_exchange"). Uses pattern hashing. No customer PII on-chain.
- **SuspiciousTransaction** — Anonymized transaction submission linked to a pattern. Triggers belief aggregation workflow.

#### PredictionMarket.daml

Manages the belief submission and aggregation workflow.

- **PredictionMarket** — Multi-party contract where institutions submit confidence estimates. Aggregates into weighted risk score. Time-bound with configurable deadline.
- **RiskScore** — Final aggregated output. Includes contributor list, recommended action, and immutable audit trail.
- **SARReport** — Auto-generated when aggregated risk exceeds threshold (≥80%). Immutable filing record with status tracking.
- **AuditLog** — Tracks all network actions. Regulator has full read visibility.

#### BankReputation.daml

Tracks prediction accuracy and adjusts participant influence.

- **BankReputation** — Correct vs. total predictions, accuracy percentage, reputation score (0–100). Updated by verifier, not by the participant itself.

**Key design constraint:** Banks cannot update their own reputation. Only resolution outcomes adjust weights. This prevents gaming.

---

## Coordination Workflow

```
1. SIGNAL CREATION
   Bank A detects suspicious activity
   └─> Submits anonymized pattern to network
       (behavioral signature only — no customer data)

2. BELIEF SUBMISSION
   Network participants evaluate the hypothesis
   └─> Each submits a confidence estimate (pᵢ)
       weighted by reputation (wᵢ)

3. AGGREGATION
   Canton aggregates beliefs into shared risk score
   └─> B = Σ(wᵢ · pᵢ) / Σ(wᵢ)
       All participants receive the same output

4. ACTION
   Risk score triggers configurable response
   └─> ≥ 80%: SAR auto-filed, regulator notified
       60–80%: Enhanced due diligence
       < 60%: No network action

5. RESOLUTION
   Real-world outcome confirms or rejects hypothesis
   └─> Reputation weights updated accordingly
       Accurate contributors gain influence
       Inaccurate contributors lose influence

6. NETWORK LEARNS
   Updated weights improve future aggregation quality
   └─> System becomes self-correcting over time
```

---

## Privacy Architecture

### What Cannot Be Learned

| Data | Protection |
|------|-----------|
| Customer names, accounts | Never on-chain |
| Transaction details | Anonymized into behavioral categories |
| Internal models | Remain local to each institution |
| Individual bank reasoning | Canton selective disclosure |
| Counterparty relationships | Never leaves the institution |

### What Can Be Learned

| Data | Visible To |
|------|-----------|
| Aggregated risk score | Contributing participants + regulator |
| Confidence evolution over time | Contributing participants + regulator |
| Participant reliability metrics | Regulator only |
| Network-level statistics | Regulator only |

### Canton Privacy Enforcement

- **Selective disclosure** — Each party sees only contracts they are authorized for
- **Observer pattern** — Regulator observes all; banks see only relevant signals
- **Pattern hashing** — SHA256 of behavioral characteristics; not reversible
- **No global state exposure** — Unlike public blockchains, Canton does not broadcast state

Participation never increases regulatory exposure.

---

## Deployment Architecture

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Bank A     │   │  Bank B     │   │  Bank C     │
│  Node       │   │  Node       │   │  Node       │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       │    belief       │    belief       │    belief
       │    commitments  │    commitments  │    commitments
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────▼──────┐
                  │   Canton    │
                  │   Network   │
                  │   (Sync)    │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │  Regulator  │
                  │  Observer   │
                  │  (read-only)│
                  └─────────────┘
```

### Current Deployment

- **Smart Contracts:** Canton DevNet
- **Frontend:** Vercel ([amlprediction.network](https://amlprediction.network))
- **Demo:** Interactive simulation environment

---

## Entity Relationships

```
FraudPattern
    │
    └──> SuspiciousTransaction
              │
              └──> PredictionMarket
                        │
                        ├──> RiskScore
                        │       │
                        │       ├──> SARReport (if score ≥ 80%)
                        │       │
                        │       └──> AuditLog
                        │
                        └──> BankReputation (updated on resolution)
```

---

## Adversarial Considerations

| Threat | Mitigation |
|--------|-----------|
| Participant submits false signals | Reputation weighting — inaccurate contributors lose influence over time |
| Sybil attack (multiple fake identities) | Canton institutional permissioning — only verified entities participate |
| Collusion between participants | Resolution-based verification reveals systematic inaccuracy |
| Inference attack on other participants | Canton selective disclosure — individual beliefs are not visible to other participants |
| Spam signals | Reputation cost — low-quality submissions degrade contributor weight |

---

## Security Properties

- **Immutable audit trail** — Every action (signal submission, aggregation, resolution) is recorded
- **Verifier-controlled reputation** — Participants cannot update their own scores
- **Regulator read access** — Full visibility without execution authority
- **No central operator** — Canton enforces workflow logic; no single party controls outcomes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Daml 2.x (Canton Network SDK) |
| Backend | Node.js, Python (Canton integration) |
| Frontend | React + TypeScript, Recharts |
| Privacy | Canton selective disclosure, differential privacy |
| Deployment | Vercel (frontend), Canton DevNet (contracts) |
