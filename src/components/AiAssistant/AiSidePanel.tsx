import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  Square,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAiAssistant } from '../../context/AiContext';
import { MarkdownMessage } from './MarkdownMessage';

export function AiSidePanel() {
  const {
    isOpen,
    closePanel,
    messages,
    sendMessage,
    clearConversation,
    isGenerating,
    stopGeneration,
    activeContext,
    mode,
    setMode,
  } = useAiAssistant();

  const [input, setInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/api/chat');
  const [contextExpanded, setContextExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isOpen]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getContextualPrompts = () => {
    const prompts: string[] = [];
    const topic = activeContext.topicTitle || 'my current topic';

    if (activeContext.currentPath.startsWith('/task/')) {
      prompts.push(`Explain the concept of ${topic}`);
      prompts.push(`Give me a hint for ${activeContext.taskTitle || 'this lesson'}`);
      prompts.push('What are the common edge cases?');
    } else if (activeContext.currentPath.startsWith('/projects')) {
      prompts.push(`How do I architect ${activeContext.activeProjectName || 'this project'}?`);
      prompts.push('Give me an implementation roadmap for Milestone 1');
      prompts.push('What database/data structure should I choose?');
    } else if (activeContext.dailyQuestTopic) {
      prompts.push(`Help me with today's quest: ${activeContext.dailyQuestTopic}`);
      prompts.push(`Explain the core concept: ${activeContext.dailyQuestTopic}`);
      prompts.push('Recommend learning resources for this topic');
    } else {
      prompts.push(`Explain ${topic}`);
      prompts.push('What should I learn next in my roadmap?');
      prompts.push('Help me debug my code');
    }
    return prompts.slice(0, 3);
  };

  const smartPrompts = getContextualPrompts();

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        maxWidth: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            backgroundColor: 'var(--text-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={13} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              CodeQuest Assistant
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {mode === 'builtin' ? 'Interactive Mentor' : 'Custom Endpoint'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: showConfig ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            title="Configure Endpoint"
          >
            <Settings size={14} />
          </button>

          <button
            onClick={clearConversation}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: 'var(--text-muted)' }}
            title="Start New Conversation"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={closePanel}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, color: 'var(--text-muted)' }}
            title="Close Assistant Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showConfig && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border)',
          fontSize: 12,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Provider Configuration
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
            Select an assistant engine or connect a custom API endpoint:
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => setMode('builtin')}
              className={`btn btn-sm ${mode === 'builtin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              Built-in Engine
            </button>
            <button
              onClick={() => setMode('endpoint', customEndpoint)}
              className={`btn btn-sm ${mode === 'endpoint' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              Custom Endpoint
            </button>
          </div>
          {mode === 'endpoint' && (
            <input
              type="text"
              value={customEndpoint}
              onChange={e => setCustomEndpoint(e.target.value)}
              placeholder="e.g. /api/chat"
              style={{ width: '100%', padding: '6px 8px', fontSize: 12 }}
            />
          )}
        </div>
      )}

      <div style={{
        padding: '8px 16px',
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
      }}>
        <div
          onClick={() => setContextExpanded(!contextExpanded)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
            }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Context:
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {activeContext.topicTitle || activeContext.trackName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <span>{contextExpanded ? 'Hide' : 'Inspect'}</span>
            {contextExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>

        {contextExpanded && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-secondary)' }}>
            <div><strong>Track:</strong> {activeContext.trackName}</div>
            {activeContext.dailyQuestTopic && (
              <div><strong>Today's Quest:</strong> {activeContext.dailyQuestTopic}</div>
            )}
            {activeContext.curatedResourceTitle && (
              <div><strong>Curated Resource:</strong> {activeContext.curatedResourceTitle} ({activeContext.curatedResourceProvider})</div>
            )}
            <div><strong>Progress:</strong> {activeContext.completedSkillsCount} of {activeContext.totalSkillsCount} topics mastered</div>
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: isUser ? '85%' : '100%',
                  padding: isUser ? '10px 14px' : '14px 16px',
                  borderRadius: 8,
                  backgroundColor: isUser ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {isUser ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {msg.content}
                  </p>
                ) : (
                  <div>
                    <MarkdownMessage content={msg.content} />

                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && !isGenerating && (
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                          Suggested follow-ups:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {msg.suggestedFollowUps.map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => sendMessage(prompt)}
                              style={{
                                fontSize: 11,
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: 'var(--bg-subtle)',
                                border: '1px solid var(--border)',
                                color: 'var(--accent-text)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.12s ease',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                              }}
                            >
                              {prompt} →
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, padding: '0 4px' }}>
                {isUser ? 'You' : 'Mentor'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', width: 'fit-content' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isGenerating && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            Quick Prompts:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {smartPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 4,
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border)',
          borderRadius: 6,
          backgroundColor: 'var(--bg-surface)',
          padding: '8px 10px',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code, roadmap, or today's quest..."
            rows={2}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 13,
              lineHeight: 1.4,
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline
            </span>

            {isGenerating ? (
              <button
                onClick={stopGeneration}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: '4px 8px', gap: 4 }}
              >
                <Square size={10} /> Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  opacity: input.trim() ? 1 : 0.4,
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Send <Send size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
