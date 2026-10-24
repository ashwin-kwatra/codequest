import type { AppState, LearnerContext, TrackId } from '../types';
import { TRACKS } from '../data/curriculum';
import { getPrimaryResourceForTopic } from '../data/resources';

const TRACK_TITLES: Record<TrackId, string> = {
  fullstack: 'Full Stack Development',
  dsa: 'DSA & Coding Interviews',
  ai: 'AI & Machine Learning',
};

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

  let activeTopicId: string | undefined = topicOverrideId;
  let activeTopicTitle: string | undefined;
  let activeTaskTitle: string | undefined;
  let activeTaskObjective: string | undefined;

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

  if (topicOverrideId) {
    const matchedSkill = trackData.skills.find(s => s.id === topicOverrideId);
    if (matchedSkill) {
      activeTopicId = matchedSkill.id;
      activeTopicTitle = matchedSkill.title;
    }
  }

  if (!activeTopicId && gamification.dailyQuest) {
    activeTopicId = gamification.dailyQuest.topicId;
    activeTopicTitle = gamification.dailyQuest.topicTitle;
  }

  if (!activeTopicId) {
    const firstIncomplete = trackData.skills.find(s => !completedSkillIds.has(s.id)) || trackData.skills[0];
    activeTopicId = firstIncomplete.id;
    activeTopicTitle = firstIncomplete.title;
  }

  const primaryResource = activeTopicId ? getPrimaryResourceForTopic(activeTopicId) : null;
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
