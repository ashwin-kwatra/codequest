// ============================================
// CodeQuest — App Context (global state)
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, TrackId, AchievementId } from '../types';
import {
  loadState,
  saveState,
  completeOnboarding,
  completeTask,
  completeMilestone,
  selectProject,
  updateSkillStatus,
  resetState,
  unlockSkillAchievement,
  changeTrack,
  markSkillAsKnown,
  loadSampleProfile,
  toggleQuestStep,
  advanceToNextQuest,
} from '../store/storage';
import type { OnboardingAnswers } from '../types';
import { ACHIEVEMENTS } from '../data/curriculum';

interface XpBurst {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface AppContextValue {
  state: AppState;
  // Onboarding
  finishOnboarding: (answers: OnboardingAnswers, track: TrackId, reason: string) => void;
  // Track switching
  switchTrack: (track: TrackId) => void;
  // Daily Quest
  toggleQuestStepAction: (stepId: string, e?: React.MouseEvent) => void;
  startNextQuestEarlyAction: () => void;
  // Tasks
  markTaskComplete: (taskId: string, xpReward: number, hasChallenge: boolean, e?: React.MouseEvent) => void;
  // Skills
  markSkillComplete: (skillId: string) => void;
  markSkillKnown: (skillId: string) => void;
  // Projects
  startProject: (projectId: string) => void;
  completeMilestoneAction: (projectId: string, milestoneId: string, xpReward: number) => void;
  // Reset & Demo modes
  resetDemo: () => void;
  loadDemoPersona: (persona: 'beginner' | 'directionless' | 'goal_driven') => void;
  // XP bursts
  xpBursts: XpBurst[];
  // Toasts
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'achievement' | 'level-up' | 'xp' | 'info';
  title: string;
  message: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [xpBursts, setXpBursts] = useState<XpBurst[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync to storage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showXpBurst = useCallback((_amount: number, _x: number, _y: number) => {
    // Restrained UX: Disable floating arcade XP bursts
    setXpBursts([]);
  }, []);

  const finishOnboarding = useCallback((answers: OnboardingAnswers, track: TrackId, reason: string) => {
    const newState = completeOnboarding(answers, track, reason);
    setState(newState);
    addToast({ type: 'info', title: 'Roadmap Prepared', message: `Your personalized ${track.toUpperCase()} curriculum is ready.` });
  }, [addToast]);

  const markTaskComplete = useCallback((taskId: string, xpReward: number, hasChallenge: boolean, _e?: React.MouseEvent) => {
    const { state: newState, newAchievements, leveledUp, xpGained } = completeTask(taskId, xpReward, hasChallenge);
    if (xpGained === 0) return; // already completed

    setState(newState);

    if (leveledUp) {
      addToast({ type: 'level-up', title: 'Level Progress', message: `You have reached Level ${newState.gamification.level}.` });
    }

    for (const ach of newAchievements) {
      const achData = ACHIEVEMENTS.find(a => a.id === ach);
      if (achData) {
        addToast({ type: 'achievement', title: 'Milestone Achieved', message: achData.name });
      }
    }
  }, [addToast]);

  const markSkillComplete = useCallback((skillId: string) => {
    const newState = updateSkillStatus(skillId, 'completed');
    setState(newState);
    const completedCount = Object.values(newState.roadmap.skillProgress).filter(s => s.status === 'completed').length;
    const { state: achState, newAchievements } = unlockSkillAchievement(completedCount);
    setState(achState);
    for (const ach of newAchievements) {
      const achData = ACHIEVEMENTS.find(a => a.id === ach);
      if (achData) {
        addToast({ type: 'achievement', title: 'Topic Completed', message: achData.name });
      }
    }
  }, [addToast]);

  const startProject = useCallback((projectId: string) => {
    const newState = selectProject(projectId);
    setState(newState);
    addToast({ type: 'info', title: 'Project Active', message: 'The project has been added to your learning plan.' });
  }, [addToast]);

  const completeMilestoneAction = useCallback((projectId: string, milestoneId: string, xpReward: number) => {
    const { state: newState, newAchievements, leveledUp } = completeMilestone(projectId, milestoneId, xpReward);
    setState(newState);
    if (leveledUp) {
      addToast({ type: 'level-up', title: 'Level Progress', message: `You reached Level ${newState.gamification.level}.` });
    }
    for (const ach of newAchievements) {
      const achData = ACHIEVEMENTS.find(a => a.id === ach);
      if (achData) {
        addToast({ type: 'achievement', title: 'Milestone Achieved', message: achData.name });
      }
    }
  }, [addToast]);

  const toggleQuestStepAction = useCallback((stepId: string, _e?: React.MouseEvent) => {
    const { state: newState, questCompletedNow, newAchievements } = toggleQuestStep(stepId);
    setState(newState);

    if (questCompletedNow) {
      addToast({
        type: 'achievement',
        title: 'Daily Plan Complete',
        message: `+${newState.gamification.dailyQuest?.xpReward || 50} XP earned. Consistency streak updated.`,
      });
    }

    for (const ach of newAchievements) {
      const achData = ACHIEVEMENTS.find(a => a.id === ach);
      if (achData) {
        addToast({ type: 'achievement', title: 'Milestone Achieved', message: achData.name });
      }
    }
  }, [addToast]);

  const startNextQuestEarlyAction = useCallback(() => {
    const newState = advanceToNextQuest();
    setState(newState);
    addToast({
      type: 'info',
      title: 'Next Topic Loaded',
      message: `Targeting: ${newState.gamification.dailyQuest?.topicTitle || 'Next topic'}`,
    });
  }, [addToast]);

  const switchTrack = useCallback((track: TrackId) => {
    const newState = changeTrack(track);
    setState(newState);
    addToast({ type: 'info', title: 'Track Switched 🔄', message: `Now viewing ${track.toUpperCase()} roadmap. Your XP and history are preserved!` });
  }, [addToast]);

  const markSkillKnown = useCallback((skillId: string) => {
    const newState = markSkillAsKnown(skillId);
    setState(newState);
    addToast({ type: 'info', title: 'Prerequisite Fast-Tracked ⚡', message: 'Skill marked as verified. Dependent lessons unlocked!' });
  }, [addToast]);

  const loadDemoPersona = useCallback((persona: 'beginner' | 'directionless' | 'goal_driven') => {
    const newState = loadSampleProfile(persona);
    setState(newState);
    addToast({
      type: 'info',
      title: 'Demo Persona Loaded 🎯',
      message: `Active profile: ${newState.profile.name}. Explore dashboard, roadmap & projects!`,
    });
  }, [addToast]);

  const resetDemo = useCallback(() => {
    const fresh = resetState();
    setState(fresh);
    setToasts([]);
    setXpBursts([]);
    addToast({ type: 'info', title: 'Demo Reset', message: 'All progress cleared. Start fresh!' });
  }, [addToast]);

  return (
    <AppContext.Provider value={{
      state,
      finishOnboarding,
      switchTrack,
      toggleQuestStepAction,
      startNextQuestEarlyAction,
      markTaskComplete,
      markSkillComplete,
      markSkillKnown,
      startProject,
      completeMilestoneAction,
      resetDemo,
      loadDemoPersona,
      xpBursts,
      toasts,
      dismissToast,
    }}>
      {children}
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 9999,
      maxWidth: 340,
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className="toast-item"
          style={{
            borderLeft: `3px solid ${
              toast.type === 'achievement'
                ? 'var(--success)'
                : toast.type === 'level-up'
                ? 'var(--accent-primary)'
                : 'var(--border-strong)'
            }`,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
            {toast.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {toast.message}
          </div>
        </div>
      ))}
    </div>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
