import type {
  OnboardingAnswers,
  TrackId,
  RecommendationResult,
  Task,
} from '../types';
import { TRACKS, ALL_SKILLS_MAP } from '../data/curriculum';

// Daily time in hours
const DAILY_HOURS: Record<string, number> = {
  '30min': 0.5,
  '1hr': 1,
  '2hr': 2,
  '3hr+': 3,
};

// Timeline in weeks
const TIMELINE_WEEKS: Record<string, number | null> = {
  '1month': 4,
  '3months': 13,
  '6months': 26,
  'no-deadline': null,
};

/**
 * Recommend a track based on onboarding answers.
 * Returns the recommended TrackId + reason string.
 */
export function recommendTrack(answers: OnboardingAnswers): { track: TrackId; reason: string } {
  // If user explicitly chose a track
  if (answers.trackPreference !== 'recommend') {
    const map: Record<string, TrackId> = { dsa: 'dsa', fullstack: 'fullstack', ai: 'ai' };
    const track = map[answers.trackPreference] ?? 'fullstack';
    return {
      track,
      reason: `You selected this track directly. Great choice — we've built your roadmap around it.`,
    };
  }

  // Score each track
  let dsaScore = 0;
  let fsScore = 0;
  let aiScore = 0;

  // Interest signals
  if (answers.interest === 'interviews') dsaScore += 5;
  if (answers.interest === 'web') fsScore += 5;
  if (answers.interest === 'ai') aiScore += 5;
  if (answers.interest === 'exploring') { dsaScore += 1; fsScore += 2; aiScore += 1; }

  // Existing skill signals
  const skills = answers.existingSkills;
  const dsaSkills = skills.filter(s => s.startsWith('dsa_')).length;
  const fsSkills = skills.filter(s => s.startsWith('fs_')).length;
  const aiSkills = skills.filter(s => s.startsWith('ai_')).length;
  dsaScore += dsaSkills;
  fsScore += fsSkills;
  aiScore += aiSkills;

  // Experience signals
  if (answers.experience === 'none' || answers.experience === 'basics') {
    // Beginners often do best starting with FS (most visual feedback)
    fsScore += 1;
  }
  if (answers.experience === 'small-projects') {
    fsScore += 1;
    aiScore += 0.5;
  }
  if (answers.experience === 'intermediate') {
    dsaScore += 1;
    aiScore += 1;
  }

  // Clarity signals
  if (answers.clarity === 'complete-beginner') fsScore += 1;
  if (answers.clarity === 'know') dsaScore += 0.5;

  const best = Math.max(dsaScore, fsScore, aiScore);

  let track: TrackId;
  let reason: string;

  if (best === dsaScore && dsaScore > 0) {
    track = 'dsa';
    reason = `Based on your interest in coding interviews${dsaSkills > 0 ? ' and your existing DSA knowledge' : ''}, the DSA / Coding Interviews track is your best fit. This path will prepare you for technical interviews at top companies.`;
  } else if (best === aiScore && aiScore >= fsScore) {
    track = 'ai';
    reason = `Your interest in AI and data${aiSkills > 0 ? ', plus your existing Python skills,' : ''} points strongly toward the AI/ML track. You'll build real machine learning models and develop highly sought-after skills.`;
  } else {
    track = 'fullstack';
    reason = `Full Stack Development is the most versatile starting point${fsSkills > 0 ? ', and matches your existing web skills' : ''}. You'll build visible projects quickly, which is great for motivation and your portfolio.`;
  }

  return { track, reason };
}

/**
 * Generate a full recommendation result from onboarding answers.
 */
export function generateRecommendation(answers: OnboardingAnswers): RecommendationResult {
  const { track, reason } = answers.trackPreference !== 'recommend'
    ? { track: answers.trackPreference as TrackId, reason: `You selected this track. We've built your personalized roadmap around it.` }
    : recommendTrack(answers);

  const trackData = TRACKS.find(t => t.id === track)!;
  const skills = trackData.skills;

  // Identify skills to skip
  const existingSkillIds = new Set(answers.existingSkills);
  const skillsToSkip = skills
    .filter(s => existingSkillIds.has(s.id))
    .map(s => s.id);

  // Calculate total estimated hours
  const remainingSkills = skills.filter(s => !skillsToSkip.includes(s.id));
  const totalHours = remainingSkills.reduce((sum, s) => sum + s.estimatedHours, 0);
  const dailyHours = DAILY_HOURS[answers.dailyTime] ?? 1;
  const weeklyHours = dailyHours * 6; // assume 6 days/week
  const estimatedWeeks = Math.ceil(totalHours / weeklyHours);

  // Timeline feasibility check
  const targetWeeks = TIMELINE_WEEKS[answers.timeline];
  let adjustedEstimatedWeeks = estimatedWeeks;
  if (targetWeeks && estimatedWeeks > targetWeeks * 1.5) {
    adjustedEstimatedWeeks = estimatedWeeks; // still show realistic estimate
  }

  // Starting level
  let startingLevel = 'Beginner';
  if (skillsToSkip.length >= 4) startingLevel = 'Intermediate';
  else if (skillsToSkip.length >= 2) startingLevel = 'Beginner-Intermediate';

  // Find first available task
  const firstAvailableSkill = remainingSkills[0];
  const firstTask: Task | null = firstAvailableSkill?.tasks[0] ?? null;

  return {
    track,
    reason,
    startingLevel,
    estimatedWeeks: adjustedEstimatedWeeks,
    skillsToSkip,
    firstTask,
    totalMilestones: skills.length,
  };
}

