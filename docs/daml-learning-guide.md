# Daml Learning Guide for AML Prediction Network

## Quick Start: Essential Concepts

### 1. Daml Basics

**What is Daml?**
- Smart contract language for multi-party workflows
- Functional programming (like Haskell)
- Type-safe and compile-time verified
- Built for privacy and compliance

**Key Features for Our Project:**
- **Signatories**: Parties who must approve contract creation
- **Observers**: Parties who can see the contract but don't control it
- **Choices**: Actions that can be executed on a contract
- **Privacy**: Each party only sees contracts they're authorized to see

---

### 2. Core Daml Concepts

#### Templates (Smart Contracts)

```daml
template Prediction
  with
    bank: Party              -- Who created this prediction
    transactionId: Text      -- Which transaction
    confidence: Decimal      -- Fraud probability (0.0 to 1.0)
    stake: Decimal           -- Amount staked
  where
    signatory bank          -- Bank must sign to create
    observer regulator      -- Regulator can see it
```

#### Choices (Actions)

```daml
choice SubmitVote : ContractId Prediction
  with
    voter: Party
    fraudProbability: Decimal
  controller voter
  do
    -- Logic here
    create this with confidence = fraudProbability
```

---

### 3. AML Network Contract Architecture

#### Contract 1: Transaction Pattern

```daml
template TransactionPattern
  with
    submitter: Party
    patternHash: Text
    characteristics: [Text]
    timestamp: Time
    observers: [Party]
  where
    signatory submitter
    observer observers

    -- NO customer PII stored here
    -- Only behavioral patterns
```

**Purpose**: Share fraud patterns without revealing customer data

#### Contract 2: Prediction Market

```daml
template PredictionMarket
  with
    transactionId: Text
    creator: Party
    participants: [Party]
    deadline: Time
    votes: Map Party (Decimal, Decimal)  -- (confidence, stake)
    regulator: Party
  where
    signatory creator
    observer participants ++ [regulator]

    choice Vote : ContractId PredictionMarket
      with
        voter: Party
        confidence: Decimal
        stake: Decimal
      controller voter
      do
        -- Add vote to map
        let newVotes = DA.Map.insert voter (confidence, stake) votes
        create this with votes = newVotes

    choice CalculateRiskScore : (Decimal, ContractId RiskScore)
      controller creator
      do
        -- Weighted average calculation
        let totalStake = sum [s | (_, s) <- DA.Map.values votes]
        let weightedSum = sum [c * s | (c, s) <- DA.Map.values votes]
        let riskScore = weightedSum / totalStake

        -- Create risk score contract
        scoreId <- create RiskScore with
          transactionId
          score = riskScore
          timestamp = ...

        return (riskScore, scoreId)
```

**Purpose**: Aggregate predictions from multiple banks

#### Contract 3: Risk Score

```daml
template RiskScore
  with
    transactionId: Text
    score: Decimal
    timestamp: Time
    contributors: [Party]
    regulator: Party
  where
    signatory contributors
    observer regulator

    choice TriggerAction : Text
      controller contributors
      do
        if score > 0.8
          then return "BLOCK"
        else if score > 0.6
          then return "REVIEW"
        else return "APPROVE"
```

**Purpose**: Store final risk score with audit trail

---

### 4. Multi-Party Workflow Example

**Scenario**: Bank A detects fraud, Bank B needs to be warned

```daml
-- Step 1: Bank A submits pattern
do
  patternId <- submit bankA do
    createCmd TransactionPattern with
      submitter = bankA
      patternHash = "0x7a8f..."
      characteristics = ["structuring", "new_account"]
      observers = [bankB, bankC, regulator]

-- Step 2: Create prediction market
  marketId <- submit bankA do
    createCmd PredictionMarket with
      transactionId = "TX123"
      creator = bankA
      participants = [bankA, bankB, bankC]
      votes = DA.Map.empty

-- Step 3: Banks vote
  marketId2 <- submit bankA do
    exerciseCmd marketId Vote with
      voter = bankA
      confidence = 0.85
      stake = 200.0

  marketId3 <- submit bankB do
    exerciseCmd marketId2 Vote with
      voter = bankB
      confidence = 0.75
      stake = 150.0

-- Step 4: Calculate risk score
  (score, scoreId) <- submit bankA do
    exerciseCmd marketId3 CalculateRiskScore

-- Step 5: Trigger action
  action <- submit bankA do
    exerciseCmd scoreId TriggerAction

  -- action = "REVIEW" (because score is 0.79)
```

