import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { ChatMessage, LearnerContext, AiMode } from '../types';
import { useApp } from './AppContext';
import { buildLearnerContext } from '../engine/aiContext';
import { AiProvider, EndpointAiProvider, ContextualMentorEngine } from '../engine/aiProvider';

interface AiContextValue {
  isOpen: boolean;
  openPanel: (options?: { topicId?: string; initialPrompt?: string }) => void;
  closePanel: () => void;
  togglePanel: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  isGenerating: boolean;
  stopGeneration: () => void;
  activeContext: LearnerContext;
  mode: AiMode;
  setMode: (mode: AiMode, endpoint?: string) => void;
  setTopicOverride: (topicId?: string) => void;
}

const AiContext = createContext<AiContextValue | null>(null);

const STORAGE_CHAT_KEY = 'codequest_chat_history';

export function AiProviderWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [topicOverride, setTopicOverride] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setModeState] = useState<AiMode>('builtin');
  const [endpointUrl, setEndpointUrl] = useState<string>('/api/chat');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Hello! I am your CodeQuest mentor. Ask me questions about your current roadmap topic, request hints for exercises, or get guidance on today's quest.`,
        timestamp: Date.now(),
        suggestedFollowUps: [
          'Explain my current roadmap topic',
          'Give me a hint for today’s quest',
          'Help me debug my code',
        ],
      },
    ];
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const activeContext = buildLearnerContext(state, location.pathname, topicOverride);
  const providerRef = useRef<AiProvider>(new ContextualMentorEngine());

  const setMode = useCallback((newMode: AiMode, endpoint?: string) => {
    setModeState(newMode);
    if (endpoint) setEndpointUrl(endpoint);

    if (newMode === 'endpoint') {
      providerRef.current = new EndpointAiProvider(endpoint || endpointUrl);
    } else {
      providerRef.current = new ContextualMentorEngine();
    }
  }, [endpointUrl]);

  const openPanel = useCallback((options?: { topicId?: string; initialPrompt?: string }) => {
    if (options?.topicId) {
      setTopicOverride(options.topicId);
    }
    setIsOpen(true);

    if (options?.initialPrompt) {
      setTimeout(() => {
        handleSendMessage(options.initialPrompt!);
      }, 50);
    }
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearConversation = useCallback(() => {
    const freshWelcome: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content: `Conversation reset. Ready to assist with **${activeContext.topicTitle || 'your current topic'}** in **${activeContext.trackName}**.`,
      timestamp: Date.now(),
      suggestedFollowUps: [
        'Explain my current roadmap topic',
        'Give me a hint for today’s quest',
        'Help me debug my code',
      ],
    };
    setMessages([freshWelcome]);
  }, [activeContext.topicTitle, activeContext.trackName]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      contextSummary: `${activeContext.topicTitle || 'General'} (${activeContext.trackName})`,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await providerRef.current.sendMessage(
        [...messages, userMessage],
        activeContext,
        abortController.signal
      );

      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        suggestedFollowUps: response.suggestedFollowUps,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `An error occurred while generating a response: ${err instanceof Error ? err.message : 'Unknown error'}.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <AiContext.Provider
      value={{
        isOpen,
        openPanel,
        closePanel,
        togglePanel,
        messages,
        sendMessage: handleSendMessage,
        clearConversation,
        isGenerating,
        stopGeneration,
        activeContext,
        mode,
        setMode,
        setTopicOverride,
      }}
    >
      {children}
    </AiContext.Provider>
  );
}

export function useAiAssistant(): AiContextValue {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error('useAiAssistant must be used within an AiProviderWrapper');
  return ctx;
}
