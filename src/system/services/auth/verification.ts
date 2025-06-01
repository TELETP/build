// src/system/services/auth/verification.ts
import { db } from '@/system/config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

interface VerificationStatus {
  wallet: string;
  phoneNumber: string;
  isVerified: boolean;
  lastVerified: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export class VerificationService {
  private readonly COLLECTION = 'verifications';

  async getStatus(wallet: string): Promise<VerificationStatus | null> {
    try {
      const docRef = doc(db, this.COLLECTION, wallet);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as VerificationStatus;
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }

  async createVerification(
    wallet: string, 
    phoneNumber: string
  ): Promise<VerificationStatus> {
    try {
      const timestamp = new Date();
      const verificationData: VerificationStatus = {
        wallet,
        phoneNumber,
        isVerified: false,
        lastVerified: null,
        updatedAt: timestamp,
        createdAt: timestamp
      };

      const docRef = doc(db, this.COLLECTION, wallet);
      await setDoc(docRef, verificationData);

      return verificationData;
    } catch (error) {
      console.error('Error creating verification:', error);
      throw new Error('Failed to create verification');
    }
  }

  async updateVerificationStatus(
    wallet: string, 
    isVerified: boolean
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, wallet);
      await updateDoc(docRef, {
        isVerified,
        lastVerified: isVerified ? new Date() : null,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  async isWalletVerified(wallet: string): Promise<boolean> {
    try {
      const status = await this.getStatus(wallet);
      if (!status) return false;

      // Check if verification is expired (90 days)
      if (status.lastVerified) {
        const lastVerified = new Date(status.lastVerified);
        const now = new Date();
        const daysSinceVerification = 
          (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
        
        return status.isVerified && daysSinceVerification < 90;
      }

      return false;
    } catch (error) {
      console.error('Error checking wallet verification:', error);
      throw new Error('Failed to check wallet verification');
    }
  }
}

export const verificationService = new VerificationService();
