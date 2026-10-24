import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Recommendation from './pages/Recommendation';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import TaskDetail from './pages/TaskDetail';
import Sidebar from './components/Sidebar';

function AppRoutes() {
  const { state } = useApp();
  const hasOnboarded = state.profile.onboardingCompleted;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/recommendation" element={
          hasOnboarded ? <Recommendation /> : <Navigate to="/onboarding" />
        } />
        <Route path="/dashboard" element={
          hasOnboarded
            ? <AppShell><Dashboard /></AppShell>
            : <Navigate to="/onboarding" />
        } />
        <Route path="/roadmap" element={
          hasOnboarded
            ? <AppShell><Roadmap /></AppShell>
            : <Navigate to="/onboarding" />
        } />
        <Route path="/projects" element={
          hasOnboarded
            ? <AppShell><Projects /></AppShell>
            : <Navigate to="/onboarding" />
        } />
        <Route path="/profile" element={
          hasOnboarded
            ? <AppShell><Profile /></AppShell>
            : <Navigate to="/onboarding" />
        } />
        <Route path="/task/:taskId" element={
          hasOnboarded
            ? <AppShell><TaskDetail /></AppShell>
            : <Navigate to="/onboarding" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const location = useLocation();
  const track = state.profile.selectedTrack ?? 'fullstack';

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/roadmap')) return 'Curriculum Roadmap';
    if (pathname.startsWith('/projects')) return 'Portfolio Projects';
    if (pathname.startsWith('/profile')) return 'Profile & Progress';
    if (pathname.startsWith('/task/')) return 'Lesson Workspace';
    return 'Workspace';
  };

  const TRACK_NAMES = {
    fullstack: 'Full Stack Development',
    dsa: 'DSA & Coding Interviews',
    ai: 'AI & Machine Learning',
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>CodeQuest</span>
            <span style={{ color: 'var(--border-strong)' }}>/</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getPageTitle(location.pathname)}</span>
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              {TRACK_NAMES[track as keyof typeof TRACK_NAMES] || 'Track'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/roadmap" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
              View Curriculum
            </Link>
            <Link to="/profile" className="btn btn-secondary btn-sm" style={{ fontSize: 12, padding: '5px 10px' }}>
              {state.profile.name || 'Account'}
            </Link>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
