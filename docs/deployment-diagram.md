# AML Prediction Network — Deployment Diagram

**From Shared Ledgers to Shared Judgment**

---

## Current Deployment (Canton DevNet)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CANTON DEVNET (Tenzro)                        │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  Bank A     │ │  Bank B     │ │  Bank C     │ │  Bank D     │   │
│  │  (Party)    │ │  (Party)    │ │  (Party)    │ │  (Party)    │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
│         │               │               │               │           │
│         └───────────────┼───────────────┼───────────────┘           │
│                         │               │                           │
│                  ┌──────▼───────────────▼──────┐                    │
│                  │    Daml Smart Contracts      │                    │
│                  │  ┌────────────────────────┐  │                    │
│                  │  │ TransactionPattern     │  │                    │
│                  │  │ PredictionMarket       │  │                    │
│                  │  │ BankReputation         │  │                    │
│                  │  │ SARReport / AuditLog   │  │                    │
│                  │  └────────────────────────┘  │                    │
│                  └──────────────┬───────────────┘                    │
│                                │                                    │
│                  ┌─────────────▼─────────────┐                      │
│                  │   Regulator (Observer)     │                      │
│                  │   Read-only / Audit Trail  │                      │
│                  └───────────────────────────┘                      │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                          Tenzro API Gateway
                      api.platform.tenzro.com
                                   │
                    ┌──────────────▼──────────────┐
                    │   Vercel (Frontend + API)    │
                    │                              │
                    │  ┌────────┐  ┌────────────┐  │
                    │  │React UI│  │Serverless   │  │
                    │  │  SPA   │  │API Routes   │  │
                    │  │        │  │             │  │
                    │  │ /      │  │/api/health  │  │
                    │  │ /demo  │  │/api/demo    │  │
                    │  │        │  │/api/parties │  │
                    │  │        │  │/api/contracts│ │
                    │  └────────┘  └────────────┘  │
                    │                              │
                    │  amlprediction.network        │
                    └──────────────────────────────┘
```

---

## Coordination Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Bank A   │    │ Canton   │    │ Bank B   │    │Regulator │
│          │    │ Ledger   │    │          │    │(Observer)│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 1. Detect     │               │               │
     │    suspicious │               │               │
     │    activity   │               │               │
     │               │               │               │
     │ 2. Submit     │               │               │
     ├──────────────►│ Pattern       │               │
     │  (anonymized) │ (no PII)     │               │
     │               │               │               │
     │               │ 3. Selective  │               │
     │               │    disclosure │               │
     │               ├──────────────►│               │
     │               ├──────────────────────────────►│
     │               │               │               │
     │               │  4. Same entity               │
     │               │     appears   │               │
     │               │               │               │
     │               │  5. Pattern   │               │
     │               │◄──────────────┤               │
     │               │   match       │               │
     │               │               │               │
     │ 6. Belief     │               │  6. Belief    │
     ├──────────────►│               │◄──────────────┤
     │  pᵢ = 0.85   │               │  pᵢ = 0.75   │
     │               │               │               │
     │               │ 7. Aggregated │               │
     │               │    Risk Score │               │
     │               │    B = 0.80   │               │
     │               │               │               │
     │               │ 8. SAR filed  │               │
     │               ├──────────────────────────────►│
     │               │  (threshold   │               │
     │               │   exceeded)   │               │
     │               │               │               │
```

---

## Privacy Boundary

```
═══════════════════════════════════════════════════
  ON CANTON (shared)        │  LOCAL ONLY (private)
  ─────────────────────────-│──────────────────────
  Anonymized patterns       │  Customer names
  Belief commitments        │  Account numbers
  Aggregated risk scores    │  Transaction details
  SAR filings               │  Internal models
  Audit trail               │  Raw AML alerts
  Reputation metrics        │  Counterparty data
═══════════════════════════════════════════════════
```
