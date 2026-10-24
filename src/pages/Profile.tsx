import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, Award, Clock, Flame, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS, ACHIEVEMENTS } from '../data/curriculum';
import { xpProgress } from '../store/storage';

const TRACK_META = {
  dsa: { label: 'DSA & Coding Interviews', code: 'C++' },
  fullstack: { label: 'Full Stack Development', code: 'JS / React / Node' },
  ai: { label: 'AI & Machine Learning', code: 'Python / Colab' },
};

export default function Profile() {
  const { state, resetDemo, switchTrack } = useApp();
  const { gamification, roadmap, profile } = state;
  const track = profile.selectedTrack ?? 'fullstack';
  const meta = TRACK_META[track as keyof typeof TRACK_META];
  const trackData = TRACKS.find(t => t.id === track);

  const lvl = xpProgress(gamification.xp);
  const completedSkillIds = new Set(
    Object.entries(roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const completedTaskIds = Object.keys(roadmap.taskCompletions);
  const completedMilestones = Object.values(roadmap.projectProgress)
    .flatMap(p => p.completedMilestones).length;

  const allAchievements = ACHIEVEMENTS;
  const unlockedSet = new Set(gamification.unlockedAchievements);

  // Inferred Persona
  const clarity = profile.answers?.clarity;
  const hasExisting = (profile.answers?.existingSkills.length ?? 0) > 0;
  let personaName = 'Persona A: Foundational Explorer';
  let personaDesc = 'Exploring technology career options and establishing foundational programming concepts from first principles.';
  if (clarity === 'know') {
    personaName = 'Persona C: Goal-Driven Specialist';
    personaDesc = 'Targeting a defined engineering role with an optimized sequence of prerequisites and interview preparation.';
  } else if (clarity === 'some-skills' || hasExisting) {
    personaName = 'Persona B: Directionless Learner';
    personaDesc = 'Leveraging existing knowledge and closing gaps through a structured, portfolio-backed learning trajectory.';
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Learner Profile & Progress Report
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Review competency acquisition, consistency metrics, and track parameters.
        </p>
      </div>

      {/* Top Metric Strip */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Current Track</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {meta.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Stack: {meta.code}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Mastered Topics</div>
          <div className="stat-value" style={{ marginBottom: 2 }}>
            {completedSkillIds.size} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/ {trackData?.skills.length || 12}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {completedTaskIds.length} tasks completed
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Daily Consistency</div>
          <div className="stat-value" style={{ marginBottom: 2 }}>
            {gamification.streak} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>days</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {gamification.totalQuestsCompleted || 0} total daily quests
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Level & Experience</div>
          <div className="stat-value" style={{ marginBottom: 2 }}>
            Lvl {lvl.level}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {gamification.xp} total XP earned
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Persona & Diagnostic Profile */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Inferred Learner Profile
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {personaName}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
              {personaDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, backgroundColor: 'var(--bg-subtle)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Study Commitment:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile.answers?.dailyTime || '1hr'} / day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Deadline:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile.answers?.timeline || '3 months'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Prior Coding Experience:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile.answers?.experience || 'Beginner'}</span>
              </div>
            </div>
          </div>

          {/* Track Switcher */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Curriculum Track Switcher
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Switch to another track without losing your historical consistency records or earned XP.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['fullstack', 'dsa', 'ai'] as const).map(t => {
                const isCurrent = track === t;
                const tMeta = TRACK_META[t];
                return (
                  <button
                    key={t}
                    onClick={() => switchTrack(t)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: `1px solid ${isCurrent ? 'var(--border-strong)' : 'var(--border)'}`,
                      backgroundColor: isCurrent ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {tMeta.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Primary stack: {tMeta.code}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="badge badge-green" style={{ fontSize: 10 }}>Active</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch →</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Data Management */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Data Management
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Reset demo progress to test the onboarding evaluation or load fresh demo states.
            </p>
            <button
              onClick={resetDemo}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              <RotateCcw size={12} /> Reset Demo Data & Local Storage
            </button>
          </div>
        </div>

        {/* Right Column: Achievements & Skills Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Milestone Badges */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Milestone Records
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {unlockedSet.size} of {allAchievements.length} unlocked
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {allAchievements.map(ach => {
                const unlocked = unlockedSet.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      border: `1px solid ${unlocked ? 'var(--border-strong)' : 'var(--border)'}`,
                      backgroundColor: unlocked ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                      opacity: unlocked ? 1 : 0.6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Award size={13} style={{ color: unlocked ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {ach.name}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mastered Skills List */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Topic Competencies ({completedSkillIds.size} completed)
            </div>
            {completedSkillIds.size > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.from(completedSkillIds).map(id => {
                  const s = trackData?.skills.find(sk => sk.id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        fontSize: 12,
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                      {s?.title || id}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                No topics marked complete yet. Start your daily quest on the dashboard to build mastery.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
