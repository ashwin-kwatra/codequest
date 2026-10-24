import type {
  AppState,
  UserProfile,
  RoadmapState,
  GamificationState,
  OnboardingAnswers,
  TrackId,
  TaskCompletion,
  SkillProgress,
  SkillStatus,
  AchievementId,
  ProjectProgress,
  DailyQuest,
  QuestHistoryEntry,
} from '../types';
import { generateDailyQuest, getTodayDateString } from '../engine/dailyQuest';

const KEYS = {
  APP_STATE: 'codequest_app_state',
  VERSION: 'codequest_version',
} as const;

const CURRENT_VERSION = '1.0.0';

export function defaultProfile(): UserProfile {
  return {
    name: 'Learner',
    onboardingCompleted: false,
    answers: null,
    recommendedTrack: null,
    selectedTrack: null,
    recommendationReason: '',
    createdAt: new Date().toISOString(),
  };
}

export function defaultRoadmap(): RoadmapState {
  return {
    track: null,
    skillProgress: {},
    taskCompletions: {},
    activeProjectId: null,
    projectProgress: {},
  };
}

export function defaultGamification(): GamificationState {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActivityDate: null,
    unlockedAchievements: [],
    totalTasksCompleted: 0,
    totalChallengesCompleted: 0,
    totalMilestonesCompleted: 0,
    totalQuestsCompleted: 0,
    dailyQuest: null,
    questHistory: {},
  };
}

export function defaultAppState(): AppState {
  return {
    profile: defaultProfile(),
    roadmap: defaultRoadmap(),
    gamification: defaultGamification(),
  };
}

export function calculateUpdatedStreak(
  lastDate: string | null,
  today: string,
  currentStreak: number
): { streak: number; lastDate: string } {
  if (!lastDate) {
    return { streak: 1, lastDate: today };
  }
  if (lastDate === today) {
    return { streak: Math.max(1, currentStreak), lastDate: today };
  }

  let lastTime: number;
  if (lastDate.includes('-')) {
    const [y, m, d] = lastDate.split('-').map(Number);
    lastTime = new Date(y, m - 1, d).getTime();
  } else {
    lastTime = new Date(lastDate).setHours(0, 0, 0, 0);
  }

  const [ty, tm, td] = today.split('-').map(Number);
  const todayTime = new Date(ty, tm - 1, td).getTime();
  const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { streak: currentStreak + 1, lastDate: today };
  } else if (diffDays <= 0) {
    return { streak: Math.max(1, currentStreak), lastDate: today };
  } else {
    // Missed a day or more: streak resets to 1
    return { streak: 1, lastDate: today };
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEYS.APP_STATE);
    let state: AppState;
    if (!raw) {
      state = defaultAppState();
    } else {
      const parsed = JSON.parse(raw) as AppState;
      state = {
        profile: { ...defaultProfile(), ...parsed.profile },
        roadmap: { ...defaultRoadmap(), ...parsed.roadmap },
        gamification: { ...defaultGamification(), ...parsed.gamification },
      };
    }

    // Auto-initialize or refresh daily quest if onboarded
    if (state.profile.onboardingCompleted && state.profile.selectedTrack) {
      const todayStr = getTodayDateString();
      const completedSkillIds = new Set(
        Object.entries(state.roadmap.skillProgress)
          .filter(([, v]) => v.status === 'completed')
          .map(([k]) => k)
      );
      const knownSkillIds = new Set(state.profile.answers?.existingSkills ?? []);

      if (!state.gamification.dailyQuest || state.gamification.dailyQuest.trackId !== state.profile.selectedTrack) {
        state.gamification.dailyQuest = generateDailyQuest(
          state.profile.selectedTrack,
          completedSkillIds,
          knownSkillIds,
          state.gamification.dailyQuest,
          state.profile.answers?.dailyTime || '1hr'
        );
      } else if (state.gamification.dailyQuest.date !== todayStr) {
        // New calendar date rollover
        const oldQuest = state.gamification.dailyQuest;
        if (!state.gamification.questHistory[oldQuest.date]) {
          state.gamification.questHistory[oldQuest.date] = {
            date: oldQuest.date,
            questId: oldQuest.id,
            topicTitle: oldQuest.topicTitle,
            trackId: oldQuest.trackId,
            completed: oldQuest.isCompleted,
            xpEarned: oldQuest.isCompleted ? oldQuest.xpReward : 0,
          };
        }
        state.gamification.dailyQuest = generateDailyQuest(
          state.profile.selectedTrack,
          completedSkillIds,
          knownSkillIds,
          null,
          state.profile.answers?.dailyTime || '1hr'
        );
      }
    }

    return state;
  } catch {
    return defaultAppState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEYS.APP_STATE, JSON.stringify(state));
    localStorage.setItem(KEYS.VERSION, CURRENT_VERSION);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function resetState(): AppState {
  localStorage.removeItem(KEYS.APP_STATE);
  return defaultAppState();
}

