// src/system/types/token.ts

export interface TokenSaleStage {
    id: string;
    name: string;
    priceInSOL: number;
    maxTokens?: number;  // Optional max tokens for this stage
    startDate?: Date;    // Optional start date
    endDate?: Date;      // Optional end date
  }
  
  export interface ProjectTokenPrice {
    priceInSOL: number;
    priceInUSD: number;
    currentStage: TokenSaleStage;
  }
  