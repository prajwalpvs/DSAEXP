import { useState, useEffect } from 'react';
import { STORAGE_KEYS, BADGES_MAP } from '../utils/constants';
import { useLocalStorage } from './useLocalStorage';

export function useGamification() {
  const [xp, setXp] = useLocalStorage(STORAGE_KEYS.USER_XP, 0);
  const [badges, setBadges] = useLocalStorage(STORAGE_KEYS.BADGES, ['novice']);
  const [streakData, setStreakData] = useLocalStorage(STORAGE_KEYS.STREAK, { 
    count: 0, 
    lastActiveDate: null 
  });

  // Calculate current level based on XP (every 100 XP is a level)
  const currentLevel = Math.floor(xp / 100) + 1;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = (xp % 100);

  // Check and evaluate streak
  const evaluateStreak = () => {
    const today = new Date().toDateString();
    
    if (streakData.lastActiveDate === today) {
      return; // Already active today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newCount = streakData.count;
    
    if (streakData.lastActiveDate === yesterday.toDateString()) {
      newCount += 1; // Continued streak
    } else {
      newCount = 1; // Broken streak or first active day
    }

    setStreakData({
      count: newCount,
      lastActiveDate: today
    });
  };

  // Evaluate if new badges were earned
  const evaluateBadges = (newXp) => {
    let newlyEarned = [];
    BADGES_MAP.forEach(badge => {
      if (newXp >= badge.requiredXp && !badges.includes(badge.id)) {
        newlyEarned.push(badge.id);
      }
    });

    if (newlyEarned.length > 0) {
      setBadges(prev => [...prev, ...newlyEarned]);
      return BADGES_MAP.filter(b => newlyEarned.includes(b.id)); // return the newly earned badge objects
    }
    return [];
  };

  // Add XP action
  const addXp = (amount) => {
    evaluateStreak();
    const newXp = xp + amount;
    setXp(newXp);
    return evaluateBadges(newXp); // Returns array of newly unlocked badges if any
  };

  // Derived active badges for display context
  const activeBadgesDetails = BADGES_MAP.filter(b => badges.includes(b.id));

  return {
    xp,
    currentLevel,
    xpProgress,
    xpForNextLevel,
    badges: activeBadgesDetails,
    streak: streakData.count,
    addXp
  };
}