export function saveProfile(profile: UserProfile): void {
  const state = loadState();
  saveState({ ...state, profile });
}

export function completeOnboarding(answers: OnboardingAnswers, track: TrackId, reason: string): AppState {
  const state = loadState();
  const updatedProfile: UserProfile = {
    ...state.profile,
    onboardingCompleted: true,
    answers,
    recommendedTrack: track,
    selectedTrack: track,
    recommendationReason: reason,
  };
  const updatedRoadmap: RoadmapState = {
    ...state.roadmap,
    track,
  };

  const completedSkillIds = new Set(
    Object.entries(state.roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const knownSkillIds = new Set(answers.existingSkills ?? []);

  const quest = generateDailyQuest(
    track,
    completedSkillIds,
    knownSkillIds,
    null,
    answers.dailyTime
  );

  const newState = {
    ...state,
    profile: updatedProfile,
    roadmap: updatedRoadmap,
    gamification: {
      ...state.gamification,
      dailyQuest: quest,
    },
  };
  saveState(newState);
  return newState;
}

export function changeTrack(track: TrackId): AppState {
  const state = loadState();
  const completedSkillIds = new Set(
    Object.entries(state.roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const knownSkillIds = new Set(state.profile.answers?.existingSkills ?? []);

  const quest = generateDailyQuest(
    track,
    completedSkillIds,
    knownSkillIds,
    null,
    state.profile.answers?.dailyTime || '1hr'
  );

  const newState: AppState = {
    ...state,
    profile: { ...state.profile, selectedTrack: track },
    roadmap: {
      ...state.roadmap,
      track,
    },
    gamification: {
      ...state.gamification,
      dailyQuest: quest,
    },
  };
  saveState(newState);
  return newState;
}

export function markSkillAsKnown(skillId: string): AppState {
  const state = loadState();
  const existing = state.profile.answers?.existingSkills ?? [];
  const updatedExisting = existing.includes(skillId) ? existing : [...existing, skillId];
  const newState: AppState = {
    ...state,
    profile: {
      ...state.profile,
      answers: state.profile.answers ? {
        ...state.profile.answers,
        existingSkills: updatedExisting,
      } : {
        clarity: 'some-skills',
        interest: 'web',
        experience: 'small-projects',
        existingSkills: [skillId],
        dailyTime: '1hr',
        timeline: '3months',
        trackPreference: 'recommend',
      },
    },
    roadmap: {
      ...state.roadmap,
      skillProgress: {
        ...state.roadmap.skillProgress,
        [skillId]: {
          skillId,
          status: 'completed',
          completedAt: new Date().toISOString(),
        },
      },
    },
  };
  saveState(newState);
  return newState;
}

export function loadSampleProfile(persona: 'beginner' | 'directionless' | 'goal_driven' = 'directionless'): AppState {
  const now = new Date().toISOString();
  const todayStr = getTodayDateString();

  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (persona === 'beginner') {
    const quest = generateDailyQuest('fullstack', new Set(), new Set(), null, '1hr');
    const state: AppState = {
      profile: {
        name: 'Alex (Lost Beginner)',
        onboardingCompleted: true,
        answers: {
          clarity: 'complete-beginner',
          interest: 'web',
          experience: 'none',
          existingSkills: [],
          dailyTime: '1hr',
          timeline: '3months',
          trackPreference: 'recommend',
        },
        recommendedTrack: 'fullstack',
        selectedTrack: 'fullstack',
        recommendationReason: 'As a complete beginner interested in building web apps, Full Stack Development gives you immediate visual feedback and the fastest path to building tangible portfolio projects.',
        createdAt: now,
      },
      roadmap: {
        track: 'fullstack',
        skillProgress: {},
        taskCompletions: {},
        activeProjectId: 'fs_portfolio',
        projectProgress: {
          fs_portfolio: {
            projectId: 'fs_portfolio',
            selectedAt: now,
            completedMilestones: [],
          },
        },
      },
      gamification: {
        xp: 0,
        level: 1,
        streak: 0,
        lastActivityDate: null,
        unlockedAchievements: [],
        totalTasksCompleted: 0,
        totalChallengesCompleted: 0,
        totalMilestonesCompleted: 0,
        totalQuestsCompleted: 0,
        dailyQuest: quest,
        questHistory: {},
      },
    };
    saveState(state);
    return state;
  }

  if (persona === 'goal_driven') {
    const rawQuest = generateDailyQuest(
      'dsa',
      new Set(['dsa_fundamentals', 'dsa_complexity']),
      new Set(['dsa_fundamentals', 'dsa_complexity']),
      null,
      '2hr'
    );
    // 2 of 3 steps completed
    const seededSteps = rawQuest.steps.map((s, idx) => ({
      ...s,
      isCompleted: idx < 2,
    }));
    const quest: DailyQuest = {
      ...rawQuest,
      steps: seededSteps,
      isCompleted: false,
    };

    const d1 = getPastDateStr(3);
    const d2 = getPastDateStr(2);
    const d3 = getPastDateStr(1);

    const state: AppState = {
      profile: {
        name: 'Taylor (FAANG Candidate)',
        onboardingCompleted: true,
        answers: {
          clarity: 'know',
          interest: 'interviews',
          experience: 'intermediate',
          existingSkills: ['dsa_fundamentals', 'dsa_complexity'],
          dailyTime: '2hr',
          timeline: '3months',
          trackPreference: 'dsa',
        },
        recommendedTrack: 'dsa',
        selectedTrack: 'dsa',
        recommendationReason: 'You have a targeted goal: technical interview mastery. Your customized C++ DSA roadmap skips basic syntax and focuses directly on algorithmic patterns, trees, and dynamic programming.',
        createdAt: now,
      },
      roadmap: {
        track: 'dsa',
        skillProgress: {
          dsa_fundamentals: { skillId: 'dsa_fundamentals', status: 'completed', completedAt: d1 },
          dsa_complexity: { skillId: 'dsa_complexity', status: 'completed', completedAt: d2 },
          dsa_arrays: { skillId: 'dsa_arrays', status: 'in-progress' },
        },
        taskCompletions: {
          dsa_fundamentals_t1: { taskId: 'dsa_fundamentals_t1', completedAt: d1, xpAwarded: 20 },
          dsa_fundamentals_t2: { taskId: 'dsa_fundamentals_t2', completedAt: d1, xpAwarded: 25 },
          dsa_complexity_t1: { taskId: 'dsa_complexity_t1', completedAt: d2, xpAwarded: 20 },
          dsa_complexity_t2: { taskId: 'dsa_complexity_t2', completedAt: d2, xpAwarded: 25 },
        },
        activeProjectId: 'dsa_tracker',
        projectProgress: {
          dsa_tracker: {
            projectId: 'dsa_tracker',
            selectedAt: d1,
            completedMilestones: ['dsa_tracker_m1'],
          },
        },
      },
      gamification: {
        xp: 320,
        level: 2,
        streak: 4,
        lastActivityDate: todayStr,
        unlockedAchievements: ['first_steps', 'consistency_3', 'builder', 'skill_unlocked'],
        totalTasksCompleted: 4,
        totalChallengesCompleted: 1,
        totalMilestonesCompleted: 1,
        totalQuestsCompleted: 3,
        dailyQuest: quest,
        questHistory: {
          [d1]: { date: d1, questId: 'quest_dsa_fund', topicTitle: 'Programming Fundamentals in C++', trackId: 'dsa', completed: true, xpEarned: 50 },
          [d2]: { date: d2, questId: 'quest_dsa_comp', topicTitle: 'Time & Space Complexity', trackId: 'dsa', completed: true, xpEarned: 50 },
          [d3]: { date: d3, questId: 'quest_dsa_arr_pre', topicTitle: 'C++ STL Vectors', trackId: 'dsa', completed: true, xpEarned: 50 },
        },
      },
    };
    saveState(state);
    return state;
  }

  // Directionless learner default
  const rawQuest = generateDailyQuest(
    'fullstack',
    new Set(['fs_html', 'fs_javascript']),
    new Set(['fs_html', 'fs_javascript']),
    null,
    '1hr'
  );
  // Step 1 completed (In Progress 1/3)
  const seededSteps = rawQuest.steps.map((s, idx) => ({
    ...s,
    isCompleted: idx === 0,
  }));
  const quest: DailyQuest = {
    ...rawQuest,
    steps: seededSteps,
    isCompleted: false,
  };

  const d1 = getPastDateStr(2);
  const d2 = getPastDateStr(1);

  const state: AppState = {
    profile: {
      name: 'Jordan (Directionless Learner)',
      onboardingCompleted: true,
      answers: {
        clarity: 'some-skills',
        interest: 'web',
        experience: 'small-projects',
        existingSkills: ['fs_html', 'fs_javascript'],
        dailyTime: '1hr',
        timeline: '3months',
        trackPreference: 'recommend',
      },
      recommendedTrack: 'fullstack',
      selectedTrack: 'fullstack',
      recommendationReason: 'You have solid HTML and JavaScript foundations. Full Stack development connects your existing skills with backend services, databases, and a portfolio project to give you clear career focus.',
      createdAt: now,
    },
    roadmap: {
      track: 'fullstack',
      skillProgress: {
        fs_html: { skillId: 'fs_html', status: 'completed', completedAt: d1 },
        fs_javascript: { skillId: 'fs_javascript', status: 'completed', completedAt: d2 },
        fs_dom: { skillId: 'fs_dom', status: 'in-progress' },
      },
      taskCompletions: {
        fs_html_t1: { taskId: 'fs_html_t1', completedAt: d1, xpAwarded: 20 },
        fs_html_t2: { taskId: 'fs_html_t2', completedAt: d1, xpAwarded: 25 },
        fs_javascript_t1: { taskId: 'fs_javascript_t1', completedAt: d2, xpAwarded: 25 },
        fs_javascript_t2: { taskId: 'fs_javascript_t2', completedAt: d2, xpAwarded: 30 },
      },
      activeProjectId: 'fs_portfolio',
      projectProgress: {
        fs_portfolio: {
          projectId: 'fs_portfolio',
          selectedAt: d1,
          completedMilestones: ['fs_port_m1'],
        },
      },
    },
    gamification: {
      xp: 295,
      level: 2,
      streak: 3,
      lastActivityDate: todayStr,
      unlockedAchievements: ['first_steps', 'consistency_3', 'builder', 'skill_unlocked'],
      totalTasksCompleted: 4,
      totalChallengesCompleted: 1,
      totalMilestonesCompleted: 1,
      totalQuestsCompleted: 2,
      dailyQuest: quest,
      questHistory: {
        [d1]: { date: d1, questId: 'quest_fs_html', topicTitle: 'Semantic HTML & CSS', trackId: 'fullstack', completed: true, xpEarned: 50 },
        [d2]: { date: d2, questId: 'quest_fs_js', topicTitle: 'JavaScript Fundamentals & Scope', trackId: 'fullstack', completed: true, xpEarned: 50 },
      },
    },
  };
  saveState(state);
  return state;
}

export function updateSkillStatus(skillId: string, status: SkillStatus): AppState {
  const state = loadState();
  const existing = state.roadmap.skillProgress[skillId];
  const updated: SkillProgress = {
    skillId,
    status,
    unlockedAt: existing?.unlockedAt ?? (status === 'available' ? new Date().toISOString() : undefined),
    completedAt: status === 'completed' ? new Date().toISOString() : existing?.completedAt,
  };
  const newState: AppState = {
    ...state,
    roadmap: {
      ...state.roadmap,
      skillProgress: {
        ...state.roadmap.skillProgress,
        [skillId]: updated,
      },
    },
  };
  saveState(newState);
  return newState;
}

export function completeTask(
  taskId: string,
  xpReward: number,
  hasChallenge: boolean
): { state: AppState; newAchievements: AchievementId[]; leveledUp: boolean; xpGained: number } {
  let state = loadState();

  // Idempotency check
  if (state.roadmap.taskCompletions[taskId]) {
    return { state, newAchievements: [], leveledUp: false, xpGained: 0 };
  }

  const now = new Date().toISOString();
  const todayStr = getTodayDateString();

  // Task completion record
  const completion: TaskCompletion = {
    taskId,
    completedAt: now,
    xpAwarded: xpReward,
  };

  // Update streak using calendar calculation
  const { streak: newStreak, lastDate: newLastDate } = calculateUpdatedStreak(
    state.gamification.lastActivityDate,
    todayStr,
    state.gamification.streak
  );

  // XP + level
  const oldXp = state.gamification.xp;
  const newXp = oldXp + xpReward;
  const oldLevel = state.gamification.level;
  const newLevel = xpToLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  // Achievement checks
  const totalTasks = state.gamification.totalTasksCompleted + 1;
  const totalChallenges = state.gamification.totalChallengesCompleted + (hasChallenge ? 1 : 0);
  const unlocked = [...state.gamification.unlockedAchievements];
  const newAchievements: AchievementId[] = [];

  function maybeUnlock(id: AchievementId, condition: boolean) {
    if (condition && !unlocked.includes(id)) {
      unlocked.push(id);
      newAchievements.push(id);
    }
  }

  maybeUnlock('first_steps', totalTasks >= 1);
  maybeUnlock('consistency_3', newStreak >= 3);
  maybeUnlock('consistency_7', newStreak >= 7);
  maybeUnlock('problem_solver', totalChallenges >= 5);
  maybeUnlock('week_warrior', totalTasks >= 10);

  const newState: AppState = {
    ...state,
    roadmap: {
      ...state.roadmap,
      taskCompletions: {
        ...state.roadmap.taskCompletions,
        [taskId]: completion,
      },
    },
    gamification: {
      ...state.gamification,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActivityDate: newLastDate,
      unlockedAchievements: unlocked,
      totalTasksCompleted: totalTasks,
      totalChallengesCompleted: totalChallenges,
    },
  };

  saveState(newState);
  return { state: newState, newAchievements, leveledUp, xpGained: xpReward };
}

export function toggleQuestStep(stepId: string): {
  state: AppState;
  xpGained: number;
  questCompletedNow: boolean;
  newAchievements: AchievementId[];
} {
  const state = loadState();
  const todayStr = getTodayDateString();
  const quest = state.gamification.dailyQuest;

  if (!quest) {
    return { state, xpGained: 0, questCompletedNow: false, newAchievements: [] };
  }

  const stepIndex = quest.steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) {
    return { state, xpGained: 0, questCompletedNow: false, newAchievements: [] };
  }

  const step = quest.steps[stepIndex];
  // If already completed, ignore (idempotent reward)
  if (step.isCompleted) {
    return { state, xpGained: 0, questCompletedNow: false, newAchievements: [] };
  }

  // Mark step complete
  const updatedSteps = [...quest.steps];
  updatedSteps[stepIndex] = { ...step, isCompleted: true };

  const allDone = updatedSteps.every(s => s.isCompleted);
  let xpGained = 15; // 15 XP for individual step completion
  let questCompletedNow = false;

  const now = new Date().toISOString();
  let updatedQuest: DailyQuest = {
    ...quest,
    steps: updatedSteps,
  };

  // Check if quest as a whole is completed now
  if (allDone && !quest.isCompleted) {
    questCompletedNow = true;
    xpGained += quest.xpReward; // e.g. +50 XP bonus for full quest completion
    updatedQuest = {
      ...updatedQuest,
      isCompleted: true,
      completedAt: now,
    };
  }

  // Update streak using calendar calculation
  const { streak: newStreak, lastDate: newLastDate } = calculateUpdatedStreak(
    state.gamification.lastActivityDate,
    todayStr,
    state.gamification.streak
  );

  const oldXp = state.gamification.xp;
  const newXp = oldXp + xpGained;
  const newLevel = xpToLevel(newXp);
  const totalTasks = state.gamification.totalTasksCompleted + 1;
  const totalQuests = state.gamification.totalQuestsCompleted + (questCompletedNow ? 1 : 0);

  // Update quest history entry
  const updatedHistory = {
    ...state.gamification.questHistory,
    [todayStr]: {
      date: todayStr,
      questId: updatedQuest.id,
      topicTitle: updatedQuest.topicTitle,
      trackId: updatedQuest.trackId,
      completed: updatedQuest.isCompleted,
      xpEarned: (state.gamification.questHistory[todayStr]?.xpEarned || 0) + xpGained,
    },
  };

  // If quest completed, also mark the corresponding topic/task completed in the roadmap so both stay in sync!
  const updatedSkillProgress = { ...state.roadmap.skillProgress };
  if (questCompletedNow) {
    updatedSkillProgress[updatedQuest.topicId] = {
      skillId: updatedQuest.topicId,
      status: 'completed',
      completedAt: now,
    };
  }

  // Achievements
  const unlocked = [...state.gamification.unlockedAchievements];
  const newAchievements: AchievementId[] = [];
  function maybeUnlock(id: AchievementId, condition: boolean) {
    if (condition && !unlocked.includes(id)) {
      unlocked.push(id);
      newAchievements.push(id);
    }
  }

  maybeUnlock('first_steps', totalTasks >= 1 || totalQuests >= 1);
  maybeUnlock('consistency_3', newStreak >= 3);
  maybeUnlock('consistency_7', newStreak >= 7);
  if (questCompletedNow) {
    maybeUnlock('problem_solver', totalQuests >= 3);
    maybeUnlock('skill_unlocked', true);
  }

  const newState: AppState = {
    ...state,
    roadmap: {
      ...state.roadmap,
      skillProgress: updatedSkillProgress,
    },
    gamification: {
      ...state.gamification,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActivityDate: newLastDate,
      unlockedAchievements: unlocked,
      totalTasksCompleted: totalTasks,
      totalQuestsCompleted: totalQuests,
      dailyQuest: updatedQuest,
      questHistory: updatedHistory,
    },
  };

  saveState(newState);
  return { state: newState, xpGained, questCompletedNow, newAchievements };
}

export function advanceToNextQuest(): AppState {
  const state = loadState();
  const track = state.profile.selectedTrack || 'fullstack';
  const completedSkillIds = new Set(
    Object.entries(state.roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const knownSkillIds = new Set(state.profile.answers?.existingSkills ?? []);

  const newQuest = generateDailyQuest(
    track,
    completedSkillIds,
    knownSkillIds,
    null,
    state.profile.answers?.dailyTime || '1hr'
  );

  const newState: AppState = {
    ...state,
    gamification: {
      ...state.gamification,
      dailyQuest: newQuest,
    },
  };
  saveState(newState);
  return newState;
}

export function selectProject(projectId: string): AppState {
  const state = loadState();
  if (!state.roadmap.projectProgress[projectId]) {
    const newProgress: ProjectProgress = {
      projectId,
      selectedAt: new Date().toISOString(),
      completedMilestones: [],
    };
    const newState: AppState = {
      ...state,
      roadmap: {
        ...state.roadmap,
        activeProjectId: projectId,
        projectProgress: {
          ...state.roadmap.projectProgress,
          [projectId]: newProgress,
        },
      },
    };
    saveState(newState);
    return newState;
  } else {
    const newState = { ...state, roadmap: { ...state.roadmap, activeProjectId: projectId } };
    saveState(newState);
    return newState;
  }
}

export function completeMilestone(
  projectId: string,
  milestoneId: string,
  xpReward: number
): { state: AppState; newAchievements: AchievementId[]; leveledUp: boolean } {
  let state = loadState();
  const proj = state.roadmap.projectProgress[projectId];
  if (!proj || proj.completedMilestones.includes(milestoneId)) {
    return { state, newAchievements: [], leveledUp: false };
  }

  const completedMilestones = [...proj.completedMilestones, milestoneId];
  const totalMilestones = state.gamification.totalMilestonesCompleted + 1;
  const newXp = state.gamification.xp + xpReward;
  const oldLevel = state.gamification.level;
  const newLevel = xpToLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  const unlocked = [...state.gamification.unlockedAchievements];
  const newAchievements: AchievementId[] = [];
  function maybeUnlock(id: AchievementId, condition: boolean) {
    if (condition && !unlocked.includes(id)) {
      unlocked.push(id);
      newAchievements.push(id);
    }
  }
  maybeUnlock('builder', totalMilestones >= 1);

  // Check if whole project done
  const newState: AppState = {
    ...state,
    roadmap: {
      ...state.roadmap,
      projectProgress: {
        ...state.roadmap.projectProgress,
        [projectId]: { ...proj, completedMilestones },
      },
    },
    gamification: {
      ...state.gamification,
      xp: newXp,
      level: newLevel,
      unlockedAchievements: unlocked,
      totalMilestonesCompleted: totalMilestones,
    },
  };
  saveState(newState);
  return { state: newState, newAchievements, leveledUp };
}

export function unlockSkillAchievement(skillsCompleted: number): { state: AppState; newAchievements: AchievementId[] } {
  const state = loadState();
  const unlocked = [...state.gamification.unlockedAchievements];
  const newAchievements: AchievementId[] = [];
  function maybeUnlock(id: AchievementId, cond: boolean) {
    if (cond && !unlocked.includes(id)) { unlocked.push(id); newAchievements.push(id); }
  }
  maybeUnlock('skill_unlocked', skillsCompleted >= 1);
  maybeUnlock('speed_learner', skillsCompleted >= 3);
  const newState = { ...state, gamification: { ...state.gamification, unlockedAchievements: unlocked } };
  saveState(newState);
  return { state: newState, newAchievements };
}

export function xpToLevel(xp: number): number {
  let level = 1;
  while (true) {
    const threshold = level * (level - 1) * 75;
    if (xp < threshold) break;
    level++;
    if (level > 50) break;
  }
  return level - 1;
}

export function levelThreshold(level: number): number {
  if (level <= 1) return 0;
  return level * (level - 1) * 75;
}

export function nextLevelThreshold(level: number): number {
  return levelThreshold(level + 1);
}

export function xpProgress(xp: number): { level: number; currentXp: number; neededXp: number; percent: number } {
  const level = xpToLevel(xp);
  const current = levelThreshold(level);
  const next = nextLevelThreshold(level);
  const currentXp = xp - current;
  const neededXp = next - current;
  const percent = Math.min(100, Math.round((currentXp / neededXp) * 100));
  return { level, currentXp, neededXp, percent };
}