/**
 * Compute which skills are available given current completions.
 * A skill is available when all its prerequisites are completed.
 */
export function computeAvailableSkills(
  trackId: TrackId,
  completedSkillIds: Set<string>,
  knownSkillIds: Set<string>
): Record<string, 'locked' | 'available' | 'completed' | 'skippable'> {
  const track = TRACKS.find(t => t.id === trackId);
  if (!track) return {};

  const result: Record<string, 'locked' | 'available' | 'completed' | 'skippable'> = {};

  for (const skill of track.skills) {
    if (completedSkillIds.has(skill.id)) {
      result[skill.id] = 'completed';
    } else if (knownSkillIds.has(skill.id)) {
      result[skill.id] = 'skippable';
    } else {
      const prereqsMet = skill.prerequisites.every(
        p => completedSkillIds.has(p) || knownSkillIds.has(p)
      );
      result[skill.id] = prereqsMet ? 'available' : 'locked';
    }
  }

  return result;
}

/**
 * Calculate timeline estimate from user's daily availability.
 */
export function calculateTimeline(
  answers: OnboardingAnswers,
  track: TrackId
): {
  totalHours: number;
  estimatedWeeks: number;
  targetWeeks: number | null;
  isUnrealistic: boolean;
  recommendation: string;
} {
  const trackData = TRACKS.find(t => t.id === track)!;
  const existingSkillIds = new Set(answers.existingSkills);
  const remainingSkills = trackData.skills.filter(s => !existingSkillIds.has(s.id));
  const totalHours = remainingSkills.reduce((sum, s) => sum + s.estimatedHours, 0);

  const dailyHours = DAILY_HOURS[answers.dailyTime] ?? 1;
  const weeklyHours = dailyHours * 6;
  const estimatedWeeks = Math.ceil(totalHours / weeklyHours);
  const targetWeeks = TIMELINE_WEEKS[answers.timeline];
  const isUnrealistic = targetWeeks !== null && estimatedWeeks > targetWeeks * 1.4;

  let recommendation = '';
  if (isUnrealistic && targetWeeks) {
    const achievableSkills = Math.floor((targetWeeks * weeklyHours) / (totalHours / remainingSkills.length));
    recommendation = `At ${answers.dailyTime} per day, completing the full track in ${targetWeeks} weeks is a stretch. Realistically, you'll cover about ${achievableSkills} of ${remainingSkills.length} skills. We'll set a milestone at the ${achievableSkills}-skill mark.`;
  } else if (targetWeeks) {
    recommendation = `At ${answers.dailyTime} per day, you're on track to complete this in ~${estimatedWeeks} weeks — fitting your ${answers.timeline.replace('no-deadline', 'open-ended')} goal!`;
  } else {
    recommendation = `At ${answers.dailyTime} per day, you'll complete this track in approximately ${estimatedWeeks} weeks. Go at your own pace!`;
  }

  return { totalHours, estimatedWeeks, targetWeeks, isUnrealistic, recommendation };
}

/**
 * Get the next recommended task for the user.
 */
export function getNextTask(
  trackId: TrackId,
  completedTaskIds: Set<string>,
  skillProgressMap: Record<string, { status: string }>
): Task | null {
  const track = TRACKS.find(t => t.id === trackId);
  if (!track) return null;

  for (const skill of track.skills) {
    const skillStatus = skillProgressMap[skill.id]?.status;
    if (skillStatus === 'completed') continue;

    for (const task of skill.tasks) {
      if (!completedTaskIds.has(task.id)) {
        return task;
      }
    }
  }

  return null;
}

/**
 * Get skill completion percentage for a track.
 */
export function getTrackProgress(
  trackId: TrackId,
  completedSkillIds: Set<string>
): number {
  const track = TRACKS.find(t => t.id === trackId);
  if (!track) return 0;
  return Math.round((completedSkillIds.size / track.skills.length) * 100);
}
