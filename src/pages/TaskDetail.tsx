import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, ExternalLink, Code2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAiAssistant } from '../context/AiContext';
import { TRACKS } from '../data/curriculum';
import { getResourcesForTopic } from '../data/resources';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const { state, markTaskComplete, markSkillComplete } = useApp();
  const { openPanel } = useAiAssistant();
  const navigate = useNavigate();
  const [challengeExpanded, setChallengeExpanded] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const track = state.profile.selectedTrack ?? 'fullstack';
  const trackData = TRACKS.find(t => t.id === track)!;

  // Find the task
  let foundTask = null;
  let foundSkill = null;
  for (const skill of trackData.skills) {
    for (const task of skill.tasks) {
      if (task.id === taskId) {
        foundTask = task;
        foundSkill = skill;
        break;
      }
    }
    if (foundTask) break;
  }

  if (!foundTask || !foundSkill) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Lesson Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>The requested lesson could not be located in this curriculum.</p>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">Return to Dashboard</Link>
      </div>
    );
  }

  const task = foundTask;
  const skill = foundSkill;
  const isCompleted = !!state.roadmap.taskCompletions[task.id];
  const completedTaskIds = new Set(Object.keys(state.roadmap.taskCompletions));
  const allSkillTasksDone = skill.tasks.every(t => completedTaskIds.has(t.id) || t.id === task.id);
  const curatedResources = getResourcesForTopic(skill.id);

  const handleComplete = (e: React.MouseEvent) => {
    if (!confirmComplete) {
      setConfirmComplete(true);
      return;
    }
    markTaskComplete(task.id, task.xpReward, !!task.challenge, e);
    if (allSkillTasksDone) {
      markSkillComplete(skill.id);
    }
    setTimeout(() => navigate('/dashboard'), 600);
  };

  return (
    <div className="page-container" style={{ maxWidth: 760 }}>
      {/* Breadcrumb nav */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, color: 'var(--text-muted)', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back to Curriculum
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-blue">{skill.title}</span>
          <span className="badge badge-muted">{track.toUpperCase()}</span>
          {isCompleted && <span className="badge badge-green">✓ Completed</span>}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          {task.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {task.objective}
        </p>

        {/* Metadata */}
        <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> {task.estimatedMinutes} minutes estimated
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              +{task.xpReward} XP milestone
            </div>
            {task.challenge && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-text)' }}>
                Includes optional challenge
              </div>
            )}
          </div>

          <button
            onClick={() => openPanel({ initialPrompt: `I am working on "${task.title}" for topic ${skill.title}. Can you give me a guided hint on how to start without giving away the full answer?` })}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 12, gap: 5 }}
            title="Ask AI Mentor for a guided hint"
          >
            <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>Ask AI for Hint</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Curated Resources */}
        {curatedResources.length > 0 && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Recommended Learning Resources
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {curatedResources.map(resource => (
                <div
                  key={resource.id}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-text)' }}>
                          {resource.provider}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 5px' }}>
                          {resource.type}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: 10, padding: '1px 5px' }}>
                          {resource.estimatedTime}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {resource.title}
                      </div>
                    </div>

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: '4px 8px' }}
                    >
                      Open Guide <ExternalLink size={11} />
                    </a>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <strong>What you'll learn:</strong> {resource.whatYouWillLearn}
                  </div>

                  {resource.practiceUrl && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      borderRadius: 4,
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      marginTop: 4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Code2 size={13} style={{ color: 'var(--accent-primary)' }} />
                        <span>{resource.practiceTitle || 'Companion Practice Problem'}</span>
                      </div>
                      <a
                        href={resource.practiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '2px 6px' }}
                      >
                        Solve ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
            Lesson Instructions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {task.instructions.map((instruction, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Criteria */}
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: 'var(--success-subtle)',
            border: '1px solid var(--success-border)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Verification Criteria
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {task.completionCriteria}
          </p>
        </div>

        {/* Optional Challenge */}
        {task.challenge && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Optional Deep-Dive Challenge (+{Math.floor(task.xpReward * 0.5)} XP)
              </div>
              <button
                onClick={() => setChallengeExpanded(!challengeExpanded)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                {challengeExpanded ? 'Hide' : 'Show Challenge'}
              </button>
            </div>
            {challengeExpanded && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  {task.challenge}
                </p>
                <button
                  onClick={() => openPanel({ initialPrompt: `I am attempting the optional challenge for "${task.title}": "${task.challenge}". How should I break down this challenge?` })}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, gap: 5 }}
                >
                  <Sparkles size={11} style={{ color: 'var(--accent-primary)' }} />
                  Break down this challenge with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completion Action */}
        <div className="card" style={{ padding: 20, backgroundColor: isCompleted ? 'var(--bg-subtle)' : 'var(--bg-surface)' }}>
          {isCompleted ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Lesson Completed
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Earned +{task.xpReward} XP towards your curriculum progress.
                  </div>
                </div>
              </div>
              <Link to="/dashboard" className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
            </div>
          ) : (
            <div>
              {confirmComplete && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Confirm that you have completed the instructions above and verified the criteria.
                </p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleComplete}
                  className={`btn ${confirmComplete ? 'btn-green' : 'btn-primary'} btn-sm`}
                  style={{ flex: 1 }}
                >
                  {confirmComplete ? `Confirm & Earn +${task.xpReward} XP` : 'Mark Lesson as Complete'}
                </button>
                {confirmComplete && (
                  <button onClick={() => setConfirmComplete(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
