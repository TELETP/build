# Firestore Service

## Overview
The Firestore service manages all database operations for the ICO DApp, including user data storage, transaction records, and verification status.

## Data Models

### User Document
```typescript
interface FirestoreUser {
  id: string;
  wallet: string;
  smsVerified: boolean;
  lastSmsVerification: Date;
  hasProjectTokens: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction Document
```typescript
interface FirestoreTransaction {
  id: string;
  userId: string;
  wallet: string;
  amount: number;
  tokenSymbol: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}
```

## Service Methods

### User Operations
- `getUser(wallet: string)`: Retrieve user data
- `createUser(userData: UserData)`: Create new user
- `updateUserVerification(wallet: string, verified: boolean)`: Update verification status

### Transaction Operations
- `recordTransaction(transaction: Transaction)`: Record new transaction
- `getTransactionHistory(wallet: string)`: Retrieve transaction history

## Error Handling

### Error Types
```typescript
class FirestoreError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}
```

### Error Scenarios

#### Document Not Found
- Occurs when querying non-existent documents
- Returns null for queries
- Throws error for required operations

#### Permission Denied
- Occurs when security rules prevent operation
- Always throws error
- Includes detailed message

#### Network Errors
- Handles offline scenarios
- Implements retry logic
- Provides fallback behavior

### Error Logging
- All errors are logged with context
- Includes timestamp and operation details
- Maintains error history for debugging

## Security Rules

### Access Control
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{transactionId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Data Validation
- Enforces data types and required fields
- Validates wallet addresses
- Ensures timestamp integrity

### Privacy Considerations
- User data is isolated by wallet address
- Transaction data is properly scoped
- Implements principle of least privilege

## Usage Examples

### Creating a New User
```typescript
try {
  await firestoreService.createUser({
    wallet: "user-wallet-address",
    smsVerified: false,
    hasProjectTokens: false
  });
} catch (error) {
  if (error instanceof FirestoreError) {
    console.error(`Failed to create user: ${error.message}`);
  }
}
```

### Updating Verification Status
```typescript
try {
  await firestoreService.updateUserVerification(
    "user-wallet-address",
    true
  );
} catch (error) {
  if (error instanceof FirestoreError) {
    console.error(`Failed to update verification: ${error.message}`);
  }
}
```

### Retrieving Transaction History
```typescript
try {
  const history = await firestoreService.getTransactionHistory(
    "user-wallet-address"
  );
  console.log('Transaction history:', history);
} catch (error) {
  if (error instanceof FirestoreError) {
    console.error(`Failed to fetch history: ${error.message}`);
  }
}
```

## Best Practices

### Performance Optimization
- Use appropriate indexes
- Implement query pagination
- Minimize document size
- Cache frequently accessed data

### Data Consistency
- Use transactions for related updates
- Implement proper error recovery
- Maintain data integrity checks
- Version sensitive data

### Monitoring
- Track operation latency
- Monitor error rates
- Implement usage analytics
- Set up alerts for critical issues

## Future Considerations

### Scalability
- Plan for data growth
- Consider sharding strategies
- Implement caching layers
- Optimize query patterns

### Feature Extensions
- Batch operations support
- Real-time updates
- Offline capabilities
- Data export/import

### Integration Points
- Authentication service integration
- Analytics integration
- Backup solutions
- Monitoring tools