
# Project Structure

## Overview
This document outlines the organization and structure of the Solana dApp codebase, which integrates Firebase for phone verification. The project follows a modular architecture with clear separation of concerns to enhance maintainability and scalability.

## Directory Organization
The project's source code is primarily organized under the `src` directory, with system-level functionality contained within the `system` subdirectory:

src/
├── system/
│ ├── config/
│ │ ├── env.ts
│ │ ├── external.ts
│ │ ├── firebase.ts
│ │ ├── index.ts
│ │ ├── parameters.ts
│ │ ├── solana.ts
│ │ ├── types.ts
│ │ ├── utils.ts
│ │ ├── validators.test.ts
│ │ ├── validators.ts
│ │ └── wallet-config.ts
│ ├── hooks/
│ │ └── useWalletAuth.ts
│ ├── services/
│ │ ├── auth/
│ │ │ ├── recaptcha.ts
│ │ │ ├── storage.ts
│ │ │ └── verification.ts
│ │ ├── balance/
│ │ │ ├── service.ts
│ │ │ └── types.ts
│ │ ├── firestore/
│ │ │ ├── index.ts
│ │ │ └── types.ts
│ │ ├── price/
│ │ │ ├── service.ts
│ │ │ └── types.ts
│ │ ├── token/
│ │ │ └── service.ts
│ │ ├── wallet/
│ │ │ └── connection.ts
│ │ └── index.ts
│ └── store/
│ ├── index.ts
│ └── types.ts
└── ... (other UI components, pages, etc.)

## Component Details

### Configuration Layer (`src/system/config`)
The configuration directory manages all system-wide settings, initializations, and validation:

- `env.ts`: Manages environment-specific variables (e.g., development, production).
- `external.ts`: Configures access to external APIs (e.g., CoinMarketCap, Circle).
- `firebase.ts`: Handles Firebase project initialization and configuration settings.
- `index.ts`: Serves as a central export point for configurations, potentially for consolidated access or to trigger validations.
- `parameters.ts`: Defines DApp-specific operational parameters, such as balance thresholds or feature flags.
- `solana.ts`: Contains Solana network configurations, including RPC endpoints, cluster information, and key program/token addresses.
- `types.ts`: Provides TypeScript type definitions for all configuration objects, ensuring type safety.
- `utils.ts`: Includes utility functions used across the configuration layer, e.g., for parsing or validating settings.
- `validators.ts`: Contains functions to validate the structure and values of configuration settings.
- `validators.test.ts`: Unit tests for the configuration validators.
- `wallet-config.ts`: Defines configurations specific to Solana wallet adapters and connection options.

### Hooks Layer (`src/system/hooks`)
This directory contains custom React hooks that encapsulate complex stateful logic and side effects related to system functionalities, promoting reusability in UI components.

- `useWalletAuth.ts`: Manages wallet connection state (connecting, disconnecting, active wallet), user authentication status, and orchestrates the phone verification flow by interacting with verification and storage services.

### Services Layer (`src/system/services`)
Services implement the core business logic and external interactions of the application:

- `auth/`: Manages user authentication and phone verification processes.
  - `verification.ts`: Handles the logic for phone number verification using Firebase Auth (sending OTPs, verifying codes) and interacts with Firestore to store verification status.
  - `storage.ts`: Manages the local caching (e.g., in localStorage) of phone verification status to reduce redundant checks.
  - `recaptcha.ts`: Integrates and manages reCAPTCHA for bot protection during authentication flows.

- `balance/`: Handles token balance checking and monitoring for connected wallets.
  - `service.ts`: Implements logic to fetch and monitor token balances.
  - `types.ts`: Defines types related to balance data.

- `firestore/`: Provides a generic interface for database operations with Firestore.
  - `index.ts`: Core Firestore interaction logic (CRUD operations).
  - `types.ts`: TypeScript types for data stored in Firestore.

- `price/`: Manages fetching and caching of token prices from external APIs.
  - `service.ts`: Implements logic to fetch prices (e.g., SOL/USD) from services like CoinMarketCap, including caching.
  - `types.ts`: Defines types for price data and API responses.

- `token/`: Handles operations related to SPL tokens, such as fetching metadata.
  - `service.ts`: Implements token-specific functionalities.

- `wallet/`: Manages wallet-specific interactions beyond basic connection adapter functionalities.
  - `connection.ts`: May contain utility functions or services to enhance or manage wallet connections.

- `index.ts`: Often serves as an aggregator or entry point for services, potentially re-exporting service instances.

### State Management (`src/system/store`)
Implements Zustand-based global state management for the application:

- `index.ts`: Defines the main Zustand store, actions, and selectors for global application state.
- `types.ts`: Contains TypeScript interfaces for the global state structure.

## Best Practices

1. **File Naming**
   - Use kebab-case for file names (e.g., `user-profile.ts`).
   - Use PascalCase for React component files (e.g., `UserProfile.tsx`).
   - Utility files can be camelCase (e.g., `formatDate.ts`) or kebab-case.

2. **Code Organization**
   - Related functionality should be co-located within modules (e.g., all auth-related services in `services/auth/`).
   - Maintain clear separation between layers (UI, hooks, services, config).
   - Keep files focused on a single responsibility.

3. **Type Safety**
   - All configurations, service functions, and store states should be strongly typed using TypeScript.
   - Use TypeScript interfaces or types for all data structures.
   - Centralize common types where appropriate (e.g., in `types.ts` files within modules or a global types directory).

4. **Documentation**
   - Include JSDoc comments for functions, hooks, and complex logic.
   - Maintain this `project-structure.md` and other architectural documents.
   - Document any non-obvious implementation details or decisions.

## Future Considerations

The project structure is designed to be scalable and maintainable. Future additions should follow the established patterns:
- New UI components go into `src/components` or feature-specific directories.
- New hooks related to system logic go into `src/system/hooks`.
- New services for distinct business logic go into `src/system/services`.
- Configuration for new integrations goes into `src/system/config`.
This modular approach will help manage complexity as the dApp grows.