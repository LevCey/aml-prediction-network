# Demo Scenario Script

**Duration**: 5 minutes
**Audience**: Investors & Mentors
**Goal**: Demonstrate privacy-preserving fraud detection with immediate impact

🏆 **Canton Catalyst 2026 Winner**

---

## Setup

**Characters:**
- **Bank A** (First National Bank)
- **Bank B** (Second Regional Bank)
- **Fraudster** (John Doe - fake identity)
- **Regulator** (FinCEN Observer)

**Pre-loaded Data:**
- Common fraud patterns
- 3 banks registered on network
- 1 regulator observer node

---

## Scene 1: The Problem (30 seconds)

### Narration
> "Meet John Doe. He's a professional fraudster. Yesterday, he opened an account at Bank A using a stolen identity. Today, he's attempting a classic money laundering scheme."

### Screen: Bank A Dashboard
**Action:** Show suspicious transaction alert

```
⚠️ SUSPICIOUS TRANSACTION DETECTED

Amount: $9,500 USD (just under reporting threshold)
Destination: Crypto exchange in high-risk jurisdiction
Account Age: 2 days
Risk Factors:
- Structuring pattern (avoiding $10K threshold)
- New account
- High-risk destination
```

### Narration
> "Bank A's AML system flags this. After investigation, they confirm it's fraud and close the account. But here's the problem..."

---

## Scene 2: The Cycle Continues (45 seconds)

### Screen: Timeline View

```
Day 1: Fraudster → Bank A → Detected → Account Closed
Day 2: Fraudster → Bank B → ???
```

### Narration
> "The fraudster simply moves to Bank B and tries the exact same scheme. Bank B has no idea about Bank A's discovery. Why? Banks can't share customer data due to privacy regulations."

### Screen: Bank B Dashboard (Without AML Network)

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

```
SUBMIT FRAUD PATTERN

Pattern Type: Structuring
Characteristics:
✓ Transactions just under $10K
✓ New account (<7 days)
✓ High-risk jurisdiction
✓ Crypto destination

Customer Data Shared: NONE ✗
Pattern Hash: 0x7a8f...42e1

[Submit to Network]
```

**Narration:**
> "Bank A submits the fraud pattern to the AML Prediction Network. Notice: NO customer names, account numbers, or personal data is shared. Only the behavioral pattern."

### Part B: Prediction Market (45 seconds)

### Screen: Pattern Match Detected

```
NEW TRANSACTION AT BANK B

Amount: $9,500
Destination: Crypto exchange
Account Age: 1 day

⚡ PATTERN MATCH DETECTED
Similarity: 95% match to known fraud pattern

→ Creating Prediction Market
```

### Screen: Prediction Market

```
PREDICTION MARKET

Question: Is this transaction fraudulent?
Deadline: 24 hours

Bank Predictions:
┌─────────┬────────────┬────────┐
│ Bank    │ Confidence │ Stake  │
├─────────┼────────────┼────────┤
│ Bank A  │ 95% FRAUD  │ $100   │
│ Bank B  │ 90% FRAUD  │ $100   │
└─────────┴────────────┴────────┘

WEIGHTED RISK SCORE: 92.5%
```

**Narration:**
> "The network instantly recognizes the pattern. Banks stake their confidence. Bank A, having just dealt with this fraudster, gives 95% fraud probability."

### Part C: Action & SAR Auto-Filing (45 seconds)

### Screen: Automated Decision

```
RISK SCORE: 92.5%

Threshold Rules:
≥ 80% → Auto-block + SAR Filed ✓ (TRIGGERED)
60-80% → Enhanced Due Diligence
< 60% → Approve

ACTION TAKEN: BLOCKED
```

### Screen: SAR Auto-Filed

```
┌─────────────────────────────────────┐
│ 📋 SAR Auto-Filed                   │
│ ID: SAR-TX_001                      │
│ Status: ✓ ACKNOWLEDGED              │
│ Risk Score: 92.5%                   │
│ Filing Bank: Bank A                 │
└─────────────────────────────────────┘
```

