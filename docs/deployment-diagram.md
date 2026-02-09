# AML Prediction Network - Deployment Diagram

## Current Architecture (Tenzro DevNet)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CANTON DEVNET (Tenzro)                        │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Bank of     │ │ Wells       │ │ Citibank    │ │ JPMorgan    │   │
│  │ America     │ │ Fargo       │ │             │ │ Chase       │   │
│  │ (Party)     │ │ (Party)     │ │ (Party)     │ │ (Party)     │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
│         │               │               │               │           │
│         └───────────────┼───────────────┼───────────────┘           │
│                         │               │                           │
│                  ┌──────▼───────────────▼──────┐                    │
│                  │    Daml Smart Contracts      │                    │
│                  │  ┌────────────────────────┐  │                    │
│                  │  │ FraudPattern           │  │                    │
│                  │  │ PredictionMarket       │  │                    │
│                  │  │ RiskScore              │  │                    │
│                  │  │ SARReport              │  │                    │
│                  │  │ BankReputation         │  │                    │
│                  │  └────────────────────────┘  │                    │
│                  └──────────────┬───────────────┘                    │
│                                │                                    │
│                  ┌─────────────▼─────────────┐                      │
│                  │   FinCEN (Observer Node)   │                      │
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

## Data Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Bank A   │    │ Canton   │    │ Bank B   │    │ FinCEN   │
│ (Local)  │    │ Ledger   │    │ (Local)  │    │(Observer)│
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 1. Detect     │               │               │
     │    fraud      │               │               │
     │               │               │               │
     │ 2. Create     │               │               │
     ├──────────────►│ FraudPattern  │               │
     │  patternHash  │ (no PII)     │               │
     │               │               │               │
     │               │ 3. Selective  │               │
     │               │    disclosure │               │
     │               ├──────────────►│               │
     │               ├──────────────────────────────►│
     │               │               │               │
     │               │  4. Fraudster │               │
     │               │     arrives   │               │
     │               │               │               │
     │               │  5. Hash      │               │
     │               │◄──────────────┤               │
     │               │   match!      │               │
     │               │               │               │
     │ 6. Vote       │ PredictionMkt │  6. Vote      │
     ├──────────────►│◄──────────────┤               │
     │  85% / $200   │               │  75% / $150   │
     │               │               │               │
     │               │ 7. Risk Score │               │
     │               │    = 78.3%    │               │
     │               │               │               │
     │               │ 8. Auto-SAR   │               │
     │               ├──────────────────────────────►│
     │               │  (if ≥ 80%)   │               │
     │               │               │               │
```

## Production Target Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Canton Network (Production)                │
│                                                              │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │ Bank A Node       │          │ Bank B Node       │         │
│  │ ┌──────────────┐ │          │ ┌──────────────┐ │         │
│  │ │ Canton       │ │          │ │ Canton       │ │         │
│  │ │ Participant  │ │          │ │ Participant  │ │         │
│  │ ├──────────────┤ │          │ ├──────────────┤ │         │
│  │ │ Local DB     │ │          │ │ Local DB     │ │         │
│  │ │ (Customer    │ │          │ │ (Customer    │ │         │
│  │ │  PII stays   │ │          │ │  PII stays   │ │         │
│  │ │  here)       │ │          │ │  here)       │ │         │
│  │ ├──────────────┤ │          │ ├──────────────┤ │         │
│  │ │ AML Engine   │ │          │ │ AML Engine   │ │         │
│  │ │ (Pattern     │ │          │ │ (Pattern     │ │         │
│  │ │  matching)   │ │          │ │  matching)   │ │         │
│  │ └──────────────┘ │          │ └──────────────┘ │         │
│  └────────┬─────────┘          └────────┬─────────┘         │
│           │                             │                    │
│           └──────────┬──────────────────┘                    │
│                      │                                       │
│            ┌─────────▼─────────┐                             │
│            │  Daml Contracts   │                             │
│            │  (Shared Ledger)  │                             │
│            └─────────┬─────────┘                             │
│                      │                                       │
│            ┌─────────▼─────────┐                             │
│            │ Regulator Node    │                             │
│            │ (FinCEN/Observer) │                             │
│            └───────────────────┘                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Privacy Boundary:
═══════════════════════════════════════════════════
  ON-CHAIN (shared)     │  OFF-CHAIN (local only)
  - Pattern hashes      │  - Customer names
  - Risk scores         │  - Account numbers
  - Vote records        │  - Transaction details
  - SAR filings         │  - Bank internal data
  - Audit logs          │  - Raw AML alerts
═══════════════════════════════════════════════════
```