---

### 5. Privacy Implementation

**What Each Party Sees:**

| Contract | Bank A | Bank B | Bank C | Regulator |
|----------|--------|--------|--------|-----------|
| Pattern (submitted by A) | Full | Hash only | Hash only | Full (observer) |
| Prediction Market | Full | Own vote + aggregated | Own vote + aggregated | Full (observer) |
| Risk Score | Yes | Yes | Yes | Yes (observer) |

**How Canton Ensures Privacy:**
- Selective disclosure: Each party only sees contracts they're authorized for
- Pattern hashing: Raw customer data never on chain
- Observer model: Regulators see everything, banks see only relevant data

---

### 6. Testing in Daml

**Test Script Example:**

```daml
test_prediction_market = script do
  -- Setup parties
  bankA <- allocateParty "Bank A"
  bankB <- allocateParty "Bank B"
  regulator <- allocateParty "FinCEN"

  -- Create prediction market
  marketId <- submit bankA do
    createCmd PredictionMarket with
      transactionId = "TEST_TX"
      creator = bankA
      participants = [bankA, bankB]
      deadline = ...
      votes = DA.Map.empty
      regulator

  -- Bank A votes
  marketId2 <- submit bankA do
    exerciseCmd marketId Vote with
      voter = bankA
      confidence = 0.85
      stake = 200.0

  -- Bank B votes
  marketId3 <- submit bankB do
    exerciseCmd marketId2 Vote with
      voter = bankB
      confidence = 0.70
      stake = 100.0

  -- Calculate score
  (score, _) <- submit bankA do
    exerciseCmd marketId3 CalculateRiskScore

  -- Assert score is correct
  assert (score >= 0.78 && score <= 0.82)
```

---

### 7. Deployment & Integration

**Development Flow:**

1. **Write Contracts** (`.daml` files)
```bash
cd daml/
daml build
```

2. **Run Sandbox** (local testing)
```bash
daml sandbox --port 6865
```

3. **Deploy to Canton Network**
```bash
canton deploy --participant bank-a aml-contracts.dar
```

4. **Frontend Integration** (React + TypeScript)
```typescript
import { Ledger } from '@daml/ledger';
import { PredictionMarket } from './daml-types';

const ledger = new Ledger({ token: userToken });

// Submit vote
await ledger.exercise(
  PredictionMarket.Vote,
  contractId,
  {
    voter: 'Bank_A',
    confidence: '0.85',
    stake: '200'
  }
);
```

---

### 8. Key Differences: Daml vs. Solidity

| Feature | Daml | Solidity (Ethereum) |
|---------|------|---------------------|
| Privacy | Built-in (selective disclosure) | None (all public) |
| Multi-party | Native support | Complex workarounds |
| Type Safety | Strong (compile-time) | Weak (runtime errors) |
| Compliance | Designed for regulated industries | DeFi focus |
| State Management | Immutable contracts | Mutable state |

**Why Daml for AML Network:**
- Banks can't share data publicly (Daml: private by default)
- Multi-bank coordination (Daml: multi-party workflows)
- Regulatory audit (Daml: observer pattern)
- Compliance-first (Daml: built for finance)

---

### 9. Learning Resources

