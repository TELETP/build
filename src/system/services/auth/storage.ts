// src/system/services/auth/storage.ts
interface StoredVerification {
    wallet: string;
    isVerified: boolean;
    lastVerified: string;
    expiresAt: string;
  }
  
  export class VerificationStorageService {
    private readonly STORAGE_KEY = 'wallet_verification';
  
    private getStorageKey(wallet: string): string {
      return `${this.STORAGE_KEY}_${wallet}`;
    }
  
    storeVerification(wallet: string): void {
      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
  
        const verification: StoredVerification = {
          wallet,
          isVerified: true,
          lastVerified: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        };
  
        localStorage.setItem(
          this.getStorageKey(wallet),
          JSON.stringify(verification)
        );
      } catch (error) {
        console.error('Error storing verification:', error);
        // Don't throw - local storage is non-critical
      }
    }
  
    getVerification(wallet: string): StoredVerification | null {
      try {
        const stored = localStorage.getItem(this.getStorageKey(wallet));
        if (!stored) return null;
  
        const verification: StoredVerification = JSON.parse(stored);
        const now = new Date();
        const expiresAt = new Date(verification.expiresAt);
  
        // Check if verification is expired
        if (now > expiresAt) {
          this.clearVerification(wallet);
          return null;
        }
  
        return verification;
      } catch (error) {
        console.error('Error getting verification from storage:', error);
        return null;
      }
    }
  
    clearVerification(wallet: string): void {
      try {
        localStorage.removeItem(this.getStorageKey(wallet));
      } catch (error) {
        console.error('Error clearing verification:', error);
      }
    }
  
    isVerified(wallet: string): boolean {
      const verification = this.getVerification(wallet);
      return verification !== null && verification.isVerified;
    }
  }
  
  export const verificationStorageService = new VerificationStorageService();
  