import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  GitBranch,
  BookOpen,
  Globe,
  Code2,
  Cpu,
  Search,
  Terminal,
  FileCode,
  Hammer,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type {
  OnboardingAnswers,
  CareerClarity,
  CareerInterest,
  ExperienceLevel,
  DailyTime,
  Timeline,
  TrackPreference,
} from '../types';
import { useApp } from '../context/AppContext';
import { generateRecommendation } from '../engine/recommendation';

const TOTAL_STEPS = 7;

const defaultAnswers: OnboardingAnswers = {
  clarity: 'complete-beginner',
  interest: 'exploring',
  experience: 'none',
  existingSkills: [],
  dailyTime: '1hr',
  timeline: '3months',
  trackPreference: 'recommend',
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(defaultAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { finishOnboarding } = useApp();
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    setIsSubmitting(true);
    const result = generateRecommendation(answers);
    finishOnboarding(answers, result.track, result.reason);
    setTimeout(() => navigate('/recommendation'), 400);
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative',
    }}>
      {/* Top Progress Line */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'var(--border)' }}>
        <div style={{
          height: '100%',
          backgroundColor: 'var(--accent-primary)',
          width: `${progress}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Top Header */}
      <div style={{ width: '100%', maxWidth: 580, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>

      {/* Form Card */}
      <div className="card" style={{
        width: '100%',
        maxWidth: 580,
        padding: '32px 32px',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: 'var(--bg-surface)',
      }}>
        {renderStep(step, answers, setAnswers)}

        {/* Bottom Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={back}
            disabled={step === 1}
            className="btn btn-ghost btn-sm"
            style={{ opacity: step === 1 ? 0 : 1 }}
          >
            <ArrowLeft size={13} /> Back
          </button>

          {step < TOTAL_STEPS ? (
            <button onClick={next} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
              Continue <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 18px' }}
            >
              {isSubmitting ? 'Analyzing Path...' : <>Generate Roadmap <ArrowRight size={13} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function renderStep(step: number, answers: OnboardingAnswers, setAnswers: (a: OnboardingAnswers) => void) {
  switch (step) {
    case 1: return <Step1 answers={answers} setAnswers={setAnswers} />;
    case 2: return <Step2 answers={answers} setAnswers={setAnswers} />;
    case 3: return <Step3 answers={answers} setAnswers={setAnswers} />;
    case 4: return <Step4 answers={answers} setAnswers={setAnswers} />;
    case 5: return <Step5 answers={answers} setAnswers={setAnswers} />;
    case 6: return <Step6 answers={answers} setAnswers={setAnswers} />;
    case 7: return <Step7 answers={answers} setAnswers={setAnswers} />;
    default: return null;
  }
}

function StepHeader({ q, sub }: { q: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4 }}>
        {q}
      </h2>
      {sub && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sub}</p>}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  icon,
  title,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px',
        border: `1.5px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
        borderRadius: 8,
        backgroundColor: selected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.12s ease',
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: selected ? '#FFFFFF' : 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: selected ? 'var(--accent-primary)' : 'var(--text-muted)',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{sub}</div>}
      </div>

      <div style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `1.5px solid ${selected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
        backgroundColor: selected ? 'var(--accent-primary)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#FFFFFF',
      }}>
        {selected && <Check size={11} strokeWidth={3} />}
      </div>
    </div>
  );
}

// Step 1: Career Clarity
function Step1({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: CareerClarity; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: 'know', icon: <Compass size={16} />, title: 'I have a specific career target', sub: 'Targeting a clear role such as Software Engineer or Frontend Developer' },
    { value: 'some-skills', icon: <GitBranch size={16} />, title: 'I have some skills but need direction', sub: 'Looking to identify the role and stack that best fits my strengths' },
    { value: 'complete-beginner', icon: <BookOpen size={16} />, title: 'I am a complete beginner', sub: 'Starting from scratch and looking for foundational guidance' },
  ];
  return (
    <div>
      <StepHeader q="Where are you in your career journey?" sub="This helps determine your pacing and prerequisite sequence." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.clarity === opt.value}
            onClick={() => setAnswers({ ...answers, clarity: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

// Step 2: Career Interest
function Step2({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: CareerInterest; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: 'web', icon: <Globe size={16} />, title: 'Building Web Applications', sub: 'Full stack development, React, APIs, and modern architecture' },
    { value: 'interviews', icon: <Code2 size={16} />, title: 'Algorithms & Coding Interviews', sub: 'Data structures, problem-solving patterns, and FAANG prep in C++' },
    { value: 'ai', icon: <Cpu size={16} />, title: 'AI & Machine Learning', sub: 'Python data science, model evaluation, and machine learning pipelines' },
    { value: 'exploring', icon: <Search size={16} />, title: 'Exploring & Open to Guidance', sub: 'Help diagnose the best fit based on my availability and goals' },
  ];
  return (
    <div>
      <StepHeader q="Which domain interests you most?" sub="Select the field you want to specialize in." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.interest === opt.value}
            onClick={() => setAnswers({ ...answers, interest: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

// Step 3: Experience Level
function Step3({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: ExperienceLevel; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: 'none', icon: <BookOpen size={16} />, title: 'Zero Programming Experience', sub: 'Starting fresh with foundational syntax and concepts' },
    { value: 'basics', icon: <FileCode size={16} />, title: 'Programming Fundamentals', sub: 'Understand variables, control flow, loops, and basic functions' },
    { value: 'small-projects', icon: <Hammer size={16} />, title: 'Built Small Projects', sub: 'Have built guided tutorials or personal hobby projects' },
    { value: 'intermediate', icon: <Terminal size={16} />, title: 'Comfortable Problem Solver', sub: 'Have experience with multiple tools, Git, or academic coursework' },
  ];
  return (
    <div>
      <StepHeader q="What is your current experience level?" sub="We will skip redundant introductory material based on this." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.experience === opt.value}
            onClick={() => setAnswers({ ...answers, experience: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

// Step 4: Existing Skills (Multi-select)
function Step4({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const skillGroups = [
    {
      label: 'Web Development',
      skills: [
        { id: 'fs_html', name: 'HTML & CSS' },
        { id: 'fs_javascript', name: 'JavaScript' },
        { id: 'fs_git', name: 'Git & GitHub' },
        { id: 'fs_react', name: 'React' },
        { id: 'fs_backend', name: 'Node.js / Express' },
        { id: 'fs_database', name: 'SQL / Databases' },
      ],
    },
    {
      label: 'Algorithms & DSA',
      skills: [
        { id: 'dsa_fundamentals', name: 'C++ / Language Basics' },
        { id: 'dsa_complexity', name: 'Big O Complexity' },
        { id: 'dsa_arrays', name: 'Arrays & Strings' },
        { id: 'dsa_trees', name: 'Trees & BSTs' },
        { id: 'dsa_dp', name: 'Dynamic Programming' },
      ],
    },
    {
      label: 'AI & Data Science',
      skills: [
        { id: 'ai_python', name: 'Python Basics' },
        { id: 'ai_numpy', name: 'NumPy Arrays' },
        { id: 'ai_pandas', name: 'Pandas DataFrames' },
        { id: 'ai_supervised', name: 'Supervised Learning' },
      ],
    },
  ];

  const toggle = (id: string) => {
    const existing = answers.existingSkills;
    const updated = existing.includes(id) ? existing.filter(s => s !== id) : [...existing, id];
    setAnswers({ ...answers, existingSkills: updated });
  };

  const noneSelected = answers.existingSkills.length === 0;

  return (
    <div>
      <StepHeader q="Which topics do you already know?" sub="We will fast-track these in your curriculum so you don't repeat them." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {skillGroups.map(group => (
          <div key={group.label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              {group.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {group.skills.map(skill => {
                const selected = answers.existingSkills.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggle(skill.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
                      backgroundColor: selected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{
                      width: 15,
                      height: 15,
                      borderRadius: 3,
                      border: `1.5px solid ${selected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                      backgroundColor: selected ? 'var(--accent-primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}>
                      {selected && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: selected ? 600 : 400, color: 'var(--text-primary)' }}>
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div
          onClick={() => setAnswers({ ...answers, existingSkills: [] })}
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            border: `1px solid ${noneSelected ? 'var(--border-strong)' : 'var(--border)'}`,
            backgroundColor: noneSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          None of the above — Start curriculum from Topic 1
        </div>
      </div>
    </div>
  );
}

