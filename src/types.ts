// ============================================
// CodeQuest — Core Type Definitions
// ============================================

export type TrackId = 'dsa' | 'fullstack' | 'ai';
export type SkillStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'checkpoint';
export type TaskStatus = 'locked' | 'available' | 'completed';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceType = 'documentation' | 'video' | 'interactive' | 'article' | 'practice';

// ---- Curriculum ----

export interface Resource {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: ResourceType;
  duration: string;
}

export interface CuratedResource {
  id: string;
  topicId: string;
  trackId: TrackId;
  title: string;
  provider: string;
  url: string;
  type: 'video' | 'documentation' | 'course' | 'practice' | 'article';
  difficulty: Difficulty;
  estimatedTime: string;
  whatYouWillLearn: string;
  practiceUrl?: string;
  practiceTitle?: string;
  isPrimary?: boolean;
}

export interface DailyQuestStep {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'practice' | 'challenge';
  resourceTitle?: string;
  resourceUrl?: string;
  resourceProvider?: string;
  isCompleted: boolean;
}

export interface DailyQuest {
  id: string;
  date: string;               // YYYY-MM-DD local calendar date
  trackId: TrackId;
  topicId: string;
  topicTitle: string;
  objective: string;
  estimatedMinutes: number;
  xpReward: number;           // e.g. 50 XP
  steps: DailyQuestStep[];
  isCompleted: boolean;
  completedAt?: string;
  keyTakeaway: string;
}

export interface QuestHistoryEntry {
  date: string;               // YYYY-MM-DD
  questId: string;
  topicTitle: string;
  trackId: TrackId;
  completed: boolean;
  xpEarned: number;
}

export interface Task {
  id: string;
  skillId: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  instructions: string[];
  resources: Resource[];
  completionCriteria: string;
  xpReward: number;
  challenge?: string;
}

export interface Skill {
  id: string;
  trackId: TrackId;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[]; // skill IDs
  tasks: Task[];
  primaryResource: Resource;
  practiceResource?: Resource;
  order: number; // position in track
}

export interface Project {
  id: string;
  trackId: TrackId;
  name: string;
  description: string;
  difficulty: Difficulty;
  requiredSkills: string[]; // skill IDs
  optionalSkills: string[];
  estimatedHours: number;
  milestones: ProjectMilestone[];
  suggestedFeatures: string[];
  deliverable: string;
  githubGuidance?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  xpReward: number;
}

export interface Track {
  id: TrackId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  language: string;
  skills: Skill[];
  projects: Project[];
}

// ---- Onboarding ----

export type CareerClarity = 'know' | 'some-skills' | 'complete-beginner';
export type CareerInterest = 'web' | 'interviews' | 'ai' | 'exploring';
export type ExperienceLevel = 'none' | 'basics' | 'small-projects' | 'intermediate';
export type DailyTime = '30min' | '1hr' | '2hr' | '3hr+';
export type Timeline = '1month' | '3months' | '6months' | 'no-deadline';
export type TrackPreference = TrackId | 'recommend';

export interface OnboardingAnswers {
  clarity: CareerClarity;
  interest: CareerInterest;
  experience: ExperienceLevel;
  existingSkills: string[]; // skill IDs
  dailyTime: DailyTime;
  timeline: Timeline;
  trackPreference: TrackPreference;
}

// ---- User Profile ----

export interface UserProfile {
  name: string;
  onboardingCompleted: boolean;
  answers: OnboardingAnswers | null;
  recommendedTrack: TrackId | null;
  selectedTrack: TrackId | null;
  recommendationReason: string;
  createdAt: string;
}

// ---- Progress State ----

export interface SkillProgress {
  skillId: string;
  status: SkillStatus;
  unlockedAt?: string;
  completedAt?: string;
}

export interface TaskCompletion {
  taskId: string;
  completedAt: string;
  xpAwarded: number;
}

export interface ProjectProgress {
  projectId: string;
  selectedAt: string;
  completedMilestones: string[]; // milestone IDs
}

export interface RoadmapState {
  track: TrackId | null;
  skillProgress: Record<string, SkillProgress>;
  taskCompletions: Record<string, TaskCompletion>;
  activeProjectId: string | null;
  projectProgress: Record<string, ProjectProgress>;
}

// ---- Gamification ----

export type AchievementId =
  | 'first_steps'
  | 'consistency_3'
  | 'consistency_7'
  | 'problem_solver'
  | 'builder'
  | 'skill_unlocked'
  | 'ship_it'
  | 'week_warrior'
  | 'speed_learner';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActivityDate: string | null;
  unlockedAchievements: AchievementId[];
  totalTasksCompleted: number;
  totalChallengesCompleted: number;
  totalMilestonesCompleted: number;
  totalQuestsCompleted: number;
  dailyQuest: DailyQuest | null;
  questHistory: Record<string, QuestHistoryEntry>;
}

// ---- App State (root) ----

export interface AppState {
  profile: UserProfile;
  roadmap: RoadmapState;
  gamification: GamificationState;
}

// ---- Recommendation Result ----

export interface RecommendationResult {
  track: TrackId;
  reason: string;
  startingLevel: string;
  estimatedWeeks: number;
  skillsToSkip: string[];
  firstTask: Task | null;
  totalMilestones: number;
}
