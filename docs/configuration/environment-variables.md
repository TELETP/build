# Environment Variables

## Overview
This document lists all environment variables required for the XTNCT NinjaAI ICO DApp.

## Required Variables

### Solana Configuration
```env
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS=So11111111111111111111111111111111111111112
NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS=YourProjectTokenMintAddressHere
NEXT_PUBLIC_FUNDING_ADDRESS=YourFundingAddressHere
```

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project Bradid.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### External APIs
```env
NEXT_PUBLIC_COINMARKETCAP_API_KEY=your-coinmarketcap-api-key
NEXT_PUBLIC_CIRCLE_LASTMAN=your-circle-api-key
```

## Configuration Files
These variables are used in the following configuration files:
- `src/system/config/solana.ts`
- `src/system/config/firebase.ts`
- `src/system/config/external.ts`

## Security Considerations
- Never commit `.env.local` to version control
- Keep API keys secure and rotate regularly
- Use appropriate access controls for sensitive variables

## Development vs Production
- Use different Firebase projects for development and production
- Maintain separate API keys for different environments
- Document environment-specific configurations