
// docs/architecture/project-structure.md

# Project Structure

## Overview
This document outlines the organization and structure of the XTNCT NinjaAI ICO DApp codebase. The project follows a modular architecture with clear separation of concerns.

## Directory Organization
The project's source code is primarily organized under the `src` directory, with system-level functionality contained within the `system` subdirectory:

src/
├── system/
│ ├── config/
│ │ ├── solana.ts
│ │ ├── firebase.ts
│ │ ├── parameters.ts
│ │ └── types.ts
│ ├── services/
│ │ ├── auth/
│ │ ├── balance/
│ │ ├── price/
│ │ └── firestore/
│ └── store/
│ ├── index.ts
│ └── types.ts


## Component Details

### Configuration Layer (`/system/config`)
The configuration directory manages all system-wide settings and initialization:

- `solana.ts`: Contains Solana network configurations, token addresses, and RPC endpoint settings
- `firebase.ts`: Handles Firebase initialization and configuration settings
- `parameters.ts`: Defines DApp-specific parameters such as balance thresholds and timeout values
- `types.ts`: Contains TypeScript type definitions for all configuration objects

### Services Layer (`/system/services`)
Services implement the core business logic of the application:

- `auth/`: Manages wallet connections and SMS verification
  - Wallet connection handling
  - SMS verification flow
  - Authentication state management

- `balance/`: Handles token balance monitoring
  - Balance checking logic
  - Threshold validation
  - Real-time balance updates

- `price/`: Manages price-related functionality
  - Price fetching from external APIs
  - Price caching mechanism
  - USD value calculations

- `firestore/`: Handles database operations
  - User data management
  - Transaction recording
  - Data validation and typing

### State Management (`/system/store`)
Implements Zustand-based state management for the application:

- `index.ts`: Defines the main store and state update methods
- `types.ts`: Contains TypeScript interfaces for the global state

## Best Practices

1. **File Naming**
   - Use kebab-case for file names
   - Use PascalCase for component files
   - Use camelCase for utility files

2. **Code Organization**
   - Related functionality should be co-located
   - Maintain clear separation between layers
   - Keep files focused and single-purpose

3. **Type Safety**
   - All configurations should be properly typed
   - Use TypeScript interfaces for data structures
   - Maintain type definitions in appropriate `.ts` files

4. **Documentation**
   - Include JSDoc comments for functions
   - Maintain up-to-date README files
   - Document any non-obvious implementation details

## Future Considerations

The project structure is designed to be scalable and maintainable. Future additions should follow the established patterns and be placed in appropriate directories based on their functionality.