**Official Docs:**
- [Daml Docs](https://docs.daml.com/)
- [Canton Network Docs](https://docs.canton.network/)
- [Daml Cheat Sheet](https://docs.daml.com/daml/reference/index.html)

**Tutorials:**
1. [Daml Quickstart](https://docs.daml.com/getting-started/quickstart.html)
2. [Canton Getting Started](https://docs.canton.network/quickstart/)
3. [Multi-Party Patterns](https://docs.daml.com/daml/patterns.html)

**Examples:**
- [Daml Finance](https://github.com/digital-asset/daml-finance)
- [Canton Examples](https://github.com/digital-asset/canton-examples)

---

### 10. Next Steps for AML Network

**Week 1 Goals:**
- [ ] Complete Daml quickstart tutorial (2 hours)
- [ ] Understand template/choice pattern (1 hour)
- [ ] Write first simple contract (1 hour)
- [ ] Test with Daml sandbox (1 hour)

**Week 2 Goals:**
- [ ] Implement TransactionPattern contract
- [ ] Implement PredictionMarket contract
- [ ] Implement RiskScore contract
- [ ] Write integration tests

**Week 3 Goals:**
- [ ] Deploy to Canton sandbox
- [ ] Build frontend integration
- [ ] End-to-end testing
- [ ] Demo scenario automation

---

### 11. Common Patterns for Our Project

#### Pattern 1: Anonymous Voting

```daml
-- Each bank votes without seeing others' votes
-- until deadline passes
choice VoteBlind : ContractId SealedVote
  with
    voter: Party
    sealedVote: Text  -- Hashed vote
  controller voter
  do
    create SealedVote with ...

-- After deadline, reveal votes
choice RevealVotes : ContractId PredictionMarket
  controller creator
  do
    -- Verify hashes and reveal
    ...
```

#### Pattern 2: Reputation Tracking

```daml
template BankReputation
  with
    bank: Party
    correctPredictions: Int
    totalPredictions: Int
    accuracy: Decimal
  where
    signatory bank
    observer [allBanks]

    choice UpdateReputation : ContractId BankReputation
      with
        wasCorrect: Bool
      controller bank
      do
        let newTotal = totalPredictions + 1
        let newCorrect = if wasCorrect
                         then correctPredictions + 1
                         else correctPredictions
        create this with
          correctPredictions = newCorrect
          totalPredictions = newTotal
          accuracy = intToDecimal newCorrect / intToDecimal newTotal
```

#### Pattern 3: Time-Based Actions

```daml
choice CloseMarket : (Decimal, ContractId RiskScore)
  controller creator
  do
    currentTime <- getTime
    assert (currentTime >= deadline)

    -- Calculate final score
    ...
```

---

### 12. Debugging Tips

**Common Errors:**

1. **"Party not authorized"**
   - Check signatory/observer lists
   - Ensure party submitting has rights

2. **"Contract not found"**
   - ContractId might be consumed (used in choice)
   - Use `nonconsuming choice` if needed

3. **"Type mismatch"**
   - Daml is strongly typed
   - Use explicit type conversions

**Debugging Commands:**

```bash
# Check contract state
daml ledger query --party "Bank_A"

# View transaction history
daml ledger transaction-tree <txId>

# Test specific scenario
daml test --scenario test_prediction_market
```

---

## Practice Exercise

**Build a Simple Prediction Contract:**

```daml
module SimplePrediction where

-- TODO: Implement a basic prediction market
-- Requirements:
-- 1. Two banks can vote Yes/No on fraud
-- 2. After both vote, calculate majority
-- 3. Regulator can observe all votes

template SimpleFraudPrediction
  with
    transactionId: Text
    bankA: Party
    bankB: Party
    regulator: Party
    voteA: Optional Bool
    voteB: Optional Bool
  where
    signatory [bankA, bankB]
    observer regulator

    choice VoteA : ContractId SimpleFraudPrediction
      with
        vote: Bool
      controller bankA
      do
        create this with voteA = Some vote

    choice VoteB : ContractId SimpleFraudPrediction
      with
        vote: Bool
      controller bankB
      do
        create this with voteB = Some vote

    choice CalculateResult : Text
      controller bankA
      do
        case (voteA, voteB) of
          (Some True, Some True) -> return "HIGH_RISK"
          (Some False, Some False) -> return "LOW_RISK"
          _ -> return "SPLIT_DECISION"
```

**Test this contract:**
1. Create it with two bank parties
2. Have each bank vote
3. Calculate the result
4. Verify regulator can see all data

---

Start with the Daml quickstart, then come back to implement the AML contracts!
