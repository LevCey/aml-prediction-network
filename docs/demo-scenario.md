# Demo Scenario Script

**Duration**: 5 minutes
**Audience**: Hackathon judges
**Goal**: Demonstrate privacy-preserving fraud detection with immediate impact

---

## Setup

**Characters:**
- **Bank A** (First National Bank)
- **Bank B** (Second Regional Bank)
- **Fraudster** (John Doe - fake identity)
- **Regulator** (FinCEN Observer)

**Pre-loaded Data:**
- 5 common fraud patterns
- 2 banks registered on network
- 1 regulator observer node

---

## Scene 1: The Problem (30 seconds)

### Narration
> "Meet John Doe. He's a professional fraudster. Yesterday, he opened an account at Bank A using a stolen identity. Today, he's attempting a classic money laundering scheme."

### Screen: Bank A Dashboard
**Action:** Show suspicious transaction alert

```
⚠️ SUSPICIOUS TRANSACTION DETECTED

Customer: John Doe
Amount: $9,500 USD (just under reporting threshold)
Destination: Crypto exchange in high-risk jurisdiction
Account Age: 2 days
Risk Factors:
- Structuring pattern (avoiding $10K threshold)
- New account
- High-risk destination
- Unusual for customer profile
```

### Narration
> "Bank A's traditional AML system flags this. After investigation, they confirm it's fraud and close John's account. But here's the problem..."

---

## Scene 2: The Cycle Continues (45 seconds)

### Screen: Timeline View
**Action:** Show fraudster moving between banks

```
Day 1: John Doe → Bank A → Detected → Account Closed
Day 2: John Doe → Bank B → ???
```

### Narration
> "John simply moves to Bank B and tries the exact same scheme. Bank B has no idea about Bank A's discovery. Why? Banks can't share customer data due to privacy regulations."

### Screen: Bank B Dashboard (Without AML Network)
**Action:** Show transaction going through

```
Transaction Approved ✓
Amount: $9,500 → Crypto Exchange
Status: Processing

Bank B loses: $9,500
```

### Narration
> "This cycle costs banks $180 billion annually. But what if banks could share fraud patterns without sharing customer data?"

---

## Scene 3: AML Prediction Network Solution (2 minutes)

### Part A: Pattern Sharing (30 seconds)

### Screen: Bank A - Pattern Submission
**Action:** Bank A submits anonymized fraud pattern

```
SUBMIT FRAUD PATTERN

Pattern Type: Structuring
Characteristics:
✓ Multiple transactions just under $10K
✓ New account (<7 days)
✓ High-risk jurisdiction
✓ Crypto destination
✓ No prior transaction history

Customer Data Shared: NONE ✗
Pattern Hash: 0x7a8f...42e1

[Submit to Network]
```

**Narration:**
> "Bank A submits the fraud pattern to the AML Prediction Network. Notice: NO customer names, account numbers, or personal data is shared. Only the behavioral pattern."

### Part B: Prediction Market (45 seconds)

### Screen: John Tries Bank B Again
**Action:** Show same fraudster attempting identical transaction

```
NEW TRANSACTION

Amount: $9,500
Destination: Crypto exchange
Account Age: 1 day

⚡ PATTERN MATCH DETECTED
Similarity: 95% match to known fraud pattern

→ Creating Prediction Market
```

### Screen: Prediction Market
**Action:** Banks vote on fraud likelihood

```
PREDICTION MARKET #42

Question: Is this transaction fraudulent?
Deadline: 24 hours
Stakes: $425 total

Bank Predictions:
┌─────────┬────────────┬────────┐
│ Bank    │ Confidence │ Stake  │
├─────────┼────────────┼────────┤
│ Bank A  │ 85% FRAUD  │ $200   │
│ Bank C  │ 75% FRAUD  │ $150   │
│ Bank D  │ 70% FRAUD  │ $75    │
└─────────┴────────────┴────────┘

WEIGHTED RISK SCORE: 79%
```

**Narration:**
> "The network instantly recognizes the pattern. Banks who've seen similar fraud stake their confidence. Bank A, having just dealt with John, gives 85% fraud probability."

### Part C: Action & Outcome (45 seconds)

### Screen: Automated Decision
**Action:** Show risk score triggering action

```
RISK SCORE: 79%

Threshold Rules:
> 80% → Auto-block
60-80% → Enhanced Due Diligence ✓ (TRIGGERED)
< 40% → Approve

ACTION TAKEN: Transaction Held for Review
Manual review required within 4 hours
Customer contacted for verification
```

### Screen: Investigation Result
**Action:** Show confirmed fraud

```
INVESTIGATION COMPLETE

Outcome: ✓ CONFIRMED FRAUD
Fraudster: Same individual from Bank A
Method: Identical structuring pattern
Saved: $9,500

Pattern confidence increased to 95%
Network learns and improves
```

**Narration:**
> "Bank B's compliance team investigates and confirms: it's the same fraudster. The transaction is blocked. Bank B saves $9,500. The network learns and gets smarter."

---

## Scene 4: Regulatory Compliance (1 minute)

### Screen: Regulator Dashboard
**Action:** Show FinCEN observer view

```
REGULATOR OBSERVER MODE

Network Statistics (Last 30 Days):
- Transactions Analyzed: 1,247
- Fraud Detected: 23 (1.8%)
- False Positives: 12 (-68% vs industry avg)
- Money Saved: $487,000
- Banks Participating: 4

Recent Activity:
┌──────────┬─────────────┬──────────┬──────────┐
│ Time     │ Transaction │ Outcome  │ Compliant│
├──────────┼─────────────┼──────────┼──────────┤
│ 10:42 AM │ #42         │ Blocked  │ ✓ Yes    │
│ 09:15 AM │ #41         │ Approved │ ✓ Yes    │
│ 08:33 AM │ #40         │ Review   │ ✓ Yes    │
└──────────┴─────────────┴──────────┴──────────┘

Audit Trail: Available
SAR Filings: Auto-generated
Privacy Compliance: BSA ✓ | GDPR ✓ | 314(b) ✓
```

