# Project Structure

```
aml-prediction-network/
│
├── daml/aml-network/              # Daml smart contracts
│   ├── daml/
│   │   ├── Main.daml              # Test scenarios & setup
│   │   ├── PredictionMarket.daml  # Core voting mechanism
│   │   ├── BankReputation.daml    # Accuracy tracking & voting power
│   │   ├── TransactionPattern.daml # Fraud patterns & suspicious tx
│   │   ├── FraudPatterns.daml     # Pattern definitions
│   │   └── SimplePrediction.daml  # Simplified prediction (demo)
│   ├── daml.yaml                  # Daml project config
│   └── .daml/dist/                # Compiled .dar files
│
├── frontend/                       # React demo application
│   ├── src/
│   │   ├── App.tsx                # Main dashboard component
│   │   └── App.css                # Styles
│   └── public/
│
├── docs/                           # Documentation
│   ├── architecture.md            # Technical architecture
│   ├── demo-scenario.md           # Demo script for presentations
│   ├── images/                    # Screenshots & diagrams
│   ├── medium/                    # Blog articles
│   ├── mentor/                    # Mentor meeting notes
│   └── chat/                      # Chat history backups
│
├── scripts/                        # Utility scripts
│
├── README.md                       # Project overview
├── ROADMAP.md                      # Development roadmap
├── PROJECT_STRUCTURE.md            # This file
└── package.json
```

## Smart Contracts (Daml)

| Contract | Purpose |
|----------|---------|
| **PredictionMarket.daml** | Banks vote on fraud probability with stakes |
| **BankReputation.daml** | Tracks accuracy, adjusts voting power |
| **TransactionPattern.daml** | FraudPattern + SuspiciousTransaction templates |
| **Main.daml** | Test scenarios and network setup |

## Key Flows

```
FraudPattern → SuspiciousTransaction → PredictionMarket → RiskScore → BankReputation
```

## External Resources

- **Landing Page**: amlprediction.com (separate repo: /Documents/Kiro/AML-Prediction)
- **Demo App**: amlprediction.network (Vercel deployment)

---

**Last Updated**: January 25, 2026
