// src/contexts/UserStatsContext.js
// FINÁLNA VERZIA - Bez aggressive refresh, body sa nebudú resetovať

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DataManager from '../utils/DataManager';

const UserStatsContext = createContext();

export const UserStatsProvider = ({ children }) => {
  const [dataManager] = useState(DataManager);
  const [userId, setUserId] = useState(null);
  const [userStats, setUserStats] = useState({
    level: 1,
    points: 0,
    missionPoints: 0,
    bonusPoints: 0,
    totalPoints: 0,
    completedMissions: [],
    referrals: 0
  });

  const intervalRef = useRef(null);
  const isLoadingRef = useRef(false);
  const lastLoadedUserIdRef = useRef(null);

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
    lastLoadedUserIdRef.current = null;
    setUserStats({
      level: 1,
      points: 0,
      missionPoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
      completedMissions: [],
      referrals: 0
    });
  }, []);

  // ✅ Monitor userId changes
  useEffect(() => {
    const updateUserId = () => {
      const currentId = sessionStorage.getItem('participantCode');

      if (currentId && !['0', '1', '2'].includes(currentId) && currentId !== userId) {
        console.log('📊 UserStats userId change:', userId, '->', currentId);
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

  // ✅ OPRAVENÉ - Load user stats (bez aggressive refresh)
  const loadUserStats = useCallback(async () => {
    if (!userId || isLoadingRef.current) return;

    isLoadingRef.current = true;

    try {
      console.log(`📊 Loading stats for: ${userId}`);

      const progress = await dataManager.loadUserProgress(userId);
      if (progress) {
        const missionPoints = progress.user_stats_mission_points || 0;
        const bonusPoints = (progress.referrals_count || 0) * 10;
        const totalPoints = missionPoints + bonusPoints;
        const level = Math.min(Math.floor(missionPoints / 25) + 1, 5);

        const updatedStats = {
          level,
          points: totalPoints,
          missionPoints,
          bonusPoints,
          totalPoints,
          referrals: progress.referrals_count || 0,
          completedMissions: Array.isArray(progress.completedMissions) ? progress.completedMissions : []
        };

        setUserStats(updatedStats);
        lastLoadedUserIdRef.current = userId;
        console.log(`✅ Stats loaded for ${userId}:`, updatedStats);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    } finally {
      isLoadingRef.current = false;
    }
  }, [userId, dataManager]);

  // ✅ Storage listener - refresh only when localStorage changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === dataManager.centralStorageKey) {
        console.log('📡 Storage changed, refreshing stats');
        loadUserStats();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dataManager.centralStorageKey, loadUserStats]);

  // ✅ OPRAVENÉ - Load only on userId change, NO aggressive interval
  useEffect(() => {
    if (!userId || isLoadingRef.current) return;

    if (lastLoadedUserIdRef.current !== userId) {
      console.log(`🔄 User changed, loading stats for: ${userId}`);
      loadUserStats();
    }

    // ❌ ODSTRÁNENÉ - Aggressive 10s interval
    // const interval = setInterval(() => {
    //   loadUserStats();
    // }, 10000);
    // return () => clearInterval(interval);
  }, [userId, loadUserStats]);

  // ✅ Initial load
  useEffect(() => {
    if (userId && !isLoadingRef.current && lastLoadedUserIdRef.current !== userId) {
      loadUserStats();
    }
  }, [loadUserStats, userId]);

  const addMissionPoints = useCallback(async (missionId) => {
    if (!userId) {
      console.warn('❌ No userId for adding mission points');
      return false;
    }

    console.log(`🎯 Adding 25 points for mission: ${missionId} for: ${userId}`);

    try {
      const progress = await dataManager.loadUserProgress(userId);

      if (progress.completedMissions && progress.completedMissions.includes(missionId)) {
        console.log(`⚠️ Mission ${missionId} already completed for ${userId}`);
        return false;
      }

      const currentMissionPoints = progress.user_stats_mission_points || 0;
      const newMissionPoints = Math.min(currentMissionPoints + 25, 100);
      const newLevel = Math.min(Math.floor(newMissionPoints / 25) + 1, 5);
      const newCompletedMissions = [...(progress.completedMissions || []), missionId];
      const bonusPoints = (progress.referrals_count || 0) * 10;
      const totalPoints = newMissionPoints + bonusPoints;

      const newStats = {
        level: newLevel,
        points: totalPoints,
        missionPoints: newMissionPoints,
        bonusPoints,
        totalPoints,
        completedMissions: newCompletedMissions,
        referrals: progress.referrals_count || 0
      };

      const updatedProgress = {
        ...progress,
        user_stats_mission_points: newMissionPoints,
        user_stats_level: newLevel,
        user_stats_points: totalPoints,
        completedMissions: newCompletedMissions,
        [`${missionId}_completed`]: true
      };

      await dataManager.saveProgress(userId, updatedProgress);
      setUserStats(newStats);

      console.log(`✅ New stats after mission ${missionId} for ${userId}:`, newStats);
      return true;
    } catch (error) {
      console.error('❌ Error adding mission points:', error);
      return false;
    }
  }, [userId, dataManager]);

  const addReferralPoints = useCallback(async () => {
    if (!userId) {
      console.warn('❌ No userId for adding referral points');
      return false;
    }

    console.log(`🎁 Adding 10 points for referral for: ${userId}`);

    try {
      const progress = await dataManager.loadUserProgress(userId);
      const newReferralsCount = (progress.referrals_count || 0) + 1;
      const bonusPoints = newReferralsCount * 10;
      const missionPoints = progress.user_stats_mission_points || 0;
      const totalPoints = missionPoints + bonusPoints;
      const level = Math.min(Math.floor(missionPoints / 25) + 1, 5);

      const newStats = {
        level,
        points: totalPoints,
        missionPoints,
        bonusPoints,
        totalPoints,
        completedMissions: progress.completedMissions || [],
        referrals: newReferralsCount
      };

      const updatedProgress = {
        ...progress,
        referrals_count: newReferralsCount,
        user_stats_points: totalPoints
      };

      await dataManager.saveProgress(userId, updatedProgress);
      setUserStats(newStats);

      console.log(`✅ New stats after referral for ${userId}:`, newStats);
      return true;
    } catch (error) {
      console.error('❌ Error adding referral points:', error);
      return false;
    }
  }, [userId, dataManager]);

  const addPoints = useCallback(async (amount, sectionId) => {
    console.warn('⚠️ addPoints is deprecated - use addMissionPoints or addReferralPoints');
    
    if (sectionId && sectionId.includes('mission')) {
      return await addMissionPoints(sectionId);
    }
    
    return false;
  }, [addMissionPoints]);

  const refreshUserStats = useCallback(async () => {
    if (userId) {
      console.log('🔄 Manual refresh stats for:', userId);
      await loadUserStats();
    }
  }, [userId, loadUserStats]);

  const clearAllData = useCallback(() => {
    dataManager.clearAllData();
    lastLoadedUserIdRef.current = null;
  }, [dataManager]);

  return (
    <UserStatsContext.Provider
      value={{
        userStats,
        addPoints,
        addMissionPoints,
        addReferralPoints,
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
    throw new Error('useUserStats must be used within UserStatsProvider');
  }
  return context;
};

export default UserStatsContext;
