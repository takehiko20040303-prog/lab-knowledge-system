import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Minute } from '@/types';

/**
 * Repository for minute (議事録) data operations
 * Centralizes all Firestore operations for minutes collection
 */
export class MinuteRepository {
  private collectionName = 'minutes';

  /**
   * Get all minutes for a specific user
   * @param userId - The user's Firebase UID
   * @returns Promise resolving to array of minutes
   */
  async getByUserId(userId: string): Promise<Minute[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Minute[];
  }

  /**
   * Get a single minute by ID
   * @param id - The minute document ID
   * @returns Promise resolving to minute or null if not found
   */
  async getById(id: string): Promise<Minute | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Minute;
  }

  /**
   * Create a new minute
   * @param minute - Minute data (without id)
   * @returns Promise resolving to the created minute's ID
   */
  async create(minute: Omit<Minute, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...minute,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  /**
   * Update an existing minute
   * @param id - The minute document ID
   * @param updates - Partial minute data to update
   * @returns Promise resolving when update is complete
   */
  async update(id: string, updates: Partial<Omit<Minute, 'id'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, updates);
  }

  /**
   * Delete a minute
   * @param id - The minute document ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Get minutes filtered by status
   * @param userId - The user's Firebase UID
   * @param status - The status to filter by
   * @returns Promise resolving to filtered minutes
   */
  async getByStatus(userId: string, status: 'draft' | 'confirmed'): Promise<Minute[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Minute[];
  }

  /**
   * Get minutes filtered by date range
   * @param userId - The user's Firebase UID
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @returns Promise resolving to filtered minutes
   */
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Minute[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Minute[];
  }
}

// Export singleton instance
export const minuteRepository = new MinuteRepository();
