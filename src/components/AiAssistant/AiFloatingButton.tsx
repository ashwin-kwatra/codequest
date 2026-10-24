import React from 'react';
import { MessageSquareCode, Sparkles } from 'lucide-react';
import { useAiAssistant } from '../../context/AiContext';

export function AiFloatingButton() {
  const { isOpen, togglePanel, activeContext } = useAiAssistant();

  if (isOpen) {
    return null; // Side panel is open
  }

  return (
    <button
      onClick={togglePanel}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        backgroundColor: 'var(--text-primary)',
        color: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid var(--text-primary)',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#000000';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--text-primary)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
      title={`Open CodeQuest AI (Current Context: ${activeContext.topicTitle || activeContext.trackName})`}
    >
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: 'var(--accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Sparkles size={11} color="#FFFFFF" />
      </div>
      <span>CodeQuest AI</span>

      {/* Context indicator dot */}
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: '#4ADE80',
          marginLeft: 2,
        }}
        title="Context active"
      />
    </button>
  );
}
