# AML Prediction Network — Roadmap

**From Shared Ledgers to Shared Judgment**

---

## Current Status — February 2026

- ✅ Canton Catalyst 2026 Winner
- ✅ Mentorship program (ongoing)
- ✅ Working prototype on Canton DevNet
- ✅ Live demo: [amlprediction.network](https://amlprediction.network)
- ✅ Landing page: [amlprediction.com](https://amlprediction.com)

---

## Phase 1: Prototype ✅

Validate that privacy-preserving belief aggregation can be implemented on Canton.

**Completed:**

- Multi-party Daml contracts for belief commitments
- Weighted risk signal aggregation
- Reputation scoring and weight adjustment
- SAR auto-filing at configurable thresholds
- Regulator observer mode (read-only audit trail)
- Interactive demo environment
- Canton DevNet deployment

**Smart Contracts:**

| Contract | Purpose |
|----------|---------|
| `PredictionMarket.daml` | Belief submission, weighted risk scoring, SAR triggers |
| `BankReputation.daml` | Prediction accuracy tracking, voting weight adjustment |
| `TransactionPattern.daml` | Fraud pattern templates, suspicious transaction matching |
| `Setup.daml` | DevNet party setup (banks, regulator, operator) |

**Outcome:** The coordination mechanism works. Beliefs can be submitted, aggregated, and resolved on Canton with privacy boundaries enforced at the contract level.

---

## Phase 2: Mechanism Hardening (Current)

Stress-test the mechanism under adversarial conditions and expand simulation scope.

**In Progress:**

- [ ] Adversarial testing — can participants game the aggregation?
- [ ] Sybil resistance — does reputation weighting prevent manipulation?
- [ ] Expanded participant simulation — 5+ concurrent institutions
- [ ] Aggregation quality analysis — does collective output outperform individual signals?
- [ ] Regulator feedback integration — observer node usability
- [ ] Resolution workflow refinement — how hypotheses get confirmed or rejected

**Key Questions This Phase Answers:**

- Is the primitive sound under adversarial assumptions?
- Does aggregation measurably improve decision quality?
- Does privacy hold when participants attempt inference attacks?

**Target Outcome:** Mechanism validity demonstrated with evidence, not just feasibility.

---

## Phase 3: Generalization

Extend the coordination primitive beyond AML to other regulated domains.

**Planned:**

- [ ] Federated model-assisted belief generation
- [ ] Adaptive hypothesis markets
- [ ] Multi-domain signal types (sanctions, credit risk, market abuse)
- [ ] Design partner exploration
- [ ] Regulator engagement for pilot feedback

**Potential Domains:**

| Domain | Coordination Need |
|--------|-------------------|
| Market abuse signaling | Cross-venue pattern detection |
| Credit risk coordination | Shared exposure awareness |
| Sanctions intelligence | Distributed screening signals |
| Liquidity stress detection | Interbank early warning |

**Target Outcome:** The primitive generalizes — AML was the first application, not the only one.

---

## Long-Term Vision

A financial system where institutions coordinate knowledge without surrendering sovereignty.

The network converts fragmented observations into shared situational awareness — without creating shared exposure.
