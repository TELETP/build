# Project File Structure

```
project-root/
├── .idx/
├── .next/
├── .vscode/
├── docs/
│   ├── architecture/
│   │   ├── authentication-flow.md
│   │   ├── external-api-integrations.md
│   │   ├── project-structure.md
│   │   └── state-management.md
│   ├── configuration/
│   │   ├── environment-variables.md
│   │   ├── firebase-config.md
│   │   └── solana-config.md
│   ├── services/
│   │   ├── auth/
│   │   │   ├── storage-service.md
│   │   │   └── verification-service.md
│   │   ├── balance.md
│   │   ├── firestore.md
│   │   └── price.md
│   └── setup/
│       ├── getting-started.md
│       ├── prerequisites.md
│       ├── file-tree.md
│       └── README.md
├── node_modules/
├── public/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── providers/
│   │   │   └── WalletProvider.tsx
│   │   └── ui/
│   │       ├── button/
│   │       │   ├── ConnectWallet.tsx
│   │       │   └── types.ts
│   │       ├── display/
│   │       │   ├── Balance.tsx
│   │       │   ├── Copyright.tsx
│   │       │   ├── ProjectTokenPrice.tsx
│   │       │   ├── TokenPrice.tsx
│   │       │   └── types.ts
│   │       ├── feedback/
│   │       │   ├── ErrorMessage.tsx
│   │       │   ├── LoadingSpinner.tsx
│   │       │   └── types.ts
│   │       ├── layout/
│   │       │   ├── Container.tsx
│   │       │   ├── Footer.tsx
│   │       │   ├── Header.tsx
│   │       │   └── types.ts
│   │       ├── PhoneVerification.tsx
│   │       └── WalletConnection.tsx
│   └── system/
│       ├── config/
│       │   ├── env.ts
│       │   ├── external.ts
│       │   ├── firebase.ts
│       │   ├── index.ts
│       │   ├── parameters.ts
│       │   ├── solana.ts
│       │   ├── types.ts
│       │   ├── utils.ts
│       │   ├── validators.test.ts
│       │   ├── validators.ts
│       │   └── wallet-config.ts
│       ├── hooks/
│       │   └── useWalletAuth.ts
│       ├── services/
│       │   ├── auth/
│       │   │   ├── recaptcha.ts
│       │   │   ├── storage.ts
│       │   │   └── verification.ts
│       │   ├── balance/
│       │   │   ├── service.ts
│       │   │   └── types.ts
│       │   ├── firestore/
│       │   │   ├── index.ts
│       │   │   └── types.ts
│       │   ├── price/
│       │   │   ├── service.ts
│       │   │   └── types.ts
│       │   ├── token/
│       │   │   └── service.ts
│       │   └── wallet/
│       │       ├── connection.ts
│       │       └── index.ts
│       ├── store/
│       │   ├── index.ts
│       │   └── types.ts
│       └── types/
│           ├── token.ts
│           └── user.ts
├── .env.local
├── .gitignore
├── .npmrc
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## Directory Structure Overview

### `/docs`
Documentation organized by topic (architecture, configuration, services, setup).

### `/src/app`
Next.js App Router pages and layouts.

### `/src/components`
React components organized by functionality:
- `providers`: Context providers
- `ui`: User interface components

### `/src/system`
Core system functionality:
- `config`: Configuration files
- `hooks`: Custom React hooks
- `services`: Business logic and API interactions
- `store`: State management
- `types`: TypeScript type definitions

### Root Configuration Files
Project configuration and environment files.

## Footnotes
This file serves as a reference point for AI agents assisting developers. Relative paths from this file tree can be appended to the project's GitHub repository at `https://raw.githubusercontent.com/TELETP/build/refs/heads/main/` to access the latest file contents. This enables AI agents to review files and their current status as needed, reducing reliance on developer-provided files or the AI agent's memory.