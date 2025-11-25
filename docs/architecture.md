# AML Prediction Network - Technical Architecture

## System Overview

The AML Prediction Network is a privacy-preserving fraud detection system built on Canton Network using Daml smart contracts. It enables financial institutions to collaborate on fraud detection while maintaining customer privacy and regulatory compliance.

---

## Core Components

### 1. Smart Contracts (Daml)

#### **TransactionPattern.daml**

**Purpose**: Share fraud patterns anonymously without revealing customer PII.

**Templates**:

- **FraudPattern**
  - Stores behavioral patterns (e.g., "structuring", "new_account", "crypto_exchange")
  - Uses pattern hashing (SHA256) to avoid storing raw data
  - Signatories: Submitting bank
  - Observers: Other banks + regulator

  ```daml
  template FraudPattern
    with
      patternId: Text
      submitter: Party
      patternHash: Text
      characteristics: [Text]
      timestamp: Time
      observers: [Party]
      verified: Bool
  ```

- **SuspiciousTransaction**
  - Anonymized transaction submission
  - Links to FraudPattern via hash
  - Triggers prediction market creation

  ```daml
  template SuspiciousTransaction
    with
      transactionId: Text
      reportingBank: Party
      patternHash: Text
      amount: Decimal
      riskFactors: [Text]
  ```

**Key Features**:
- NO customer names, account numbers, or identifying information
- Pattern verification by multiple banks
- Automatic archival after time period

---

#### **PredictionMarket.daml**

**Purpose**: Aggregate fraud predictions from multiple banks using weighted voting.

**Templates**:

- **PredictionMarket**
  - Multi-bank voting on fraud likelihood
  - Weighted risk score calculation
  - Time-bound (deadline-based)

  ```daml
  template PredictionMarket
    with
      marketId: Text
      transactionId: Text
      participants: [Party]
      deadline: Time
      votes: Map Party BankVote
      regulator: Party
      isOpen: Bool
  ```

- **BankVote** (Data type)
  ```daml
  data BankVote = BankVote
    with
      confidence: Decimal  -- 0.0 to 1.0
      stake: Decimal       -- Amount staked
      timestamp: Time
  ```

- **RiskScore**
  - Final calculated risk score
  - Recommended action (BLOCK / REVIEW / APPROVE)
  - Immutable audit trail

  ```daml
  template RiskScore
    with
      transactionId: Text
      score: Decimal
      contributors: [Party]
      regulator: Party
      actionTaken: Optional Text
  ```

- **OutcomeVerification**
  - Records actual fraud outcome
  - Used to update bank reputations
  - Links predicted score to reality

**Key Features**:
- Weighted average calculation: `(Σ confidence × stake) / Σ stake`
- Deadline enforcement
- Regulator observation (read-only)
- Non-consuming outcome verification

**Example**:
```
Bank A: 85% fraud, $200 stake
Bank B: 75% fraud, $150 stake
Bank C: 70% fraud, $100 stake

Risk Score = (0.85×200 + 0.75×150 + 0.70×100) / 450
           = 352.5 / 450
           = 0.783 (78.3%)

Action: REVIEW (>60% threshold)
```

---

#### **BankReputation.daml**

**Purpose**: Track bank prediction accuracy and adjust voting power.

**Templates**:

- **BankReputation**
  - Tracks correct vs. total predictions
  - Calculates accuracy percentage
  - Reputation score (0-100)

  ```daml
  template BankReputation
    with
      bank: Party
      totalPredictions: Int
      correctPredictions: Int
      accuracy: Decimal
      reputationScore: Decimal  -- 0-100
  ```

- **VotingPower**
  - Adjusts stake effectiveness based on reputation
  - Multiplier: 0.5x (poor) to 2.0x (elite)

  ```daml
  template VotingPower
    with
      bank: Party
      baseStake: Decimal
      reputationMultiplier: Decimal
      effectiveVotingPower: Decimal
  ```

  **Reputation Tiers**:
  - Elite (90-100): 2.0x multiplier
  - Excellent (75-89): 1.5x multiplier
  - Good (50-74): 1.0x multiplier
  - Fair (25-49): 0.75x multiplier
  - Poor (0-24): 0.5x multiplier

- **NetworkStatistics**
  - Regulator-only view
  - Tracks overall fraud detection rate
  - False positive monitoring

**Key Features**:
- Automatic reputation updates
- Long-term incentive alignment
- Prevents gaming (bad actors lose influence)
- Rewards consistent accuracy

---

## System Workflow

### End-to-End Flow: Fraudster Detection

