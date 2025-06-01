// src/system/services/firestore/index.ts
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
  } from 'firebase/firestore';
  import { db } from '../../config/firebase';
  import { FirestoreUser, FirestoreTransaction } from './types';
  
  export class FirestoreService {
    private usersCollection = collection(db, 'users');
    private transactionsCollection = collection(db, 'transactions');
  
    async getUser(wallet: string): Promise<FirestoreUser | null> {
      const userDoc = await getDoc(doc(this.usersCollection, wallet));
      return userDoc.exists() ? userDoc.data() as FirestoreUser : null;
    }
  
    async createUser(userData: Omit<FirestoreUser, 'id'>): Promise<FirestoreUser> {
      const user: FirestoreUser = {
        id: userData.wallet,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await setDoc(doc(this.usersCollection, user.id), user);
      return user;
    }
  
    async updateUserVerification(
      wallet: string, 
      verified: boolean
    ): Promise<void> {
      await updateDoc(doc(this.usersCollection, wallet), {
        smsVerified: verified,
        lastSmsVerification: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  
  export const firestoreService = new FirestoreService();
  