**Narration:**
> "Risk score exceeds 80%, so the transaction is auto-blocked AND a SAR is automatically filed to FinCEN. No manual paperwork. Instant compliance."

---

## Scene 4: Regulator View (1 minute)

### Screen: Regulator Dashboard

```
🏛️ REGULATOR DASHBOARD (FinCEN Observer Mode)

Statistics:
- Active SARs: 1
- Audit Events: 5
- Banks Active: 3
- Compliance Rate: 100%

📋 SAR Reports:
┌────────────────┬──────────┬────────────┐
│ SAR-TX_001     │ 92.5%    │ ACKNOWLEDGED│
└────────────────┴──────────┴────────────┘

📜 Audit Log:
10:35:01  SAR_FILED       Bank A  TX_001
10:35:00  MARKET_CLOSED   Bank A  TX_001
10:32:00  VOTE_SUBMITTED  Bank B  TX_001
10:31:00  VOTE_SUBMITTED  Bank A  TX_001
10:30:00  PATTERN_MATCHED System  TX_001
```

### Screen: Privacy Preserved

```
🔒 PRIVACY ARCHITECTURE

What IS Shared:
✓ Behavioral patterns (hashed)
✓ Risk scores (aggregated)
✓ Audit trail

What is NOT Shared:
✗ Customer names
✗ Account numbers
✗ Transaction details
✗ Bank-specific PII

Compliance: BSA ✓ | GDPR ✓ | 314(b) ✓
```

**Narration:**
> "Regulators get real-time visibility. Every decision has an immutable audit trail. SAR filing is automatic. Banks comply with BSA, GDPR, and Section 314(b) simultaneously."

---

## Scene 5: Network Effects (30 seconds)

### Screen: Value Proposition

```
BEFORE vs AFTER

│ Metric         │ Before   │ After     │
├────────────────┼──────────┼───────────┤
│ Fraud Detected │ 45%      │ 89%       │
│ False Positive │ 95%      │ 28%       │
│ Detection Time │ 14 days  │ Real-time │
│ SAR Filing     │ Manual   │ Automatic │
│ Cost Savings   │ -        │ 30%       │

"Each new bank makes the network smarter."
```

**Narration:**
> "As more banks join, detection accuracy increases. False positives drop. This is a network effects business - winner takes most."

---

## Closing (30 seconds)

### Final Message

```
🎯 AML PREDICTION NETWORK

"Fraudsters share info on the dark web.
Now banks can too—without breaking privacy laws."

✓ Privacy-preserving (Canton Network)
✓ Automated compliance (SAR auto-filing)
✓ Immutable audit trail
✓ Network effects moat

🏆 Canton Catalyst 2026 Winner
```

**Narration:**
> "That's AML Prediction Network. Privacy-preserving fraud detection with automated compliance. Making financial systems safer, together."

---

## Q&A Preparation

**Expected Questions:**

1. **"How do you handle privacy?"**
   > "Canton Network's selective disclosure - each party only sees what they're authorized to see. No customer PII ever leaves the bank."

2. **"What about SAR compliance?"**
   > "Automatic. Risk score ≥80% triggers SAR filing. Regulator sees it instantly. Immutable audit trail for every action."

3. **"What if banks collude?"**
   > "Reputation system. Bad predictions = lost stake + lower voting power. Economic incentives align with accuracy."

4. **"Why Canton?"**
   > "Privacy-first design, enterprise-grade, regulatory compliant. This is impossible on public blockchains."

---

## Demo Checklist

**Before Demo:**
- [ ] Frontend running (npm start)
- [ ] Demo data loaded
- [ ] Browser tabs: Dashboard, Prediction Market, Regulator View

**Key Screens to Show:**
1. Dashboard → Transaction with SAR alert
2. Prediction Market → Voting UI
3. Regulator View → Audit Log + SAR list

---

**Last Updated**: January 25, 2026
