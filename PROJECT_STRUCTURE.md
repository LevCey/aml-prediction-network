# Project Structure

```
aml-prediction-network/
│
├── daml/                           # Daml smart contracts
│   ├── src/
│   │   ├── Transaction.daml       # Transaction submission contracts
│   │   ├── Prediction.daml        # Prediction market logic
│   │   ├── RiskScore.daml         # Risk scoring aggregation
│   │   ├── Pattern.daml           # Fraud pattern library
│   │   └── Regulator.daml         # Regulator observer contracts
│   ├── daml.yaml                  # Daml project configuration
│   └── tests/                     # Daml contract tests
│
├── contracts/                      # Smart contract artifacts
│   └── build/                     # Compiled contracts (.dar files)
│
├── frontend/                       # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BankDashboard.tsx  # Main bank interface
│   │   │   ├── PredictionMarket.tsx
│   │   │   ├── RiskScoreChart.tsx
│   │   │   ├── PatternLibrary.tsx
│   │   │   └── RegulatorView.tsx
│   │   ├── hooks/
│   │   │   └── useDaml.ts         # Canton/Daml integration hooks
│   │   ├── services/
│   │   │   ├── api.ts             # API service layer
│   │   │   └── canton.ts          # Canton Network SDK
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                        # Backend services (optional)
│   ├── src/
│   │   ├── server.ts              # Express/Fastify server
│   │   ├── canton/                # Canton integration layer
│   │   ├── database/              # Database models
│   │   └── utils/                 # Utility functions
│   └── package.json
│
├── docs/                           # Documentation
│   ├── architecture.md            # System architecture
│   ├── api.md                     # API documentation
│   ├── regulatory-compliance.md   # Compliance documentation
│   ├── demo-scenario.md           # Hackathon demo script
│   └── pitch-deck.md              # Pitch deck outline
│
├── scripts/                        # Utility scripts
│   ├── setup-canton.sh            # Canton environment setup
│   ├── deploy-contracts.sh        # Contract deployment
│   ├── seed-data.sh               # Load demo data
│   └── run-demo.sh                # Run full demo scenario
│
├── tests/                          # Integration tests
│   ├── e2e/                       # End-to-end tests
│   └── integration/               # Integration tests
│
├── .gitignore
├── README.md
├── PROJECT_STRUCTURE.md           # This file
├── ROADMAP.md                     # Development roadmap
└── package.json                   # Root package.json (monorepo)
```

## Component Descriptions

### `/daml` - Smart Contracts
Core business logic implemented in Daml:
- **Transaction.daml**: Handles suspicious transaction submissions
- **Prediction.daml**: Prediction market mechanics (voting, staking)
- **RiskScore.daml**: Aggregates predictions into risk scores
- **Pattern.daml**: Fraud pattern library and matching
- **Regulator.daml**: Observer contracts for compliance

### `/frontend` - User Interface
React application for banks and regulators:
- **BankDashboard**: Main interface for bank users
- **PredictionMarket**: Submit and vote on predictions
- **RiskScoreChart**: Visualize risk scores and trends
- **PatternLibrary**: Browse and submit fraud patterns
- **RegulatorView**: Read-only compliance dashboard

### `/backend` - API Layer (Optional)
Middleware between frontend and Canton:
- REST API for frontend
- Canton SDK integration
- Database for caching/analytics
- Authentication/authorization

### `/docs` - Documentation
- Architecture diagrams
- Regulatory compliance mapping
- API specifications
- Demo scenario scripts
- Pitch materials

### `/scripts` - Automation
- Canton environment setup
- Contract deployment
- Demo data seeding
- End-to-end demo runner

## Development Workflow

1. **Smart Contracts**: Develop in `/daml`, test with Daml sandbox
2. **Frontend**: Develop in `/frontend`, connect to local Canton
3. **Integration**: Use `/scripts` to orchestrate full stack
4. **Documentation**: Keep `/docs` updated for hackathon judges

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Smart Contracts | Daml 2.x |
| Blockchain | Canton Network |
| Frontend | React + TypeScript |
| Backend | Node.js (optional) |
| Database | PostgreSQL (optional) |
| Testing | Daml Script + Jest |
| Deployment | Docker + Canton Sandbox |
