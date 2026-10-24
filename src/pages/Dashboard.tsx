import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Code2,
  Calendar,
  Layers,
  ChevronRight,
  FolderGit2,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS, ACHIEVEMENTS } from '../data/curriculum';
import { xpProgress } from '../store/storage';
import { getNextTask } from '../engine/recommendation';
import { getPrimaryResourceForTopic } from '../data/resources';

const TRACK_META = {
  dsa: { label: 'DSA & Interviews', code: 'C++' },
  fullstack: { label: 'Full Stack Development', code: 'JS/React/Node' },
  ai: { label: 'AI & Machine Learning', code: 'Python/Colab' },
};

export default function Dashboard() {
  const { state, toggleQuestStepAction, startNextQuestEarlyAction } = useApp();
  const navigate = useNavigate();
  const { gamification, roadmap, profile } = state;
  const track = profile.selectedTrack ?? 'fullstack';
  const meta = TRACK_META[track];
  const trackData = TRACKS.find(t => t.id === track)!;

  const lvl = xpProgress(gamification.xp);
  const completedTaskIds = new Set(Object.keys(roadmap.taskCompletions));
  const completedSkillIds = new Set(
    Object.entries(roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );

  const nextTask = getNextTask(track, completedTaskIds, roadmap.skillProgress);
  const overallProgress = Math.round((completedSkillIds.size / trackData.skills.length) * 100);

  // Daily quest information
  const dailyQuest = gamification.dailyQuest;
  const primaryResource = dailyQuest ? getPrimaryResourceForTopic(dailyQuest.topicId) : null;
  const completedStepsCount = dailyQuest ? dailyQuest.steps.filter(s => s.isCompleted).length : 0;
  const totalStepsCount = dailyQuest ? dailyQuest.steps.length : 3;
  const questPercent = Math.round((completedStepsCount / totalStepsCount) * 100);
  const isQuestDone = dailyQuest?.isCompleted ?? false;

  // 7-day weekly activity
  const weekDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = idx === 6;
    const historyEntry = gamification.questHistory?.[dateKey];
    const isDone = !!historyEntry?.completed;
    return { dateKey, dayShort, dayNum: d.getDate(), isToday, isDone };
  });
  const completedThisWeek = weekDays.filter(d => d.isDone).length;

  // Upcoming tasks in track
  const upcomingTasks: typeof nextTask[] = [];
  for (const skill of trackData.skills) {
    for (const task of skill.tasks) {
      if (!completedTaskIds.has(task.id)) {
        upcomingTasks.push(task);
        if (upcomingTasks.length >= 3) break;
      }
    }
    if (upcomingTasks.length >= 3) break;
  }

  // Active project
  const activeProject = roadmap.activeProjectId
    ? trackData.projects.find(p => p.id === roadmap.activeProjectId)
    : null;
  const projectProgress = activeProject
    ? roadmap.projectProgress[activeProject.id]
    : null;
  const projectPercent = activeProject
    ? Math.round((projectProgress?.completedMilestones.length ?? 0) / activeProject.milestones.length * 100)
    : 0;

  // Recent achievements
  const recentAchievements = gamification.unlockedAchievements
    .slice(-3)
    .map(id => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Learning Workspace
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Welcome back, {profile.name || 'Learner'}. Continue your structured daily progression in {meta.label}.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/roadmap" className="btn btn-secondary btn-sm">
              View Curriculum
            </Link>
            <Link to="/projects" className="btn btn-secondary btn-sm">
              Portfolio Projects
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY SECTION: TODAY'S LEARNING PLAN (Workspace Anchor)                 */}
      {/* ========================================================================= */}
      {dailyQuest && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: 24,
            border: `1px solid ${isQuestDone ? 'var(--success-border)' : 'var(--border)'}`,
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Today's Learning Plan
                </span>
                <span style={{ color: 'var(--border-strong)' }}>•</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="badge badge-muted">
                  <Clock size={11} /> {dailyQuest.estimatedMinutes} min
                </span>
                <span className="badge badge-muted">
                  +{dailyQuest.xpReward} XP
                </span>
                {isQuestDone ? (
                  <span className="badge badge-green">
                    ✓ Completed Today
                  </span>
                ) : completedStepsCount > 0 ? (
                  <span className="badge badge-blue">
                    In Progress ({completedStepsCount}/3)
                  </span>
                ) : (
                  <span className="badge badge-muted">
                    Ready to Start
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4 }}>
                {dailyQuest.topicTitle}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 800 }}>
                {dailyQuest.objective}
              </p>
            </div>

            {/* Streak & Consistency Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>🔥 {gamification.streak}</span> day streak
              </div>
              <div style={{ width: 1, height: 14, backgroundColor: 'var(--border-strong)' }} />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gamification.totalQuestsCompleted || 0}</span> completed
              </div>
            </div>
          </div>

          {/* Curated Resource Bar */}
          {primaryResource && (
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0,
                }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {primaryResource.provider}
                    </span>
                    <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 5px' }}>
                      {primaryResource.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {primaryResource.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {primaryResource.whatYouWillLearn}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {primaryResource.practiceUrl && (
                  <a
                    href={primaryResource.practiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 12 }}
                  >
                    Practice Problems <ExternalLink size={11} />
                  </a>
                )}
                <a
                  href={primaryResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  Open Guide <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Action Items ({completedStepsCount} of {totalStepsCount})
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {questPercent}% complete
              </div>
            </div>

            {/* Progress line */}
            <div className="progress-bar" style={{ height: 4, marginBottom: 12 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${questPercent}%`,
                  backgroundColor: isQuestDone ? 'var(--success)' : 'var(--accent-primary)',
                }}
              />
            </div>

            {/* Steps list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dailyQuest.steps.map((step, idx) => (
                <div
                  key={step.id}
                  onClick={(e) => toggleQuestStepAction(step.id, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 6,
                    backgroundColor: step.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    border: `1px solid ${step.isCompleted ? 'var(--border)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!step.isCompleted) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!step.isCompleted) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  {/* Clean Checkbox */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: `1.5px solid ${step.isCompleted ? 'var(--success)' : 'var(--border-strong)'}`,
                      backgroundColor: step.isCompleted ? 'var(--success)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#FFFFFF',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {step.isCompleted && <CheckCircle2 size={13} strokeWidth={2.5} />}
                  </div>

                  {/* Step content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                        {idx + 1}.
                      </span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: step.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: step.isCompleted ? 'line-through' : 'none',
                      }}>
                        {step.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, paddingLeft: 16 }}>
                      {step.description}
                    </div>
                  </div>

                  {/* Resource quick launch button */}
                  {step.resourceUrl && (
                    <a
                      href={step.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: '4px 8px', color: 'var(--accent-primary)' }}
                    >
                      Resource <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Row & Completion state */}
          {isQuestDone ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--success-subtle)',
                border: '1px solid var(--success-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success-text)', marginBottom: 2 }}>
                  ✓ Today's learning plan is complete
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong>Key Takeaway:</strong> {dailyQuest.keyTakeaway}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={startNextQuestEarlyAction}
                  className="btn btn-secondary btn-sm"
                >
                  Start Next Topic Early
                </button>
                <Link to="/roadmap" className="btn btn-primary btn-sm">
                  View Roadmap
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Check off items as you study. Marking all 3 items updates your consistency record.
              </div>

              <button
                onClick={(e) => {
                  const firstIncomplete = dailyQuest.steps.find(s => !s.isCompleted);
                  if (firstIncomplete) {
                    toggleQuestStepAction(firstIncomplete.id, e);
                  }
                }}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                {completedStepsCount === 0 ? 'Start Learning' : `Continue Learning (${completedStepsCount}/3)`}
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* 7-Day Consistency Tracker */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span>Weekly Consistency:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {completedThisWeek} of 7 days completed
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {weekDays.map(d => (
                <div
                  key={d.dateKey}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title={`${d.dateKey}: ${d.isDone ? 'Completed' : d.isToday ? 'Today' : 'No activity'}`}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {d.dayShort[0]}
                  </span>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      backgroundColor: d.isDone
                        ? 'var(--success-subtle)'
                        : d.isToday
                        ? 'var(--bg-surface)'
                        : 'var(--bg-subtle)',
                      border: `1px solid ${
                        d.isDone
                          ? 'var(--success-border)'
                          : d.isToday
                          ? 'var(--accent-primary)'
                          : 'var(--border)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      color: d.isDone
                        ? 'var(--success-text)'
                        : d.isToday
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {d.isDone ? '✓' : d.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY SECTION: KEY METRICS STRIP                                     */}
      {/* ========================================================================= */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {/* Level */}
        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Skill Level</div>
          <div className="stat-value" style={{ marginBottom: 8 }}>Level {lvl.level}</div>
          <div className="progress-bar" style={{ height: 4, marginBottom: 6 }}>
            <div className="progress-fill" style={{ width: `${lvl.percent}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {lvl.currentXp} / {lvl.neededXp} XP to next level
          </div>
        </div>

        {/* Total XP */}
        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Total Experience</div>
          <div className="stat-value" style={{ marginBottom: 8 }}>{gamification.xp.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>XP</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
            {gamification.totalTasksCompleted} tasks completed
          </div>
        </div>

        {/* Streak */}
        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Active Streak</div>
          <div className="stat-value" style={{ marginBottom: 8 }}>{gamification.streak} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>days</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
            {gamification.streak === 0 ? 'Complete today to activate' : 'Calendar consecutive days'}
          </div>
        </div>

        {/* Track Completion */}
        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Curriculum Mastery</div>
          <div className="stat-value" style={{ marginBottom: 8 }}>{overallProgress}%</div>
          <div className="progress-bar" style={{ height: 4, marginBottom: 6 }}>
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {completedSkillIds.size} of {trackData.skills.length} topics mastered
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN LOWER LAYOUT                                                     */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Portfolio Project */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Portfolio Project
              </div>
              <Link to="/projects" style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 500 }}>
                Manage projects →
              </Link>
            </div>

            {activeProject ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FolderGit2 size={16} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {activeProject.name}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  {activeProject.description}
                </p>
                <div className="progress-bar" style={{ height: 4, marginBottom: 6 }}>
                  <div className="progress-fill" style={{ width: `${projectPercent}%` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {projectProgress?.completedMilestones.length ?? 0} of {activeProject.milestones.length} milestones finished ({projectPercent}%)
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Apply theoretical concepts by building a guided portfolio project alongside your roadmap.
                </p>
                <Link to="/projects" className="btn btn-secondary btn-sm">
                  Browse Track Projects
                </Link>
              </div>
            )}
          </div>

          {/* Up Next in Curriculum */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Upcoming Lessons
              </div>
              <Link to="/roadmap" style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 500 }}>
                Full sequence ({trackData.skills.length} topics) →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcomingTasks.map(task => {
                if (!task) return null;
                const done = completedTaskIds.has(task.id);
                return (
                  <Link
                    key={task.id}
                    to={`/task/${task.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      backgroundColor: done ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      transition: 'all 0.12s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div className={`check-circle ${done ? 'done' : 'pending'}`}>
                      {done && <CheckCircle2 size={12} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {task.estimatedMinutes} min • +{task.xpReward} XP
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Skill Sequence Preview */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Topic Modules
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trackData.skills.slice(0, 6).map((skill, i) => {
                const completed = completedSkillIds.has(skill.id);
                const isNext = !completed && trackData.skills.slice(0, i).every(s => completedSkillIds.has(s.id));
                return (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '6px 8px',
                      borderRadius: 5,
                      backgroundColor: completed ? 'var(--success-subtle)' : isNext ? 'var(--bg-subtle)' : 'transparent',
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      backgroundColor: completed ? 'var(--success)' : isNext ? 'var(--accent-primary)' : 'var(--bg-muted)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {completed ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize: 12,
                      fontWeight: isNext ? 600 : 500,
                      color: completed ? 'var(--success-text)' : isNext ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>
                      {skill.title}
                    </span>
                  </div>
                );
              })}
              {trackData.skills.length > 6 && (
                <Link to="/roadmap" style={{ fontSize: 12, color: 'var(--accent-primary)', textAlign: 'center', paddingTop: 6, fontWeight: 500 }}>
                  +{trackData.skills.length - 6} more topics in curriculum →
                </Link>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Milestones
              </div>
              <Link to="/profile" style={{ fontSize: 12, color: 'var(--accent-primary)', fontWeight: 500 }}>
                All →
              </Link>
            </div>
            {recentAchievements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAchievements.map(ach => ach && (
                  <div key={ach.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                    }}>
                      <Award size={14} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ach.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {ach.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>
                Complete curriculum items to unlock milestone records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