// Step 5: Daily Commitment
function Step5({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: DailyTime; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: '30min', icon: <Clock size={16} />, title: '30 minutes / day', sub: 'Micro-learning pace — suited for busy schedules' },
    { value: '1hr', icon: <Clock size={16} />, title: '1 hour / day', sub: 'Standard recommended pace for sustainable learning' },
    { value: '2hr', icon: <Clock size={16} />, title: '2 hours / day', sub: 'Accelerated pace with dedicated daily project time' },
    { value: '3hr+', icon: <Clock size={16} />, title: '3+ hours / day', sub: 'Intensive immersion — fastest route to career readiness' },
  ];
  return (
    <div>
      <StepHeader q="How much time can you study daily?" sub="Consistency matters more than intensity. We will scale tasks to this duration." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.dailyTime === opt.value}
            onClick={() => setAnswers({ ...answers, dailyTime: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

// Step 6: Target Timeline
function Step6({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: Timeline; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: '1month', icon: <Calendar size={16} />, title: '1 Month Sprint', sub: 'Fast-paced bootcamp style schedule' },
    { value: '3months', icon: <Calendar size={16} />, title: '3 Months (Standard Quarter)', sub: 'Balanced pace for comprehensive topic mastery' },
    { value: '6months', icon: <Calendar size={16} />, title: '6 Months (Semester)', sub: 'In-depth exploration with portfolio projects' },
    { value: 'no-deadline', icon: <Calendar size={16} />, title: 'Flexible / Self-Paced', sub: 'Progress at your own pace without pressure' },
  ];
  return (
    <div>
      <StepHeader q="What is your target completion timeline?" sub="We will flag if your daily hours and deadline require adjustment." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.timeline === opt.value}
            onClick={() => setAnswers({ ...answers, timeline: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}

// Step 7: Path Preference
function Step7({ answers, setAnswers }: { answers: OnboardingAnswers; setAnswers: (a: OnboardingAnswers) => void }) {
  const options: { value: TrackPreference; icon: React.ReactNode; title: string; sub: string }[] = [
    { value: 'recommend', icon: <Sparkles size={16} />, title: 'Recommend the best path for me', sub: 'Let our algorithm match you based on your answers' },
    { value: 'fullstack', icon: <Globe size={16} />, title: 'Full Stack Development', sub: 'JavaScript, React, Node.js, and web systems' },
    { value: 'dsa', icon: <Code2 size={16} />, title: 'DSA & Coding Interviews', sub: 'Algorithms, data structures, and technical interviews in C++' },
    { value: 'ai', icon: <Cpu size={16} />, title: 'AI & Machine Learning', sub: 'Python, Pandas, supervised learning, and neural nets' },
  ];
  return (
    <div>
      <StepHeader q="Do you have a specific track in mind?" sub="You can always switch tracks later from the sidebar or profile." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <SelectCard
            key={opt.value}
            selected={answers.trackPreference === opt.value}
            onClick={() => setAnswers({ ...answers, trackPreference: opt.value })}
            icon={opt.icon}
            title={opt.title}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
}
