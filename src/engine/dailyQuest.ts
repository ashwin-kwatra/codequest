import type { DailyQuest, DailyQuestStep, TrackId, DailyTime } from '../types';
import { TRACKS } from '../data/curriculum';
import { getPrimaryResourceForTopic } from '../data/resources';

const DURATION_MAP: Record<string, number> = {
  '30min': 30,
  '1hr': 45,
  '2hr': 60,
  '3hr+': 75,
};

/**
 * Returns today's local date as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates the daily quest for today based on roadmap progression.
 */
export function generateDailyQuest(
  trackId: TrackId,
  completedSkillIds: Set<string>,
  knownSkillIds: Set<string>,
  existingQuest: DailyQuest | null,
  dailyAvailability: DailyTime = '1hr'
): DailyQuest {
  const todayStr = getTodayDateString();

  // If a quest was already generated today for this track, retain its state and progress!
  if (existingQuest && existingQuest.date === todayStr && existingQuest.trackId === trackId) {
    return existingQuest;
  }

  const track = TRACKS.find(t => t.id === trackId) || TRACKS[0];
  const allKnown = new Set([...completedSkillIds, ...knownSkillIds]);

  // Find the next available topic whose prerequisites are satisfied
  let targetSkill = track.skills.find(s => {
    if (allKnown.has(s.id)) return false;
    const prereqsMet = s.prerequisites.every(p => allKnown.has(p));
    return prereqsMet;
  });

  // If no skill with met prereqs was found (e.g., branched graph), find first uncompleted skill
  if (!targetSkill) {
    targetSkill = track.skills.find(s => !allKnown.has(s.id));
  }

  const estimatedMinutes = DURATION_MAP[dailyAvailability] || 45;

  // Fallback if the user has completed all 12 skills in the track!
  if (!targetSkill) {
    const fallbackSkill = track.skills[track.skills.length - 1];
    const resource = getPrimaryResourceForTopic(fallbackSkill.id);
    return {
      id: `quest_${trackId}_capstone_${todayStr}`,
      date: todayStr,
      trackId,
      topicId: fallbackSkill.id,
      topicTitle: `${track.name}: Track Mastery & Capstone Review`,
      objective: 'Review your complete track roadmap, test algorithmic edge cases, and push your portfolio deliverable.',
      estimatedMinutes: 40,
      xpReward: 50,
      isCompleted: false,
      keyTakeaway: 'Mastery is sustained through regular revision, portfolio iteration, and tackling novel unseen challenges.',
      steps: [
        {
          id: 'step_fallback_1',
          title: 'Review System Architecture & Core Patterns',
          description: 'Reflect on core algorithms, frameworks, and tools acquired across the entire track.',
          type: 'learn',
          resourceTitle: resource?.title || 'Track Curriculum Review',
          resourceUrl: resource?.url || 'https://developer.mozilla.org/',
          resourceProvider: resource?.provider || 'CodeQuest',
          isCompleted: false,
        },
        {
          id: 'step_fallback_2',
          title: 'Implement an Advanced Extension Feature',
          description: 'Add an enhancement or performance optimization to one of your track portfolio projects.',
          type: 'practice',
          resourceTitle: 'Project Sandbox',
          resourceUrl: resource?.practiceUrl || 'https://github.com/',
          resourceProvider: 'GitHub & Local Project',
          isCompleted: false,
        },
        {
          id: 'step_fallback_3',
          title: 'Final Code Quality & Verification Check',
          description: 'Perform a clean code self-audit, write test assertions, and document key learnings.',
          type: 'challenge',
          isCompleted: false,
        },
      ],
    };
  }

  // Regular quest mapped to the learner's next active skill
  const resource = getPrimaryResourceForTopic(targetSkill.id);
  const skillTitle = targetSkill.title;
  const firstTask = targetSkill.tasks[0];

  const steps: DailyQuestStep[] = [
    {
      id: `step_${targetSkill.id}_1`,
      title: `Study Concept: ${skillTitle}`,
      description: resource
        ? `Read the curated guide from ${resource.provider}: ${resource.whatYouWillLearn}`
        : `Study the fundamentals of ${skillTitle}.`,
      type: 'learn',
      resourceTitle: resource?.title || `${skillTitle} Guide`,
      resourceUrl: resource?.url || 'https://developer.mozilla.org/',
      resourceProvider: resource?.provider || 'Curated Resource',
      isCompleted: false,
    },
    {
      id: `step_${targetSkill.id}_2`,
      title: `Hands-On Practice: ${firstTask?.title || 'Apply Concept in Code'}`,
      description: resource?.practiceUrl
        ? `Solve the companion exercise on ${resource.practiceTitle || 'Practice Platform'}.`
        : `Complete the primary exercise: ${firstTask?.objective || 'Write working code implementing the concept'}.`,
      type: 'practice',
      resourceTitle: resource?.practiceTitle || 'Companion Practice Problem',
      resourceUrl: resource?.practiceUrl || resource?.url || 'https://leetcode.com/',
      resourceProvider: resource?.provider || 'Practice Platform',
      isCompleted: false,
    },
    {
      id: `step_${targetSkill.id}_3`,
      title: 'Checkpoint Challenge & Self-Verification',
      description: firstTask?.challenge
        ? `Tackle the challenge: ${firstTask.challenge}`
        : `Verify your solution meets the criteria: ${firstTask?.completionCriteria || 'Code compiles cleanly without errors'}.`,
      type: 'challenge',
      isCompleted: false,
    },
  ];

  return {
    id: `quest_${targetSkill.id}_${todayStr}`,
    date: todayStr,
    trackId,
    topicId: targetSkill.id,
    topicTitle: skillTitle,
    objective: `Master ${skillTitle}: ${targetSkill.description}`,
    estimatedMinutes,
    xpReward: 50,
    isCompleted: false,
    keyTakeaway: resource?.whatYouWillLearn || `Solid understanding of ${skillTitle} and practical implementation skills.`,
    steps,
  };
}