### Screen: Compliance Breakdown
**Action:** Show how privacy is preserved

```
PRIVACY ARCHITECTURE

What IS Shared:
✓ Behavioral patterns (transaction structure)
✓ Risk indicators (aggregated)
✓ Fraud outcomes (confirmed/false positive)

What is NOT Shared:
✗ Customer names
✗ Account numbers
✗ Transaction details
✗ Bank-specific data

Technology:
- Canton Network selective disclosure
- Differential privacy for patterns
- Immutable audit trail
- Regulator read-only access
```

**Narration:**
> "Regulators love this. They get real-time visibility without compromising privacy. Every decision has an audit trail. Banks comply with Section 314(b), BSA, and GDPR simultaneously."

---

## Scene 5: Network Effects (30 seconds)

### Screen: Growth Visualization
**Action:** Show network value increasing

```
NETWORK EFFECTS

Banks in Network:
Month 1: 4 banks  → Detection: 65%
Month 3: 10 banks → Detection: 78%
Month 6: 25 banks → Detection: 89%

Value Proposition:
┌────────────────┬──────────┬──────────┐
│ Metric         │ Before   │ After    │
├────────────────┼──────────┼──────────┤
│ Fraud Detected │ 45%      │ 89%      │
│ False Positive │ 95%      │ 28%      │
│ Detection Time │ 14 days  │ Real-time│
│ Cost Savings   │ -        │ $2M/year │
└────────────────┴──────────┴──────────┘

"Each new bank makes the network smarter.
First-mover advantage = Winner takes most."
```

**Narration:**
> "As more banks join, detection accuracy skyrockets. False positives plummet. This is a network effects business: the more participants, the more valuable it becomes."

---

## Closing (30 seconds)

### Screen: Problem → Solution Summary
**Action:** Side-by-side comparison

```
BEFORE AML Network          |  AFTER AML Network
─────────────────────────────────────────────────
❌ Fraudsters cycle through  |  ✓ Real-time detection
❌ Banks can't share info    |  ✓ Privacy-preserved sharing
❌ 95% false positives       |  ✓ 68% reduction
❌ Weeks to detect repeats   |  ✓ Instant alerts
❌ $180B compliance costs    |  ✓ 30% cost savings
```

### Final Message
```
🎯 AML PREDICTION NETWORK

"Fraudsters share info on the dark web.
Now banks can too—without breaking privacy laws."

Built on Canton Network
Backed by FinCEN Section 314(b)
Winner-takes-most market dynamics

$180B market opportunity
Network effects moat
Regulator-aligned solution
```

**Narration:**
> "That's AML Prediction Network. Privacy-preserving fraud detection using prediction markets on Canton. Making financial systems safer, together."

---

## Technical Demo Flow (If Time Permits)

### Live Code Walkthrough (2 minutes)

1. **Show Daml Contract**
```daml
template Prediction
  with
    transactionId: Text
    banks: [Party]
    deadline: Time
    votes: Map Party Decimal
  where
    signatory banks

    choice Vote: ContractId Prediction
      with
        voter: Party
        confidence: Decimal
        stake: Decimal
      controller voter
      do
        -- Update votes map
        -- Calculate weighted risk score
        -- Trigger action if threshold met
```

2. **Show Privacy Layer**
```typescript
// Pattern submission (anonymized)
const pattern = {
  type: "structuring",
  characteristics: [
    "amount_near_threshold",
    "new_account",
    "high_risk_jurisdiction"
  ],
  // NO customer PII
  hash: sha256(patternData)
};

await canton.submitPattern(pattern);
```

3. **Show Frontend**
- Quick tour of Bank Dashboard
- Prediction Market UI
- Risk Score Chart
- Regulator View

---

## Q&A Preparation

**Expected Judge Questions:**

1. **"How do you handle privacy?"**
   > "Canton Network's selective disclosure ensures each party only sees what they're authorized to see. We use differential privacy for pattern aggregation and never share raw customer data."

2. **"What if banks collude?"**
   > "Long-term reputation system. Banks that consistently make bad predictions lose stake and influence. Economic incentives align with accuracy, not gaming."

3. **"How does this scale?"**
   > "Canton is built for enterprise scale. Each bank runs a local node. Prediction markets are lightweight. We've designed for 100+ banks from day one."

4. **"Regulatory approval?"**
   > "FinCEN Section 314(b) explicitly encourages information sharing under safe harbor provisions. EU 6AMLD mandates cross-border collaboration. We're helping regulators achieve their goals."

5. **"Why Canton over other blockchains?"**
   > "Three reasons: (1) Privacy-first design with selective disclosure, (2) Multi-party computation for regulated industries, (3) Enterprise-grade compliance features. This is impossible on public chains."

---

## Demo Checklist

**Before Demo:**
- [ ] Canton sandbox running
- [ ] Contracts deployed
- [ ] Demo data seeded
- [ ] Browser tabs organized
- [ ] Screen recording backup ready
- [ ] Internet connection stable

**During Demo:**
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Zoom screen share ready
- [ ] Mute notifications
- [ ] Have backup slides ready

**After Demo:**
- [ ] Answer questions confidently
- [ ] Offer to show code
- [ ] Share GitHub link
- [ ] Thank judges

---

**Demo Video Script Duration**: 5 minutes
**Live Demo Duration**: 3-4 minutes + Q&A
**Backup Plan**: Pre-recorded video if live demo fails
