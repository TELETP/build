// src/system/services/firestore/types.ts
export interface FirestoreUser {
    id: string;
    wallet: string;
    smsVerified: boolean;
    lastSmsVerification: Date;
    hasProjectTokens: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface FirestoreTransaction {
    id: string;
    userId: string;
    wallet: string;
    amount: number;
    tokenSymbol: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
  }
  