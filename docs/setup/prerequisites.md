# Prerequisites

## Development Environment

### Required Software
1. **Node.js**
   - Version: 18.x or higher
   - Download: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Firebase Studio (FBS)**
   - Latest version
   - Required for development environment
   - Project must be initialized in FBS

3. **Solana Tools**
   - Solana CLI tools
   - Installation:
     ```bash
     sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
     ```
   - Verify installation: `solana --version`

### Required Accounts

1. **Firebase Account**
   - Google Cloud Platform account
   - Firebase project created
   - Firebase configuration details available

2. **CoinMarketCap API**
   - Developer account
   - API key with appropriate permissions
   - Rate limits understood

3. **Solana Wallet**
   - Development wallet with devnet SOL
   - Understanding of wallet management
   - Access to devnet faucet

## Configuration Requirements

### Environment Variables
Ensure you have access to the following:
```env
NEXT_PUBLIC_COINMARKETCAP_API_KEY=
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=
NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS=
NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS=
NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS=
NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS=
NEXT_PUBLIC_FUNDING_ADDRESS=
```

### Firebase Configuration
Required Firebase services:
- Authentication (for SMS verification)
- Firestore Database
- Firebase configuration object

## Development Knowledge

### Required Skills
1. **TypeScript**
   - Understanding of types and interfaces
   - Familiarity with TypeScript configuration
   - Experience with type safety

2. **React & Next.js**
   - React hooks and components
   - Next.js App Router
   - TypeScript integration

3. **Solana Development**
   - Basic understanding of Solana architecture
   - Experience with wallet integration
   - Knowledge of token standards

### Recommended Knowledge
1. **Firebase**
   - Authentication flows
   - Firestore operations
   - Security rules

2. **Web3**
   - Blockchain concepts
   - Token economics
   - Smart contract interaction

## System Requirements

### Hardware
- Minimum 8GB RAM
- Modern CPU (4+ cores recommended)
- SSD storage recommended

### Network
- Stable internet connection
- Access to Solana devnet
- Unrestricted access to Firebase services

## Development Tools

### Recommended IDE
- Firebase Studio (FBS)
- VSCode with extensions:
  - TypeScript
  - ESLint
  - Prettier

### Version Control
- Git
- GitHub account
- Basic Git knowledge

## Next Steps
After ensuring all prerequisites are met:
1. Review [Getting Started](./getting-started.md)
2. Set up environment variables
3. Initialize development environment

## Troubleshooting

### Common Issues
1. Node.js version conflicts
2. Firebase initialization errors
3. Solana CLI installation problems

### Support Resources
- Solana Documentation
- Firebase Documentation
- Project-specific support channels