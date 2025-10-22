// src/contexts/UserStatsContext.js - KOMPLETNÁ VERZIA

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DataManager from '../utils/DataManager';

const UserStatsContext = createContext();

export const UserStatsProvider = ({ children }) => {
  const [dataManager] = useState(DataManager);
  const [userId, setUserId] = useState(null);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    completedSections: [],
    referrals: 0,
    bonusPoints: 0
  });

  const intervalRef = useRef(null);
  const isLoadingRef = useRef(false);

  const login = useCallback(async (id) => {
    sessionStorage.setItem('participantCode', id);
    setUserId(id);
    const progress = await dataManager.loadUserProgress(id);
    progress.instruction_completed = true;
    progress.current_progress_step = 'intro';
    await dataManager.saveProgress(id, progress);
  }, [dataManager]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('participantCode');
    setUserId(null);
    setUserStats({
      level: 1,
      points: 0,
      completedSections: [],
      referrals: 0,
      bonusPoints: 0
    });
  }, []);

  useEffect(() => {
    const updateUserId = () => {
      const currentId = sessionStorage.getItem('participantCode');

      if (currentId && !['0', '1', '2'].includes(currentId) && currentId !== userId) {
        console.log('📊 UserStats userId zmena:', userId, '->', currentId);
        setUserId(currentId);
      } else if (!currentId && userId) {
        console.log('📊 UserStats userId reset');
        logout();
      }
    };

    updateUserId();
    intervalRef.current = setInterval(updateUserId, 5000);

    window.addEventListener('storage', updateUserId);
    window.addEventListener('focus', updateUserId);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('storage', updateUserId);
      window.removeEventListener('focus', updateUserId);
    };
  }, [userId, logout]);

  const loadUserStats = useCallback(async () => {
    if (!userId || isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      console.log(`📊 Načítavam stats pre: ${userId}`);

      const progress = await dataManager.loadUserProgress(userId);
      if (progress) {
        const updatedStats = {
          level: progress.user_stats_level || 1,
          points: progress.user_stats_points || 0,
          referrals: progress.referrals_count || 0,
          completedSections: Array.isArray(progress.completedSections) ? progress.completedSections : [],
          bonusPoints: (progress.referrals_count || 0) * 50
        };

        setUserStats(updatedStats);
        console.log(`✅ Stats načítané pre ${userId}:`, updatedStats);
      }
    } catch (error) {
      console.error('❌ Chyba pri načítaní stats:', error);
      setUserStats({
        level: 1,
        points: 0,
        completedSections: [],
        referrals: 0,
        bonusPoints: 0
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [userId, dataManager]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === dataManager.centralStorageKey) {
        loadUserStats();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dataManager.centralStorageKey, loadUserStats]);

  useEffect(() => {
    if (!userId || isLoadingRef.current) return;

    loadUserStats();

    const interval = setInterval(() => {
      loadUserStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, loadUserStats]);

  useEffect(() => {
    if (userId && !isLoadingRef.current) {
      loadUserStats();
    }
  }, [loadUserStats, userId]);

  const addPoints = useCallback(async (amount, sectionId) => {
    if (!userId) {
      console.warn('❌ Nie je userId pre pridanie bodov');
      return false;
    }

    console.log(`🎯 Pridávam ${amount} bodov za sekciu: ${sectionId} pre: ${userId}`);

    try {
      const progress = await dataManager.loadUserProgress(userId);

      if (progress.completedSections && progress.completedSections.includes(sectionId)) {
        console.log(`⚠️ Sekcia ${sectionId} už bola dokončená pre ${userId}`);
        return false;
      }

      let newPoints = (progress.user_stats_points || 0) + amount;
      if (newPoints > 100) newPoints = 100;

      const newLevel = Math.min(Math.floor(newPoints / 25) + 1, 5);
      const newCompletedSections = [...(progress.completedSections || []), sectionId];

      const newStats = {
        level: newLevel,
        points: newPoints,
        completedSections: newCompletedSections,
        referrals: progress.referrals_count || 0,
        bonusPoints: (progress.referrals_count || 0) * 50
      };

      const updatedProgress = {
        ...progress,
        user_stats_points: newPoints,
        user_stats_level: newLevel,
        completedSections: newCompletedSections,
        [`${sectionId}_completed`]: true
      };

      await dataManager.saveProgress(userId, updatedProgress);
      setUserStats(newStats);

      console.log(`✅ Nové stats pre ${userId}:`, newStats);
      return true;
    } catch (error) {
      console.error('❌ Chyba pri pridávaní bodov:', error);
      return false;
    }
  }, [userId, dataManager]);

  const refreshUserStats = useCallback(async () => {
    if (userId) {
      await loadUserStats();
    }
  }, [userId, loadUserStats]);

  const clearAllData = useCallback(() => {
    dataManager.clearAllData();
  }, [dataManager]);

  return (
    <UserStatsContext.Provider
      value={{
        userStats,
        addPoints,
        refreshUserStats,
        dataManager,
        userId,
        login,
        logout,
        clearAllData
      }}
    >
      {children}
    </UserStatsContext.Provider>
  );
};

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats musí byť použité v UserStatsProvider');
  }
  return context;
};

export default UserStatsContext;