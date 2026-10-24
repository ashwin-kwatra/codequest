// ============================================================================
// CodeQuest AI — Context Extraction Engine
// Assembles structured learner context from existing application state & routes
// ============================================================================

import type { AppState, LearnerContext, TrackId } from '../types';
import { TRACKS } from '../data/curriculum';
import { getPrimaryResourceForTopic } from '../data/resources';

const TRACK_TITLES: Record<TrackId, string> = {
  fullstack: 'Full Stack Development',
  dsa: 'DSA & Coding Interviews',
  ai: 'AI & Machine Learning',
};

/**
 * Builds a structured, privacy-safe LearnerContext snapshot
 */
export function buildLearnerContext(
  state: AppState,
  currentPath: string,
  topicOverrideId?: string
): LearnerContext {
  const { profile, roadmap, gamification } = state;
  const trackId: TrackId = profile.selectedTrack ?? 'fullstack';
  const trackData = TRACKS.find(t => t.id === trackId) || TRACKS[0];

  const completedSkillIds = new Set(
    Object.entries(roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );

  // 1. Determine active topic
  let activeTopicId: string | undefined = topicOverrideId;
  let activeTopicTitle: string | undefined;
  let activeTaskTitle: string | undefined;
  let activeTaskObjective: string | undefined;

  // Check if we are on a task route: /task/:taskId
  if (currentPath.startsWith('/task/')) {
    const taskId = currentPath.replace('/task/', '').split('?')[0];
    for (const skill of trackData.skills) {
      for (const task of skill.tasks) {
        if (task.id === taskId) {
          activeTopicId = skill.id;
          activeTopicTitle = skill.title;
          activeTaskTitle = task.title;
          activeTaskObjective = task.objective;
          break;
        }
      }
      if (activeTopicId) break;
    }
  }

  // If topic override was provided or not on a specific task
  if (topicOverrideId) {
    const matchedSkill = trackData.skills.find(s => s.id === topicOverrideId);
    if (matchedSkill) {
      activeTopicId = matchedSkill.id;
      activeTopicTitle = matchedSkill.title;
    }
  }

  // Fallback to today's quest topic if on dashboard or undefined
  if (!activeTopicId && gamification.dailyQuest) {
    activeTopicId = gamification.dailyQuest.topicId;
    activeTopicTitle = gamification.dailyQuest.topicTitle;
  }

  // If still undefined, use the first incomplete skill in the track
  if (!activeTopicId) {
    const firstIncomplete = trackData.skills.find(s => !completedSkillIds.has(s.id)) || trackData.skills[0];
    activeTopicId = firstIncomplete.id;
    activeTopicTitle = firstIncomplete.title;
  }

  // 2. Curated learning resource for the active topic
  const primaryResource = activeTopicId ? getPrimaryResourceForTopic(activeTopicId) : null;

  // 3. Active project & milestone
  const activeProject = roadmap.activeProjectId
    ? trackData.projects.find(p => p.id === roadmap.activeProjectId)
    : null;
  const activeMilestone = activeProject?.milestones[0];

  return {
    trackId,
    trackName: TRACK_TITLES[trackId] || 'Full Stack Development',
    topicId: activeTopicId,
    topicTitle: activeTopicTitle,
    taskTitle: activeTaskTitle,
    taskObjective: activeTaskObjective,
    dailyQuestTopic: gamification.dailyQuest?.topicTitle,
    dailyQuestObjective: gamification.dailyQuest?.objective,
    curatedResourceTitle: primaryResource?.title,
    curatedResourceUrl: primaryResource?.url,
    curatedResourceProvider: primaryResource?.provider,
    completedSkillsCount: completedSkillIds.size,
    totalSkillsCount: trackData.skills.length,
    activeProjectName: activeProject?.name,
    activeMilestoneTitle: activeMilestone?.title,
    learnerLevel: gamification.level,
    streakDays: gamification.streak,
    currentPath,
  };
}
