// src/system/services/balance/service.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONFIG } from '@/system/config/solana';
import { priceService } from '../price/service';
import { TokenBalance, BalanceError, BalanceErrorDetails } from './types';

class BalanceService {
  private connection: Connection;
  private readonly TOKEN_DECIMALS = {
    USDC: 6,
    USDT: 6,
    SOL: 9
  };

  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed');
  }

  private async getTokenAccountInfo(
    walletAddress: string,
    tokenMintAddress: string
  ) {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const tokenMintPubkey = new PublicKey(tokenMintAddress);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: tokenMintPubkey }
      );

      return tokenAccounts.value[0]?.account.data.parsed.info || null;
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch token account info',
        'TOKEN_ACCOUNT_ERROR',
        {
          originalError: error,
          walletAddress,
          tokenAddress: tokenMintAddress
        }
      );
    }
  }

  async getSolBalance(walletAddress: string): Promise<TokenBalance> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      const solPrice = await priceService.getSolanaPrice();

      const amount = balance / LAMPORTS_PER_SOL;
      
      return {
        symbol: 'SOL',
        amount,
        usdValue: amount * solPrice.price,
        decimals: this.TOKEN_DECIMALS.SOL
      };
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch SOL balance',
        'SOL_BALANCE_ERROR',
        {
          originalError: error,
          walletAddress
        }
      );
    }
  }

  async getTokenBalance(
    walletAddress: string,
    tokenMintAddress: string,
    symbol: 'USDC' | 'USDT'
  ): Promise<TokenBalance> {
    try {
      const accountInfo = await this.getTokenAccountInfo(walletAddress, tokenMintAddress);
      
      if (!accountInfo) {
        return {
          symbol,
          amount: 0,
          usdValue: 0,
          mintAddress: tokenMintAddress,
          decimals: this.TOKEN_DECIMALS[symbol]
        };
      }

      const amount = Number(accountInfo.tokenAmount.uiAmount);
      
      // USDC and USDT are stable coins, so 1 token = $1
      return {
        symbol,
        amount,
        usdValue: amount,
        mintAddress: tokenMintAddress,
        decimals: this.TOKEN_DECIMALS[symbol]
      };
    } catch (error) {
      throw new BalanceError(
        `Failed to fetch ${symbol} balance`,
        'TOKEN_BALANCE_ERROR',
        {
          originalError: error,
          walletAddress,
          tokenAddress: tokenMintAddress
        }
      );
    }
  }

  async getAllBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const [solBalance, usdcBalance, usdtBalance] = await Promise.all([
        this.getSolBalance(walletAddress),
        this.getTokenBalance(
          walletAddress,
          SOLANA_CONFIG.TOKEN_ADDRESSES.USDC,
          'USDC'
        ),
        this.getTokenBalance(
          walletAddress,
          SOLANA_CONFIG.TOKEN_ADDRESSES.USDT,
          'USDT'
        )
      ]);

      return [solBalance, usdcBalance, usdtBalance];
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch all balances',
        'BALANCE_FETCH_ERROR',
        {
          originalError: error,
          walletAddress
        }
      );
    }
  }

  // Helper method to format balance display
  static formatBalance(balance: number, decimals: number = 4): string {
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }
}

export const balanceService = new BalanceService();