```
1. PATTERN DETECTION
   Bank A detects fraudster John
   └─> Create FraudPattern (anonymized)
       - Hash: 0x7a8f...
       - Characteristics: ["structuring", "new_account"]

2. PATTERN SHARING
   Pattern broadcast to network
   └─> Bank B, C, Regulator observe
       - NO customer data shared
       - Only behavioral signature

3. FRAUDSTER MOVES
   John tries Bank B (30 mins later)
   └─> Bank B's system flags transaction
       - Pattern hash match: 95% similarity

4. PREDICTION MARKET CREATED
   Bank B submits SuspiciousTransaction
   └─> CreatePredictionMarket choice executed
       - Participants: Bank A, B, C
       - Deadline: 24 hours

5. BANKS VOTE
   Bank A: 85% fraud ($200) - "I just dealt with this!"
   Bank B: 75% fraud ($150) - "Looks suspicious"
   Bank C: 70% fraud ($100) - "Borderline case"

6. RISK SCORE CALCULATED
   Weighted average: 78.3%
   └─> Action: REVIEW (60-80% range)
       - Enhanced due diligence triggered
       - Compliance team investigates

7. INVESTIGATION CONFIRMS FRAUD
   Bank B blocks transaction
   └─> VerifyOutcome: actualFraud = True
       - Bank A reputation +1 (correct)
       - Bank B reputation +1 (correct)
       - Bank C reputation +1 (correct)

8. NETWORK LEARNS
   Pattern confidence increased to 95%
   └─> Next fraudster attempt: instant detection
```

---

## Privacy Architecture

### What IS Shared

| Data Type | Example | Visible To |
|-----------|---------|------------|
| Pattern hash | 0x7a8f9b2c... | All banks + regulator |
| Characteristics | ["structuring", "new_account"] | All banks + regulator |
| Risk scores | 78.3% fraud probability | Contributing banks + regulator |
| Aggregated statistics | 1,247 transactions analyzed | Regulator only |

### What is NOT Shared

| Data Type | Example | Protection Method |
|-----------|---------|-------------------|
| Customer names | "John Doe" | Never on-chain |
| Account numbers | "ACC-12345" | Never on-chain |
| Transaction details | $9,500 to Crypto Exchange XYZ | Anonymized amounts + categories |
| Bank-specific data | "Chase Bank flagged this" | Canton selective disclosure |

### Canton Network Privacy Features

1. **Selective Disclosure**
   - Each party only sees contracts they're authorized for
   - Bank A's submission ≠ visible to Bank C (unless observer)

2. **Observer Pattern**
   - Regulators see everything (compliance)
   - Banks see only relevant patterns

3. **Pattern Hashing**
   - SHA256 hash of characteristics
   - Collision-resistant
   - No reverse engineering

4. **Differential Privacy**
   - Aggregated statistics only
   - Individual transactions masked

---

## Regulatory Compliance

### BSA (Bank Secrecy Act)

**Requirement**: Cannot share customer data
**Solution**: Share behavioral patterns, not PII

### Section 314(b)

**Requirement**: Information sharing with FinCEN approval
**Solution**: Pre-approved framework with regulator observer nodes

### GDPR

**Requirement**: Right to be forgotten
**Solution**: Personal data stays local at banks, only hashes on-chain

### KYC/AML

**Requirement**: Know Your Customer checks
**Solution**: Pattern-based detection without customer identification

### SAR (Suspicious Activity Report)

**Requirement**: File SARs with FinCEN
**Solution**: Auto-filing at risk score thresholds

---

## Data Model

### Entity Relationship

```
FraudPattern ──┐
               │
               ├──> SuspiciousTransaction
               │         │
               │         └──> PredictionMarket
               │                    │
               │                    ├──> BankVote (many)
               │                    │
               │                    └──> RiskScore
               │                              │
               │                              └──> OutcomeVerification
               │
               └──> BankReputation
                         │
                         └──> VotingPower
```

### State Transitions

```
PredictionMarket States:
  OPEN → voting allowed
  CLOSED → calculate risk score
  VERIFIED → outcome confirmed

RiskScore Actions:
  score >= 0.8 → BLOCK
  score >= 0.6 → REVIEW
  score < 0.6 → APPROVE
```

---

## Performance Characteristics

### Throughput

- **Pattern Submission**: < 1 second
- **Vote Submission**: < 500ms
- **Risk Calculation**: < 100ms (for 10 banks)
- **Market Creation**: < 2 seconds

### Scalability

- **Banks**: 100+ participants supported
- **Concurrent Markets**: 1000+ active markets
- **Historical Patterns**: Unlimited (with archival)

