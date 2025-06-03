// src/components/ui/display/types.ts
export interface TokenPriceData {
  currentPrice: number;
  priceChange24h: number;
}

export interface ProjectTokenPriceData {
  priceInSOL: number;
  priceInUSD: number;
  stageName: string;
}

export interface BalanceProps {
  className?: string;
  showUsdValue?: boolean;
}
