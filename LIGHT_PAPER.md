# AML Prediction Network — Light Paper

**From Shared Ledgers to Shared Judgment**

---

## Abstract

Financial institutions operate in a fragmented detection landscape. Each organization observes only a partial view of financial activity, while illicit networks operate across institutions, jurisdictions, and time.

As a result, suspicious behavior rarely appears risky within any single institution's dataset. Risk emerges only when signals are combined — yet regulatory, legal, and competitive constraints prevent raw data sharing.

The Canton Network enables privacy-preserving shared workflows, but it does not natively provide a mechanism for aggregating distributed risk beliefs across mutually untrusted participants.

AML Prediction Network introduces **probabilistic risk signaling** — a coordination primitive allowing institutions to contribute confidential risk beliefs and receive aggregated network intelligence without exposing underlying data.

The system transforms isolated detection into collective inference.

---

## 1. Financial Crime as a Distributed Systems Failure

Financial crime is not merely an analytics problem. It is a coordination failure in a distributed system.

### Local Observability

Each financial institution maintains a partial transaction graph. Even advanced AML models operate on incomplete data, producing weak signals and delayed alerts.

### Global Adversarial Strategy

Modern laundering techniques intentionally distribute behavior:

- Multi-bank transaction paths
- Jurisdiction hopping
- Time-delayed structuring
- Identity layering

No participant sees enough evidence alone.

### Delayed Detection Dynamics

Risk becomes detectable only after reconstruction by authorities — after damage already occurs.

The core limitation is not modeling capability. It is the inability to combine beliefs without sharing data.

---

## 2. Why Existing Approaches Fail

Current industry approaches fall into three categories.

### Isolated Machine Learning

Each institution trains internal models.

Limitations: incomplete training graph, duplicated effort, systemic blind spots.

### Centralized Data Pooling

Shared databases or data hubs.

Limitations: regulatory infeasibility, liability concentration, low participation incentives.

### Bilateral Information Sharing

Manual cooperation agreements.

Limitations: slow propagation, selective participation, non-scalable trust.

All approaches attempt to share information. The missing alternative is sharing confidence instead of data.

---

## 3. The Primitive: Probabilistic Risk Signaling

Participants locally evaluate a hypothesis:

> **H:** An entity is involved in illicit financial activity.

Each institution computes a probability estimate. Instead of sharing evidence, they publish a belief commitment.

### Aggregation

For participant *i*:
- probability: `pᵢ`
- confidence weight: `wᵢ`

Network belief:

```
B = Σ(wᵢ · pᵢ) / Σ(wᵢ)
```

Participants learn the global confidence level — without learning any participant's internal reasoning.

This converts private detection into shared knowledge.

---

## 4. Network Mechanics

**Signal Creation** — Institutions compute local risk using internal AML systems.

**Signal Aggregation** — Committed beliefs combine via privacy-preserving workflow on Canton.

**Resolution** — Real-world outcomes confirm or reject hypotheses.

**Reputation Update** — Predictive accuracy updates participant weights.

The system rewards correct prediction, not data disclosure.

---

## 5. Privacy Model

The network enforces strict informational boundaries.

**Cannot Be Learned:**
- Transaction data
- Counterparties
- Exposure levels
- Internal models

**Can Be Learned:**
- Aggregated network risk
- Confidence evolution
- Reliability metrics

**Adversarial Mitigations:**
- Reputation weighting
- Quorum thresholds
- Delayed partial disclosure

Participation never increases regulatory exposure.

---

## 6. Why Canton

Collaborative inference requires properties uncommon in public blockchains:

- Selective visibility
- Synchronized workflows
- Deterministic agreement
- Institutional permissioning

Canton provides coordinated execution without global transparency.

AML Prediction Network uses Canton as a coordination layer — not a settlement layer.

---

## 7. Bootstrapping the Network

The system faces a cold-start problem. Early networks have low informational value.

**Strategy:** Start with a restricted cohort where feedback cycles are short and predictive accuracy forms rapidly.

The network transitions from trust-based cooperation to algorithmic trust.

---

## 8. Economic Model

The incentive is informational advantage.

Participants benefit when:
- Network signals improve internal detection
- Early warnings reduce compliance cost

Inaccurate contributors lose influence automatically. Honesty becomes the dominant strategy.

---

## 9. Implementation Status

- Canton DevNet deployment completed
- Aggregation workflow operational
- Demonstration environment functional

The prototype validates feasibility, not scale performance.

---

## 10. Future Work

Potential extensions:

- Federated model-assisted belief generation
- Adaptive hypothesis markets
- Automated regulatory triggers

The long-term goal is cooperative detection without shared datasets.

---

## Conclusion

AML Prediction Network introduces a new coordination paradigm: **knowledge sharing without information sharing.**

By exchanging confidence instead of data, institutions can detect distributed financial crime collectively while preserving sovereignty over sensitive information.

The network converts fragmented observations into shared situational awareness — without creating shared exposure.
