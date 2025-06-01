// src/system/services/balance/service.ts
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SOLANA_CONFIG } from '@/system/config/solana';
import { priceService } from '../price/service';
import { TokenBalance, BalanceError } from './types';

class BalanceService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.RPC_ENDPOINT);
  }

  async getSolBalance(walletAddress: string): Promise<TokenBalance> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      const solPrice = await priceService.getSolanaPrice();

      return {
        symbol: 'SOL',
        amount: balance / LAMPORTS_PER_SOL,
        usdValue: (balance / LAMPORTS_PER_SOL) * solPrice.price
      };
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch SOL balance',
        'SOL_BALANCE_ERROR',
        { originalError: error }
      );
    }
  }

  async getTokenBalance(
    walletAddress: string,
    tokenMintAddress: string
  ): Promise<TokenBalance> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenMint = new PublicKey(tokenMintAddress);

      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        publicKey,
        { mint: tokenMint }
      );

      let balance = 0;

      if (tokenAccounts.value.length > 0) {
        const tokenAccount = tokenAccounts.value[0];
        const accountInfo = await this.connection.getParsedAccountInfo(tokenAccount.pubkey);
        
        if (accountInfo.value && 'parsed' in accountInfo.value.data) {
          balance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount;
        }
      }

      // USDC and USDT are stable at $1
      const usdValue = balance;

      return {
        symbol: tokenMintAddress === SOLANA_CONFIG.TOKEN_ADDRESSES.USDC ? 'USDC' : 'USDT',
        amount: balance,
        usdValue
      };
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch token balance',
        'TOKEN_BALANCE_ERROR',
        { originalError: error }
      );
    }
  }

  async getAllBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const [solBalance, usdcBalance, usdtBalance] = await Promise.all([
        this.getSolBalance(walletAddress),
        this.getTokenBalance(walletAddress, SOLANA_CONFIG.TOKEN_ADDRESSES.USDC),
        this.getTokenBalance(walletAddress, SOLANA_CONFIG.TOKEN_ADDRESSES.USDT)
      ]);

      return [solBalance, usdcBalance, usdtBalance];
    } catch (error) {
      throw new BalanceError(
        'Failed to fetch all balances',
        'BALANCE_FETCH_ERROR',
        { originalError: error }
      );
    }
  }
}

export const balanceService = new BalanceService();
