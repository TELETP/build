# Getting Started

## Initial Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone [repository-url]
cd xtnct-ninjaai

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_COINMARKETCAP_API_KEY=your_api_key
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS=So11111111111111111111111111111111111111112
NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS=your_token_address
NEXT_PUBLIC_FUNDING_ADDRESS=your_funding_address
```

### 3. Firebase Setup
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```
Select the following Firebase services:
- Authentication
- Firestore
- Hosting (optional)

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
Access the development server at `http://localhost:3000`

### 2. Firebase Studio (FBS)
1. Open FBS
2. Select your project
3. Verify connection to development environment

### 3. Phone Verification in Development

To facilitate easier testing of the phone verification flow without incurring SMS costs or requiring actual phone numbers during development, the system provides the following features when `process.env.NODE_ENV` is set to `'development'`:

*   **Test Phone Numbers:**
    *   A predefined set of test phone numbers is configured in `src/system/services/auth/verification.ts` (e.g., `+16505550001`, `+16505550002`, `+16505550003`).
    *   When one of these numbers is used for verification in development mode, the system simulates sending an SMS.

*   **Static Test Verification Code:**
    *   For the above test phone numbers, a static verification code is used: `123456`.
    *   Enter this code when prompted for the OTP during the development testing flow.

*   **How to Use:**
    1.  Ensure your application is running in development mode (`npm run dev`).
    2.  When testing the phone verification feature, enter one of the recognized test phone numbers.
    3.  When prompted for the OTP, enter `123456`.
    4.  The verification flow should proceed as if a real OTP was sent and verified.

This allows developers to thoroughly test all aspects of the wallet connection and phone verification UI and logic without relying on external SMS services. Refer to `docs/services/auth/verification-service.md` for more details on the `VerificationService`.

## Configuration Verification

### 1. Verify Solana Connection
```javascript
// Run this in your browser console
const connection = new solanaWeb3.Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT
);
await connection.getVersion();
```

### 2. Check Environment Variables
```javascript
// Verify in your browser console
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    console.log(`${key}: ${value ? '✓' : '✗'}`);
  }
});
```

## Project Structure Navigation

### Key Directories
```
src/
├── system/
│   ├── config/      # System configuration
│   ├── services/    # Core services
│   └── store/       # State management
├── app/             # Next.js app router
└── components/      # React components
```

## Development Guidelines

### 1. Code Style
- Follow TypeScript best practices
- Use provided type definitions
- Maintain consistent formatting

### 2. Service Implementation
```typescript
// Example service usage
import { balanceService } from '@/system/services/balance';

async function checkUserEligibility(wallet: string) {
  try {
    const isEligible = await balanceService.validateRequirements(wallet);
    console.log(`User eligibility: ${isEligible}`);
  } catch (error) {
    console.error('Eligibility check failed:', error);
  }
}
```

### 3. State Management
```typescript
// Example store usage
import { useAppStore } from '@/system/store';

function WalletStatus() {
  const { wallet, isConnected } = useAppStore(state => state.user);
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
      {wallet && <p>Wallet: {wallet}</p>}
    </div>
  );
}
```

## Testing

### 1. Run Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- balance.test.ts
```

### 2. Test Accounts
- Use dedicated devnet wallets for testing
- Maintain minimum required balances
- Document test wallet addresses

## Common Issues and Solutions

### 1. Connection Issues
```typescript
// Verify RPC endpoint
async function checkConnection() {
  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT);
    await connection.getVersion();
    console.log('Connection successful');
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

### 2. Firebase Issues
- Verify Firebase configuration
- Check authentication settings
- Confirm Firestore rules

### 3. Balance Monitoring
- Ensure proper token addresses
- Verify price service connection
- Check balance thresholds

## Deployment

### 1. Development
```bash
# Build for development
npm run build

# Start development server
npm run dev
```

### 2. Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Next Steps
1. Review [Project Structure](../architecture/project-structure.md)
2. Explore [Service Documentation](../services)
3. Understand [State Management](../architecture/state-management.md)

## Support

### Resources
- Project Documentation
- Solana Documentation
- Firebase Documentation

### Getting Help
1. Check existing documentation
2. Review common issues
3. Contact development team