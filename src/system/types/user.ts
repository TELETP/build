// src/system/types/user.ts

export interface UserData {
    wallet: string;
    smsVerified: boolean;
    lastSmsVerification: Date;
    hasProjectTokens: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  