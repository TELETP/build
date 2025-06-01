// docs/README.md

# XTNCT NinjaAI ICO DApp Documentation

## Overview
This documentation covers the technical implementation of the XTNCT NinjaAI ICO DApp, a Solana-based initial coin offering platform. The DApp implements advanced features including SMS verification and anti-whale mechanisms through balance requirements.

## Core Features
- Solana wallet integration
- SMS verification via Firebase
- Real-time balance monitoring
- Anti-whale mechanisms
  - Minimum SOL balance requirement ($1 USD)
  - Minimum total balance requirement ($5 USD across SOL/USDT/USDC)
- Price monitoring and caching
- User verification persistence

## Documentation Structure

### `/architecture`
- Project structure and organization
- State management implementation
- System design decisions

### `/configuration`
- Environment variables setup
- Solana configuration
- System parameters

### `/services`
- Firestore database operations
- Balance monitoring and validation
- Price fetching and caching

### `/setup`
- Prerequisites and dependencies
- Getting started guide
- Development environment setup

## Quick Links
- [Project Structure](./architecture/project-structure.md)
- [Environment Setup](./configuration/environment-variables.md)
- [Prerequisites](./setup/prerequisites.md)
- [Getting Started](./setup/getting-started.md)

## Development Status
This project is currently in active development. Documentation will be updated as new features are implemented and existing features are modified.

## Contributing
When contributing to this documentation:
1. Ensure all file paths are correctly specified
2. Include code examples where applicable
3. Maintain consistent formatting
4. Update the relevant sections when implementing changes

## Support
For technical support or questions about the documentation:
1. Review existing documentation thoroughly
2. Check for recent updates
3. Contact the development team for clarification

