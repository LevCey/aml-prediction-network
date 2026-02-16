# Project Structure

```
aml-prediction-network/
│
├── daml/aml-network/                # Daml smart contracts (Canton Network)
│   ├── daml/
│   │   ├── PredictionMarket.daml    # Core voting + SAR auto-filing
│   │   ├── BankReputation.daml      # Accuracy tracking & voting power
│   │   ├── TransactionPattern.daml  # Fraud patterns & suspicious tx
│   │   ├── Setup.daml              # DevNet setup & party allocation
│   │   └── Main.daml              # Test scenarios
│   ├── daml.yaml                   # Daml project config
│   └── log/                        # Canton runtime logs
│
├── frontend/                        # React demo application (Vercel)
│   ├── src/
│   │   ├── App.tsx                 # Main dashboard (Network Overview)
│   │   ├── Demo.tsx                # Interactive demo scenarios
│   │   └── App.css / Demo.css     # Styles
│   ├── api/                        # Serverless API (Vercel Functions)
│   │   ├── demo.js                # Demo scenario endpoints
│   │   ├── contracts.js           # Canton contract queries
│   │   ├── parties.js             # Party management
│   │   └── health.js              # Health check
│   └── public/                     # Static assets & logos
│
├── docs/                            # Technical documentation
│   ├── architecture.md             # System architecture
│   ├── demo-scenario.md            # Demo script for presentations
│   └── deployment-diagram.md       # Canton DevNet deployment
│
├── assets/images/                   # README images
│   └── dashboard-screenshot.png    # Dashboard screenshot
│
├── README.md                        # Project overview
├── ROADMAP.md                       # Public development roadmap
├── LIGHT_PAPER.md                   # Technical light paper
├── PROJECT_STRUCTURE.md             # This file
├── package.json                     # Root package config
└── vercel.json                      # Vercel deployment config
```

## Smart Contracts (Daml)

| Contract | Purpose |
|----------|---------|
| **PredictionMarket.daml** | Banks vote on fraud probability, weighted risk scoring, SAR auto-filing |
| **BankReputation.daml** | Tracks prediction accuracy, adjusts voting power |
| **TransactionPattern.daml** | FraudPattern + SuspiciousTransaction templates |
| **Setup.daml** | DevNet party setup (banks, regulator, operator) |
| **Main.daml** | Test scenarios and network setup |

## Key Flows

```
FraudPattern → SuspiciousTransaction → PredictionMarket → RiskScore → SAR/Block → BankReputation
```

## External Resources

- **Live Demo**: [amlprediction.network](https://amlprediction.network)
- **Landing Page**: [amlprediction.com](https://amlprediction.com)
- **Pitch Deck**: [Google Slides](https://docs.google.com/presentation/d/1QeAzXsDw32-4pzpfxsuMirPDRZPryVMPpGeKwzSHwlc/edit?usp=sharing)
- **Video**: [YouTube](https://youtu.be/OnXVF5nY2yI)

## Deployment

- **Frontend**: Vercel (amlprediction.network)
- **Smart Contracts**: Canton DevNet (Tenzro platform)
- **Status**: ✅ DevNet deployment complete

---

**Last Updated**: February 16, 2026
