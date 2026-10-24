import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FolderGit2,
  User,
  RotateCcw,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { xpProgress } from '../store/storage';

const NAV_ITEMS = [
  { to: '/dashboard', icon: <LayoutDashboard size={16} strokeWidth={2} />, label: 'Dashboard' },
  { to: '/roadmap', icon: <Compass size={16} strokeWidth={2} />, label: 'Roadmap' },
  { to: '/projects', icon: <FolderGit2 size={16} strokeWidth={2} />, label: 'Projects' },
  { to: '/profile', icon: <User size={16} strokeWidth={2} />, label: 'Profile' },
];

const TRACK_LABELS = {
  fullstack: { short: 'Full Stack', label: 'Full Stack Development', code: 'FS' },
  dsa: { short: 'DSA', label: 'Algorithms & Interviews', code: 'DSA' },
  ai: { short: 'AI / ML', label: 'AI & Machine Learning', code: 'AI' },
};

export default function Sidebar() {
  const { state, resetDemo, switchTrack } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { gamification, profile } = state;
  const track = profile.selectedTrack ?? 'fullstack';
  const lvl = xpProgress(gamification.xp);

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
        <div
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            Q
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              CodeQuest
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Curriculum Engine
            </div>
          </div>
        </div>

        {/* Track Switcher (Subtle segmented control) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3,
          background: 'var(--bg-subtle)',
          padding: 3,
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}>
          {(['fullstack', 'dsa', 'ai'] as const).map(t => {
            const isCurrent = track === t;
            const tInfo = TRACK_LABELS[t];
            return (
              <button
                key={t}
                onClick={() => switchTrack(t)}
                style={{
                  padding: '5px 0',
                  borderRadius: 4,
                  background: isCurrent ? 'var(--bg-surface)' : 'transparent',
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: isCurrent ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: isCurrent ? 'var(--shadow-xs)' : 'none',
                  fontSize: 11,
                  fontWeight: isCurrent ? 600 : 500,
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                title={`Switch to ${tInfo.label}`}
              >
                {tInfo.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 10px 4px' }}>
          Workspace
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                transition: 'all 0.12s ease',
                textDecoration: 'none',
              }}
            >
              <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Learner Progress Footer Card */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {profile.name || 'Student Learner'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Level {lvl.level} • {gamification.xp} XP
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 7px',
            borderRadius: 4,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}>
            <Flame size={12} style={{ color: 'var(--warning)' }} />
            <span>{gamification.streak}d</span>
          </div>
        </div>

        {/* Level progress bar */}
        <div className="progress-bar" style={{ height: 4, marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${lvl.percent}%` }} />
        </div>

        {/* Reset Demo Trigger */}
        <button
          onClick={resetDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            padding: '6px 8px',
            borderRadius: 5,
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 11,
            cursor: 'pointer',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <RotateCcw size={11} /> Reset Demo Progress
        </button>
      </div>
    </aside>
  );
}
