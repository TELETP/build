// src/system/services/token/service.ts
import { TokenSaleStage, ProjectTokenPrice } from '@/system/types/token';
import { priceService } from '../price/service';

interface TokenPriceErrorDetails {
  originalError?: Error;
  stage?: TokenSaleStage;
  timestamp?: Date;
  context?: {
    [key: string]: string | number | boolean;
  };
}

export class TokenPriceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: TokenPriceErrorDetails
  ) {
    super(message);
    this.name = 'TokenPriceError';
  }
}

export interface StageTransition {
  from: TokenSaleStage | null;
  to: TokenSaleStage;
  timeUntilNext: number | null; // milliseconds until next stage
}

export interface DetailedProjectTokenPrice extends ProjectTokenPrice {
  stageTransition: StageTransition;
  previousPrice?: {
    inSOL: number;
    inUSD: number;
  };
  nextPrice?: {
    inSOL: number;
    inUSD: number;
  };
  priceChange?: {
    fromPrevious: number; // percentage
    toNext: number; // percentage
  };
}

class TokenPriceService {
  private readonly SALE_STAGES: TokenSaleStage[] = [
    {
      id: 'private-sale',
      name: 'Private Sale',
      priceInSOL: 0.1,
      maxTokens: 1000000,
      startDate: new Date('2025-06-01T00:00:00Z'),
      endDate: new Date('2025-06-15T23:59:59Z')
    },
    {
      id: 'pre-sale',
      name: 'Pre-Sale',
      priceInSOL: 0.15,
      maxTokens: 2000000,
      startDate: new Date('2025-06-16T00:00:00Z'),
      endDate: new Date('2025-06-30T23:59:59Z')
    },
    {
      id: 'public-sale',
      name: 'Public Sale',
      priceInSOL: 0.2,
      startDate: new Date('2025-07-01T00:00:00Z')
    }
  ];

  private lastStageId: string | null = null;

  private getStageTransition(currentStage: TokenSaleStage): StageTransition {
    const now = new Date();
    const currentIndex = this.SALE_STAGES.findIndex(stage => stage.id === currentStage.id);
    const previousStage = currentIndex > 0 ? this.SALE_STAGES[currentIndex - 1] : null;
    const nextStage = currentIndex < this.SALE_STAGES.length - 1 ? this.SALE_STAGES[currentIndex + 1] : null;

    let timeUntilNext: number | null = null;
    if (nextStage?.startDate) {
      timeUntilNext = nextStage.startDate.getTime() - now.getTime();
    }

    const hasTransitioned = this.lastStageId && this.lastStageId !== currentStage.id;
    this.lastStageId = currentStage.id;

    return {
      from: hasTransitioned ? previousStage : null,
      to: currentStage,
      timeUntilNext
    };
  }

  private getCurrentStage(): TokenSaleStage {
    const now = new Date();
    
    for (const stage of this.SALE_STAGES) {
      if (stage.startDate && stage.startDate > now) continue;
      if (stage.endDate && stage.endDate < now) continue;
      return stage;
    }

    const lastStage = this.SALE_STAGES[this.SALE_STAGES.length - 1];
    if (!lastStage) {
      throw new TokenPriceError(
        'No sale stages defined',
        'NO_STAGES_DEFINED'
      );
    }

    return lastStage;
  }

  private calculatePriceChanges(
    currentPrice: number,
    previousStage: TokenSaleStage | null,
    nextStage: TokenSaleStage | null
  ) {
    const changes = {
      fromPrevious: 0,
      toNext: 0
    };

    if (previousStage) {
      changes.fromPrevious = ((currentPrice - previousStage.priceInSOL) / previousStage.priceInSOL) * 100;
    }

    if (nextStage) {
      changes.toNext = ((nextStage.priceInSOL - currentPrice) / currentPrice) * 100;
    }

    return changes;
  }

  async getProjectTokenPrice(): Promise<DetailedProjectTokenPrice> {
    try {
      // Get current stage first, outside of other operations
      const currentStage = this.getCurrentStage();
      
      const solPrice = await priceService.getSolanaPrice();
      
      if (!solPrice) {
        throw new TokenPriceError(
          'Failed to fetch SOL price',
          'SOL_PRICE_UNAVAILABLE',
          {
            timestamp: new Date(),
            context: {
              stage: currentStage.id
            }
          }
        );
      }

      const currentIndex = this.SALE_STAGES.findIndex(stage => stage.id === currentStage.id);
      const previousStage = currentIndex > 0 ? this.SALE_STAGES[currentIndex - 1] : null;
      const nextStage = currentIndex < this.SALE_STAGES.length - 1 ? this.SALE_STAGES[currentIndex + 1] : null;

      const priceInUSD = currentStage.priceInSOL * solPrice.price;
      
      const stageTransition = this.getStageTransition(currentStage);

      return {
        priceInSOL: currentStage.priceInSOL,
        priceInUSD,
        currentStage,
        stageTransition,
        previousPrice: previousStage ? {
          inSOL: previousStage.priceInSOL,
          inUSD: previousStage.priceInSOL * solPrice.price
        } : undefined,
        nextPrice: nextStage ? {
          inSOL: nextStage.priceInSOL,
          inUSD: nextStage.priceInSOL * solPrice.price
        } : undefined,
        priceChange: this.calculatePriceChanges(
          currentStage.priceInSOL,
          previousStage,
          nextStage
        )
      };
    } catch (error) {
      if (error instanceof TokenPriceError) {
        throw error;
      }
      throw new TokenPriceError(
        'Failed to calculate project token price',
        'CALCULATION_ERROR',
        {
          originalError: error instanceof Error ? error : new Error(String(error)),
          timestamp: new Date(),
          context: {
            stage: 'unknown'
          }
        }
      );
    }
  }
}

export const tokenPriceService = new TokenPriceService();