### Latency

- **Real-time Detection**: Pattern match in < 1 second
- **Market Resolution**: 24 hours (configurable)
- **Reputation Update**: Immediate after verification

---

## Security Considerations

### Threat Model

1. **Malicious Bank (Sybil Attack)**
   - Mitigation: Reputation system
   - Low reputation = low voting power

2. **Collusion**
   - Mitigation: Long-term reputation tracking
   - Outcome verification reveals collusion

3. **Pattern Inference Attack**
   - Mitigation: Pattern hashing + differential privacy
   - Cannot reverse-engineer customer data

4. **DoS (Spam Patterns)**
   - Mitigation: Staking requirements
   - Bad patterns penalize reputation

### Audit Trail

Every action is immutable:
- Pattern submission timestamp
- Vote timestamps
- Risk score calculations
- Outcome verifications

Regulators have full read access for investigations.

---

## Deployment Architecture

### Development

```
┌─────────────────────────────────┐
│   Daml Sandbox (local)          │
│   - In-memory ledger            │
│   - Fast testing                │
│   - No persistence              │
└─────────────────────────────────┘
```

### Production (Canton Network)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Bank A     │   │  Bank B     │   │  Bank C     │
│  Node       │   │  Node       │   │  Node       │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                  ┌──────▼──────┐
                  │  Canton     │
                  │  Network    │
                  │  (Sync)     │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │  Regulator  │
                  │  Observer   │
                  │  Node       │
                  └─────────────┘
```

### Node Components

Each bank runs:
1. **Canton Participant Node**
   - Stores contracts
   - Executes choices
   - Manages privacy

2. **Local Database**
   - Customer data (never leaves)
   - Pattern metadata
   - Cache

3. **API Layer**
   - REST API for frontend
   - Daml Ledger API
   - Authentication

---

## Integration Points

### Frontend (React)

```typescript
import { Ledger } from '@daml/ledger';
import { PredictionMarket } from './daml-types';

// Submit vote
await ledger.exercise(
  PredictionMarket.SubmitVote,
  contractId,
  {
    voter: 'Bank_A',
    confidence: '0.85',
    stake: '200'
  }
);
```

### Bank Systems

```
Existing AML System → API Gateway → Canton Node → Network

Detection alert → Submit pattern → Broadcast to network
```

### Regulator Dashboard

```
Canton Observer Node → Read-only queries → Dashboard

Real-time statistics:
- Active markets
- Fraud detection rate
- False positive rate
- Network health
```

---

## Testing Strategy

### Unit Tests (Daml Script)

Each contract has test scenarios:
- `test_fraud_pattern`: Pattern submission + verification
- `test_prediction_market`: Full voting workflow
- `test_bank_reputation`: Reputation updates

### Integration Tests

Multi-contract workflows:
- Pattern → Transaction → Market → Score → Verification

### End-to-End Tests

Full system simulation:
- 3 banks + regulator
- Multiple fraud patterns
- Concurrent markets
- Reputation evolution

---

## Future Enhancements

### Phase 2 (Post-Hackathon)

1. **Zero-Knowledge Proofs**
   - Prove pattern match without revealing pattern
   - zk-SNARKs for customer data

2. **Machine Learning Integration**
   - On-chain ML model updates
   - Federated learning

3. **Token Economics**
   - AML-NET token for staking
   - Governance via token voting

4. **Cross-Border Support**
   - Multi-jurisdiction compliance
   - Currency conversion

5. **Advanced Analytics**
   - Pattern clustering
   - Fraud network detection
   - Predictive modeling

---

## Glossary

- **Pattern Hash**: SHA256 hash of fraud characteristics
- **Stake**: Amount committed to a prediction
- **Confidence**: Fraud probability (0.0-1.0)
- **Risk Score**: Weighted average of all votes
- **Reputation**: Bank's historical accuracy (0-100)
- **Multiplier**: Voting power adjustment (0.5x-2.0x)
- **Observer**: Party with read-only access
- **Signatory**: Party who must approve contract creation
- **Choice**: Action that can be executed on a contract
- **DAR**: Daml Archive (compiled contracts)

---

## References

- [Canton Network Documentation](https://docs.canton.network/)
- [Daml Smart Contracts](https://docs.daml.com/)
- [FinCEN Section 314(b)](https://www.fincen.gov/resources/statutes-and-regulations/314b-fact-sheet)
- [Bank Secrecy Act](https://www.fincen.gov/resources/statutes-regulations/guidance)

---

**Last Updated**: November 25, 2025
**Version**: 1.0
**Authors**: LeventLabs
