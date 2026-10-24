import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Target, BookOpen, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS, ALL_SKILLS_MAP } from '../data/curriculum';
import { calculateTimeline } from '../engine/recommendation';

const TRACK_META = {
  dsa: { label: 'DSA & Coding Interviews', stack: 'C++' },
  fullstack: { label: 'Full Stack Development', stack: 'JavaScript / React / Node' },
  ai: { label: 'AI & Machine Learning', stack: 'Python / Colab' },
};

export default function Recommendation() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { profile } = state;

  if (!profile.onboardingCompleted || !profile.answers || !profile.selectedTrack) {
    navigate('/onboarding');
    return null;
  }

  const track = profile.selectedTrack;
  const meta = TRACK_META[track];
  const trackData = TRACKS.find(t => t.id === track)!;
  const answers = profile.answers;

  const timelineData = calculateTimeline(answers, track);
  const skillsToSkip = answers.existingSkills.filter(s => ALL_SKILLS_MAP[s]);
  const firstSkill = trackData.skills.find(s => !skillsToSkip.includes(s.id));
  const firstTask = firstSkill?.tasks[0];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px 60px',
    }}>
      {/* Top Header */}
      <div style={{ width: '100%', maxWidth: 720, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 5,
            backgroundColor: 'var(--text-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}>
            Q
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>CodeQuest</span>
        </div>
        <Link to="/onboarding" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          ← Re-run Diagnostic
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 720 }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Diagnostic Assessment Complete
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Recommended Career Track: {meta.label}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Based on your technical background, goals, and daily time commitment.
          </p>
        </div>

        {/* Why this track */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            Diagnostic Rationale
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {profile.recommendationReason}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Estimated Duration</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>~{timelineData.estimatedWeeks} weeks</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Starting Level</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {skillsToSkip.length >= 4 ? 'Intermediate' : skillsToSkip.length >= 2 ? 'Novice+' : 'Beginner'}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Topics in Path</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {trackData.skills.length - skillsToSkip.length} of {trackData.skills.length}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Primary Stack</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.stack}</div>
          </div>
        </div>

        {/* Timeline Warning (if unrealistic) */}
        {timelineData.isUnrealistic && (
          <div style={{
            display: 'flex',
            gap: 12,
            padding: 14,
            backgroundColor: 'var(--warning-subtle)',
            border: '1px solid var(--warning-border)',
            borderRadius: 8,
            marginBottom: 16,
            alignItems: 'flex-start',
          }}>
            <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning-text)', marginBottom: 2 }}>
                Pacing Notice: Target Timeline Adjustment Recommended
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Mastering {trackData.skills.length - skillsToSkip.length} topics at {answers.dailyTime}/day realistically requires approximately <strong>{timelineData.estimatedWeeks} weeks</strong>. We recommend pacing yourself sustainably to maintain consistent retention.
              </div>
            </div>
          </div>
        )}

        {/* Skipped Skills Pill List */}
        {skillsToSkip.length > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Skills Fast-Tracked ({skillsToSkip.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skillsToSkip.map(s => (
                <span key={s} style={{
                  fontSize: 12,
                  padding: '3px 8px',
                  borderRadius: 4,
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                  {ALL_SKILLS_MAP[s]?.title || s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* First Lesson Action Card */}
        {firstTask && (
          <div className="card" style={{ padding: 20, marginBottom: 24, border: '1px solid var(--border-strong)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Your First Daily Quest
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {firstTask.title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
              {firstTask.objective}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
                Enter Learning Workspace <ArrowRight size={13} />
              </Link>
              <Link to="/roadmap" className="btn btn-secondary btn-sm">
                View Full Curriculum
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
