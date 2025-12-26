'use client';

import { useState, useEffect, useCallback } from 'react';
import { minuteRepository } from '@/lib/repositories/minuteRepository';
import type { Minute } from '@/types';

/**
 * Custom hook for managing minutes data
 * @param userId - The current user's Firebase UID
 * @returns Object containing minutes data and CRUD operations
 */
export function useMinutes(userId: string | null) {
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all minutes for the current user
   */
  const fetchMinutes = useCallback(async () => {
    if (!userId) {
      setMinutes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await minuteRepository.getByUserId(userId);
      setMinutes(data);
    } catch (err) {
      console.error('Error fetching minutes:', err);
      setError('議事録の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Create a new minute
   * @param minute - Minute data (without id)
   * @returns Promise resolving to the created minute's ID
   */
  const createMinute = useCallback(async (minute: Omit<Minute, 'id'>) => {
    try {
      setError(null);
      const id = await minuteRepository.create(minute);
      await fetchMinutes(); // Refresh list
      return id;
    } catch (err) {
      console.error('Error creating minute:', err);
      setError('議事録の作成に失敗しました');
      throw err;
    }
  }, [fetchMinutes]);

  /**
   * Update an existing minute
   * @param id - The minute document ID
   * @param updates - Partial minute data to update
   */
  const updateMinute = useCallback(async (id: string, updates: Partial<Omit<Minute, 'id'>>) => {
    try {
      setError(null);
      await minuteRepository.update(id, updates);
      await fetchMinutes(); // Refresh list
    } catch (err) {
      console.error('Error updating minute:', err);
      setError('議事録の更新に失敗しました');
      throw err;
    }
  }, [fetchMinutes]);

  /**
   * Delete a minute
   * @param id - The minute document ID
   */
  const deleteMinute = useCallback(async (id: string) => {
    try {
      setError(null);
      await minuteRepository.delete(id);
      await fetchMinutes(); // Refresh list
    } catch (err) {
      console.error('Error deleting minute:', err);
      setError('議事録の削除に失敗しました');
      throw err;
    }
  }, [fetchMinutes]);

  // Fetch minutes on mount and when userId changes
  useEffect(() => {
    fetchMinutes();
  }, [fetchMinutes]);

  return {
    minutes,
    loading,
    error,
    fetchMinutes,
    createMinute,
    updateMinute,
    deleteMinute,
  };
}
