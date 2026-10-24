import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  X,
  ExternalLink,
  Code2,
  ChevronRight,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS } from '../data/curriculum';
import { getResourcesForTopic } from '../data/resources';
import type { Skill } from '../types';

export default function Roadmap() {
  const { state, markSkillComplete, markSkillKnown, switchTrack } = useApp();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { roadmap, profile } = state;
  const track = profile.selectedTrack ?? 'fullstack';
  const trackData = TRACKS.find(t => t.id === track)!;

  const completedTaskIds = new Set(Object.keys(roadmap.taskCompletions));
  const completedSkillIds = new Set(
    Object.entries(roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const knownSkillIds = new Set(profile.answers?.existingSkills ?? []);

  function getSkillStatus(skill: Skill): 'locked' | 'available' | 'in-progress' | 'completed' | 'skippable' {
    if (completedSkillIds.has(skill.id)) return 'completed';
    if (knownSkillIds.has(skill.id)) return 'skippable';
    const prereqsMet = skill.prerequisites.every(
      p => completedSkillIds.has(p) || knownSkillIds.has(p)
    );
    if (!prereqsMet) return 'locked';
    const hasStarted = skill.tasks.some(t => completedTaskIds.has(t.id));
    return hasStarted ? 'in-progress' : 'available';
  }

  const overallProgress = Math.round((completedSkillIds.size / trackData.skills.length) * 100);
  const totalEstimatedHours = trackData.skills.reduce((acc, s) => acc + s.estimatedHours, 0);

  // Group skills into 3 curriculum modules
  const modules = [
    {
      id: 'module-1',
      number: '01',
      title: 'Foundations & Core Primitives',
      description: 'Essential syntax, mental models, environment setup and fundamentals.',
      skills: trackData.skills.slice(0, 4),
    },
    {
      id: 'module-2',
      number: '02',
      title: 'Intermediate Patterns & Architecture',
      description: 'Data structures, asynchronous APIs, component workflows and problem-solving.',
      skills: trackData.skills.slice(4, 8),
    },
    {
      id: 'module-3',
      number: '03',
      title: 'Production Systems & Capstone Mastery',
      description: 'Advanced patterns, persistent storage, optimization, testing and showcase deployment.',
      skills: trackData.skills.slice(8, 12),
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              {trackData.name} Curriculum
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Structured prerequisite sequence • {trackData.skills.length} topics • ~{totalEstimatedHours} hours total
            </p>
          </div>

          {/* Track Switcher */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['fullstack', 'dsa', 'ai'] as const).map(t => {
              const active = track === t;
              return (
                <button
                  key={t}
                  onClick={() => switchTrack(t)}
                  className={`btn btn-sm ${active ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{
                    fontWeight: active ? 600 : 500,
                    border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                  }}
                >
                  {t === 'fullstack' ? 'Full Stack' : t === 'dsa' ? 'DSA' : 'AI / ML'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress & Legend Bar */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Curriculum Progress: {overallProgress}%
            </span>
            <div className="progress-bar" style={{ width: 140, height: 5 }}>
              <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ({completedSkillIds.size} of {trackData.skills.length} completed)
            </span>
          </div>

          {/* Status Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)' }} /> Completed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} /> Available
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--border-strong)' }} /> Locked
            </span>
          </div>
        </div>
      </div>

      {/* Curriculum Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {modules.map(mod => {
          const modCompleted = mod.skills.filter(s => completedSkillIds.has(s.id)).length;
          return (
            <div
              key={mod.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Module Header */}
              <div
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Module {mod.number}
                    </span>
                    <span style={{ color: 'var(--border-strong)' }}>•</span>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {mod.title}
                    </h2>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {mod.description}
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                  {modCompleted} of {mod.skills.length} completed
                </div>
              </div>

              {/* Module Topics List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {mod.skills.map((skill, idx) => {
                  const status = getSkillStatus(skill);
                  const isLocked = status === 'locked';
                  const isDone = status === 'completed';
                  const isCurrent = status === 'available' || status === 'in-progress';
                  const tasksDone = skill.tasks.filter(t => completedTaskIds.has(t.id)).length;

                  // Prerequisite names
                  const prereqSkills = skill.prerequisites
                    .map(pid => trackData.skills.find(s => s.id === pid)?.title)
                    .filter(Boolean);

                  return (
                    <div
                      key={skill.id}
                      style={{
                        padding: '14px 18px',
                        borderBottom: idx === mod.skills.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrent ? 'var(--bg-surface)' : isDone ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                        opacity: isLocked ? 0.65 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isLocked) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-surface-hover)';
                      }}
                      onMouseLeave={e => {
                        if (!isLocked) (e.currentTarget as HTMLElement).style.backgroundColor = isCurrent ? 'var(--bg-surface)' : isDone ? 'var(--bg-surface)' : 'var(--bg-subtle)';
                      }}
                    >
                      {/* Left Details */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 280 }}>
                        {/* Status Icon */}
                        <div style={{ marginTop: 2 }}>
                          {isDone ? (
                            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                          ) : isCurrent ? (
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: '2px solid var(--accent-primary)',
                              backgroundColor: status === 'in-progress' ? 'var(--accent-subtle)' : 'transparent',
                            }} />
                          ) : (
                            <Lock size={16} style={{ color: 'var(--text-tertiary)' }} />
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                              {skill.title}
                            </span>
                            <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 6px' }}>
                              <Clock size={10} /> {skill.estimatedHours}h
                            </span>
                            <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 6px' }}>
                              {tasksDone}/{skill.tasks.length} tasks
                            </span>
                            {isDone && (
                              <span className="badge badge-green" style={{ fontSize: 10, padding: '1px 6px' }}>
                                Completed
                              </span>
                            )}
                            {status === 'skippable' && (
                              <span className="badge badge-amber" style={{ fontSize: 10, padding: '1px 6px' }}>
                                Known / Skipped
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {skill.description}
                          </div>

                          {prereqSkills.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                              Prerequisites: {prereqSkills.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => setSelectedSkill(skill)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12 }}
                        >
                          <BookOpen size={12} /> Resources & Guides
                        </button>

                        {isCurrent && skill.tasks[0] && (
                          <Link
                            to={`/task/${skill.tasks[0].id}`}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 12 }}
                          >
                            Start Lesson <ChevronRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal / Drawer */}
      {selectedSkill && (
        <SkillPanel
          skill={selectedSkill}
          status={getSkillStatus(selectedSkill)}
          completedTaskIds={completedTaskIds}
          onClose={() => setSelectedSkill(null)}
          onMarkComplete={() => {
            markSkillComplete(selectedSkill.id);
            setSelectedSkill(null);
          }}
          onMarkKnown={() => {
            markSkillKnown(selectedSkill.id);
            setSelectedSkill(null);
          }}
        />
      )}
    </div>
  );
}

function SkillPanel({
  skill,
  status,
  completedTaskIds,
  onClose,
  onMarkComplete,
  onMarkKnown,
}: {
  skill: Skill;
  status: string;
  completedTaskIds: Set<string>;
  onClose: () => void;
  onMarkComplete: () => void;
  onMarkKnown: () => void;
}) {
  const allTasksDone = skill.tasks.every(t => completedTaskIds.has(t.id));
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifiedAnswer, setVerifiedAnswer] = useState(false);
  const curatedResources = getResourcesForTopic(skill.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Curriculum Topic
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              {skill.title}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
              {skill.description}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          <span className="badge badge-muted">
            <Clock size={11} /> {skill.estimatedHours} hours estimated
          </span>
          <span className="badge badge-muted">
            {skill.tasks.length} practical tasks
          </span>
          {status === 'completed' ? (
            <span className="badge badge-green">Completed</span>
          ) : status === 'in-progress' ? (
            <span className="badge badge-blue">In Progress</span>
          ) : (
            <span className="badge badge-muted">{status}</span>
          )}
        </div>

        {/* Verification Checkpoint */}
        {showVerifyModal && (
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Knowledge Verification Checkpoint
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
              If you already have practical experience with <strong>{skill.title}</strong>, you can fast-track past this topic to unlock dependent modules.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14 }}>
              <input
                type="checkbox"
                checked={verifiedAnswer}
                onChange={e => setVerifiedAnswer(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                I confirm I have mastered this topic and can build projects using these concepts.
              </span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onMarkKnown}
                disabled={!verifiedAnswer}
                className="btn btn-primary btn-sm"
                style={{ opacity: verifiedAnswer ? 1 : 0.5 }}
              >
                Verify & Unlock (+25 XP)
              </button>
              <button onClick={() => setShowVerifyModal(false)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Curated Resources */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Curated Guides & Practice Sheets
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {curatedResources.map(res => (
              <div
                key={res.id}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-text)' }}>
                        {res.provider}
                      </span>
                      <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 5px' }}>
                        {res.type}
                      </span>
                      <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 5px' }}>
                        {res.estimatedTime}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {res.title}
                    </div>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px' }}
                  >
                    Open Resource <ExternalLink size={11} />
                  </a>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>Gain:</strong> {res.whatYouWillLearn}
                </div>

                {res.practiceUrl && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Code2 size={13} style={{ color: 'var(--accent-primary)' }} />
                      <span>{res.practiceTitle || 'Companion Practice Problem'}</span>
                    </div>
                    <a
                      href={res.practiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: '2px 6px', color: 'var(--accent-primary)' }}
                    >
                      Solve ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Roadmap Lessons ({skill.tasks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {skill.tasks.map(task => {
              const done = completedTaskIds.has(task.id);
              return (
                <Link
                  key={task.id}
                  to={`/task/${task.id}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: done ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                >
                  <div className={`check-circle ${done ? 'done' : 'pending'}`}>
                    {done && <CheckCircle2 size={12} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {task.estimatedMinutes} min • +{task.xpReward} XP
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {status !== 'completed' && (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Verify Prerequisite Knowledge
            </button>
          )}
          {status !== 'completed' && allTasksDone && (
            <button onClick={onMarkComplete} className="btn btn-green btn-sm" style={{ flex: 1 }}>
              Mark Topic Complete
            </button>
          )}
          {skill.tasks[0] && !completedTaskIds.has(skill.tasks[0].id) && (
            <Link to={`/task/${skill.tasks[0].id}`} className="btn btn-primary btn-sm" onClick={onClose} style={{ flex: 1 }}>
              Start First Lesson <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
