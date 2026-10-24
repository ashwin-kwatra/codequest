import { useState } from 'react';
import { Clock, CheckCircle2, ChevronRight, Lock, FolderGit2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS } from '../data/curriculum';
import type { Project } from '../types';

export default function Projects() {
  const { state, startProject, completeMilestoneAction } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { roadmap, profile } = state;
  const track = profile.selectedTrack ?? 'fullstack';
  const trackData = TRACKS.find(t => t.id === track)!;

  const completedSkillIds = new Set(
    Object.entries(roadmap.skillProgress)
      .filter(([, v]) => v.status === 'completed')
      .map(([k]) => k)
  );
  const knownSkillIds = new Set(profile.answers?.existingSkills ?? []);
  const allKnown = new Set([...completedSkillIds, ...knownSkillIds]);

  function getProjectReadiness(project: Project): { ready: boolean; missingSkills: string[]; percent: number } {
    const missing = project.requiredSkills.filter(s => !allKnown.has(s));
    const ready = missing.length === 0;
    const percent = Math.round((project.requiredSkills.filter(s => allKnown.has(s)).length / Math.max(project.requiredSkills.length, 1)) * 100);
    return { ready, missingSkills: missing, percent };
  }

  const activeProjectId = roadmap.activeProjectId;
  const activeProject = activeProjectId ? trackData.projects.find(p => p.id === activeProjectId) : null;
  const activeProgress = activeProjectId ? roadmap.projectProgress[activeProjectId] : null;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Portfolio Projects
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Build real-world applications and tools that demonstrate technical competence in {trackData.name}.
        </p>
      </div>

      {/* Active Project Workspace */}
      {activeProject && activeProgress && (
        <div className="card" style={{ marginBottom: 28, padding: 24, border: '1px solid var(--border-strong)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Active Portfolio Deliverable
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {activeProject.name}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 780 }}>
                {activeProject.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="badge badge-muted">
                <Clock size={11} /> {activeProject.estimatedHours}h
              </span>
              <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>
                {activeProject.difficulty}
              </span>
              <span className="badge badge-blue">
                {activeProgress.completedMilestones.length} of {activeProject.milestones.length} milestones
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar" style={{ height: 5, marginBottom: 18 }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(activeProgress.completedMilestones.length / activeProject.milestones.length * 100)}%`,
              }}
            />
          </div>

          {/* Milestones list */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Milestones & Implementation Steps
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeProject.milestones.map((milestone, i) => {
                const done = activeProgress.completedMilestones.includes(milestone.id);
                const isNext = !done && activeProject.milestones.slice(0, i).every(m => activeProgress.completedMilestones.includes(m.id));
                return (
                  <div
                    key={milestone.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      backgroundColor: done ? 'var(--bg-subtle)' : isNext ? 'var(--bg-surface)' : 'var(--bg-surface)',
                      border: `1px solid ${isNext ? 'var(--border-strong)' : 'var(--border)'}`,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: done ? 'var(--success)' : 'var(--bg-subtle)',
                      border: `1.5px solid ${done ? 'var(--success)' : 'var(--border-strong)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#FFFFFF',
                      marginTop: 1,
                    }}>
                      {done ? <CheckCircle2 size={13} /> : <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', marginBottom: 2 }}>
                        {milestone.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {milestone.description}
                      </div>

                      {isNext && (
                        <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
                          {milestone.tasks.map((t, ti) => (
                            <div key={ti} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                              • {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>
                        +{milestone.xpReward} XP
                      </span>
                      {isNext && !done && (
                        <button
                          onClick={() => completeMilestoneAction(activeProject.id, milestone.id, milestone.xpReward)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 12 }}
                        >
                          Mark Finished
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All Available Track Projects */}
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Curated Projects ({trackData.projects.length})
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Select a project specification to anchor your practical exercises with code deliverables.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {trackData.projects.map(project => {
          const { ready, missingSkills, percent } = getProjectReadiness(project);
          const isActive = project.id === activeProjectId;

          return (
            <div
              key={project.id}
              className="card"
              style={{
                padding: 20,
                border: `1px solid ${isActive ? 'var(--border-strong)' : 'var(--border)'}`,
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {isActive && (
                      <span className="badge badge-blue">
                        Active Project
                      </span>
                    )}
                    <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>
                      {project.difficulty}
                    </span>
                    <span className="badge badge-muted">
                      <Clock size={10} /> {project.estimatedHours}h
                    </span>
                    {ready ? (
                      <span className="badge badge-green">
                        Prerequisites Ready
                      </span>
                    ) : (
                      <span className="badge badge-muted">
                        {100 - percent}% prerequisites remaining
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {project.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                    {project.description}
                  </p>

                  {!ready && missingSkills.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Prerequisite topics needed:
                      </span>
                      {missingSkills.slice(0, 3).map(s => (
                        <span key={s} className="badge badge-muted" style={{ fontSize: 10 }}>
                          {s.replace(/^(dsa_|fs_|ai_)/, '').replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {project.suggestedFeatures.slice(0, 3).map(f => (
                      <span key={f} style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Spec
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => startProject(project.id)}
                      className="btn btn-primary btn-sm"
                    >
                      Set as Active
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Spec Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Project Specification
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedProject.name}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                  {selectedProject.description}
                </p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Core Features
              </div>
              <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedProject.suggestedFeatures.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-primary)' }}>{f}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Implementation Milestones ({selectedProject.milestones.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedProject.milestones.map((m, i) => (
                  <div key={m.id} style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {i + 1}. {m.title} (+{m.xpReward} XP)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {m.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  startProject(selectedProject.id);
                  setSelectedProject(null);
                }}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                Set as Active Project
              </button>
              <button onClick={() => setSelectedProject(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
