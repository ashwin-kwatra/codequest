import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Code2,
  Globe,
  Cpu,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  FolderGit2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const { resetDemo, state, loadDemoPersona } = useApp();
  const navigate = useNavigate();

  const handleLaunchPersona = (persona: 'beginner' | 'directionless' | 'goal_driven') => {
    loadDemoPersona(persona);
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 56,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 5,
            backgroundColor: 'var(--text-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}>
            Q
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            CodeQuest
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="#tracks" style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 8 }}>
            Curriculum Tracks
          </a>
          <a href="#features" style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 12 }}>
            Platform Features
          </a>
          {state.profile.onboardingCompleted ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Open Workspace <ArrowRight size={13} />
            </Link>
          ) : (
            <Link to="/onboarding" className="btn btn-primary btn-sm">
              Start Assessment (60s) <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '72px 24px 48px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          borderRadius: 20,
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--accent-text)',
          marginBottom: 20,
          letterSpacing: '0.04em',
        }}>
          ENGINEERING ROADMAP ENGINE
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          marginBottom: 16,
        }}>
          Turn "What should I learn?" into your next actionable step in 60 seconds.
        </h1>

        <p style={{
          fontSize: 16,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: 620,
          margin: '0 auto 28px',
        }}>
          A personalized, prerequisite-driven learning platform for aspiring developers and college students. Get a realistic timeline, curated learning resources, daily consistency tracking, and a portfolio project.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <Link to="/onboarding" className="btn btn-primary btn-lg" style={{ padding: '10px 22px' }}>
            Find My Path in 60 Seconds <ArrowRight size={15} />
          </Link>
          <a href="#tracks" className="btn btn-secondary btn-lg" style={{ padding: '10px 20px' }}>
            Explore 3 Tracks
          </a>
        </div>

        {/* 1-Click Persona Launchers for Live Review */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: 680,
            margin: '0 auto 48px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Sample Learner Profiles
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <button
              onClick={() => handleLaunchPersona('beginner')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '10px 8px',
                height: 'auto',
                gap: 3,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Persona A: Taylor</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lost Beginner (Full Stack)</span>
            </button>

            <button
              onClick={() => handleLaunchPersona('directionless')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '10px 8px',
                height: 'auto',
                gap: 3,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Persona B: Jordan</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Directionless (AI / ML)</span>
            </button>

            <button
              onClick={() => handleLaunchPersona('goal_driven')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '10px 8px',
                height: 'auto',
                gap: 3,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Persona C: Alex</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Goal-Driven (DSA Prep)</span>
            </button>
          </div>
        </div>

        {/* Core Stat Metrics */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 28 }}>
          {[
            { value: '3', label: 'Curated Tracks' },
            { value: '36', label: 'Prerequisite Skills' },
            { value: '108+', label: 'Learning Tasks' },
            { value: '9', label: 'Portfolio Projects' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" style={{ padding: '48px 24px 64px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Three Focused Learning Paths
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 540, margin: '0 auto' }}>
            Structured prerequisite sequences designed to take you from fundamentals to job readiness.
          </p>
        </div>

        <div className="grid-3">
          {/* Track 1: DSA */}
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Code2 size={18} style={{ color: 'var(--track-dsa)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                DSA & Coding Interviews
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
              Master data structures, algorithmic complexity, and problem-solving patterns in C++ for top technical interviews.
            </p>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Curated Syllabus (12 Topics)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              {['Complexity & Big O', 'Arrays & Strings', 'Trees & BSTs', 'Dynamic Programming', 'Interview Patterns'].map(t => (
                <span key={t} className="badge badge-muted" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              Primary Source: takeUforward Striver's A2Z Sheet
            </div>
          </div>

          {/* Track 2: Full Stack */}
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Globe size={18} style={{ color: 'var(--track-fullstack)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                Full Stack Development
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
              Build modern web applications from scratch — semantic frontend, asynchronous React, Express servers, and SQL databases.
            </p>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Curated Syllabus (12 Topics)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              {['Semantic HTML & CSS', 'JavaScript DOM', 'React Components', 'Node & Express', 'Databases & Auth'].map(t => (
                <span key={t} className="badge badge-muted" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              Primary Sources: MDN Curriculum & Full Stack Open
            </div>
          </div>

          {/* Track 3: AI / ML */}
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Cpu size={18} style={{ color: 'var(--track-ai)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                AI & Machine Learning
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
              Learn computational linear algebra, statistical data preparation, model training, evaluation metrics, and API deployment.
            </p>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Curated Syllabus (12 Topics)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              {['NumPy & Vectorization', 'Pandas Analysis', 'Supervised Models', 'Pipelines & Cross-Validation', 'Deployment'].map(t => (
                <span key={t} className="badge badge-muted" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              Primary Source: Google Machine Learning Crash Course
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '48px 24px 64px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Why CodeQuest Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Engineered to replace directionless tutorials with structured engineering progress.
            </p>
          </div>

          <div className="grid-4">
            <div style={{ padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Prerequisite Graph
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Explicit topic dependencies prevent skipping ahead into confusing advanced material without solid fundamentals.
              </p>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Curated Resources
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Every topic is linked to verified guides from takeUforward, MDN, Full Stack Open, and Google ML Crash Course.
              </p>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Calendar size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Daily Quest Habit
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                A focused 3-step daily checklist (learn, practise, challenge) designed around your actual daily availability.
              </p>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <FolderGit2 size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Portfolio Projects
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Translate theoretical concepts directly into portfolio projects that you can demonstrate to technical interviewers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            CodeQuest — Engineering Career Roadmap Platform
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <Link to="/onboarding" style={{ color: 'var(--text-secondary)' }}>Diagnostic Assessment</Link>
            <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
