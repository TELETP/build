// src/system/services/auth/verification.ts
import { auth } from '@/system/config/firebase';
import { 
  PhoneAuthProvider,
  signInWithCredential,
  ApplicationVerifier
} from 'firebase/auth';
import { firestoreService } from '../firestore';

export interface VerificationStatus {
  isVerified: boolean;
  lastVerified: Date | null;
  attempts: number;
  cooldown?: Date;
}

export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}

class VerificationService {
  // Development test numbers (as configured in Firebase Console)
  private readonly TEST_NUMBERS = new Set([
    '+16505550001',
    '+16505550002',
    '+16505550003'
  ]);

  // Development verification code
  private readonly TEST_CODE = '123456';

  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_MINUTES = 15;

  async sendVerificationCode(
    phoneNumber: string,
    recaptchaVerifier: ApplicationVerifier
  ): Promise<string> {
    try {
      // In development, simulate SMS send for test numbers
      if (process.env.NODE_ENV === 'development' && this.TEST_NUMBERS.has(phoneNumber)) {
        console.log('Development mode: Simulating SMS send');
        return 'test-verification-id';
      }

      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );

      return verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new VerificationError(
        'Failed to send verification code',
        'SEND_CODE_ERROR',
        { phoneNumber }
      );
    }
  }

  async verifyCode(
    verificationId: string,
    code: string,
    wallet: string
  ): Promise<boolean> {
    try {
      // In development, accept test code for test verification ID
      if (
        process.env.NODE_ENV === 'development' && 
        verificationId === 'test-verification-id' &&
        code === this.TEST_CODE
      ) {
        await this.updateVerificationStatus(wallet, true);
        return true;
      }

      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      await this.updateVerificationStatus(wallet, true);
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw new VerificationError(
        'Invalid verification code',
        'INVALID_CODE',
        { verificationId }
      );
    }
  }

  async updateVerificationStatus(
    wallet: string,
    isVerified: boolean
  ): Promise<void> {
    try {
      await firestoreService.updateDoc('verifications', wallet, {
        isVerified,
        lastVerified: isVerified ? new Date() : null,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new VerificationError(
        'Failed to update verification status',
        'UPDATE_STATUS_ERROR',
        { wallet }
      );
    }
  }

  async getVerificationStatus(wallet: string): Promise<VerificationStatus> {
    try {
      const doc = await firestoreService.getDoc('verifications', wallet);
      if (!doc) {
        return {
          isVerified: false,
          lastVerified: null,
          attempts: 0
        };
      }
      return doc as VerificationStatus;
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new VerificationError(
        'Failed to get verification status',
        'GET_STATUS_ERROR',
        { wallet }
      );
    }
  }

  async incrementAttempts(wallet: string): Promise<void> {
    try {
      const status = await this.getVerificationStatus(wallet);
      const attempts = (status.attempts || 0) + 1;
      
      let update: Partial<VerificationStatus> = { attempts };
      
      if (attempts >= this.MAX_ATTEMPTS) {
        update.cooldown = new Date(
          Date.now() + this.COOLDOWN_MINUTES * 60 * 1000
        );
      }

      await firestoreService.updateDoc('verifications', wallet, update);
    } catch (error) {
      console.error('Error incrementing attempts:', error);
      throw new VerificationError(
        'Failed to update verification attempts',
        'INCREMENT_ATTEMPTS_ERROR',
        { wallet }
      );
    }
  }

  isTestNumber(phoneNumber: string): boolean {
    return process.env.NODE_ENV === 'development' && 
           this.TEST_NUMBERS.has(phoneNumber);
  }
}

export const verificationService = new VerificationService();
