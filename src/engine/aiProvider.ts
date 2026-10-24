// ============================================================================
// CodeQuest AI — Provider Abstraction & Mentor Reasoning Engine
// Supports both secure server-side API endpoints and context-aware offline mode
// ============================================================================

import type { ChatMessage, LearnerContext } from '../types';
import { getPrimaryResourceForTopic, getResourcesForTopic } from '../data/resources';
import { TRACKS } from '../data/curriculum';

export interface AiResponseResult {
  content: string;
  suggestedFollowUps: string[];
  isDemoResponse: boolean;
}

export interface AiProvider {
  sendMessage(
    messages: ChatMessage[],
    context: LearnerContext,
    signal?: AbortSignal
  ): Promise<AiResponseResult>;
  isConfigured(): boolean;
}

/**
 * Endpoint-based AI provider for connecting to a secure server-side endpoint (e.g. /api/chat)
 */
export class EndpointAiProvider implements AiProvider {
  private endpointUrl: string;

  constructor(endpointUrl: string = '/api/chat') {
    this.endpointUrl = endpointUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.endpointUrl && this.endpointUrl !== '/api/chat');
  }

  async sendMessage(
    messages: ChatMessage[],
    context: LearnerContext,
    signal?: AbortSignal
  ): Promise<AiResponseResult> {
    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`AI endpoint returned error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.reply || data.content,
      suggestedFollowUps: data.suggestedFollowUps || [],
      isDemoResponse: false,
    };
  }
}

/**
 * Context-Aware Pedagogical Mentor Engine
 * Provides deterministic, structured engineering mentorship grounded in the active curriculum
 */
export class ContextualMentorEngine implements AiProvider {
  isConfigured(): boolean {
    return true; // Always ready for client-side evaluation
  }

  async sendMessage(
    messages: ChatMessage[],
    context: LearnerContext,
    signal?: AbortSignal
  ): Promise<AiResponseResult> {
    // Artificial latency (300-500ms) to emulate thought process
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 400);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted by user', 'AbortError'));
      });
    });

    const lastMessage = messages[messages.length - 1];
    const userPrompt = (lastMessage?.content || '').toLowerCase().trim();

    return this.generateMentorResponse(userPrompt, context);
  }

  private generateMentorResponse(prompt: string, context: LearnerContext): AiResponseResult {
    const topic = context.topicTitle || 'Programming Fundamentals';
    const track = context.trackName || 'Full Stack Development';
    const primaryRes = context.topicId ? getPrimaryResourceForTopic(context.topicId) : null;
    const allRes = context.topicId ? getResourcesForTopic(context.topicId) : [];

    // 1. Daily Quest Questions
    if (
      prompt.includes('today') ||
      prompt.includes('quest') ||
      prompt.includes('daily') ||
      prompt.includes('plan')
    ) {
      return {
        content: `### 🎯 Today's Learning Objective: ${context.dailyQuestTopic || topic}

Here is how you should approach today's daily quest:

1. **Study Concept First**:
   Read the curated guide from **${context.curatedResourceProvider || 'CodeQuest Resource'}** on ${context.dailyQuestTopic || topic}.
   ${context.curatedResourceUrl ? `[View Lesson Guide](${context.curatedResourceUrl})` : ''}

2. **Hands-On Implementation**:
   ${context.dailyQuestObjective || 'Write working code implementing the primary primitive.'}

3. **Self-Verification Checkpoint**:
   Test edge cases (e.g. empty inputs, boundary values, error handling).

💡 *Pro-tip*: Don't rush to check off all 3 steps at once. Spend 20 minutes actually reading the documentation and typing out the code in your editor.`,
        suggestedFollowUps: [
          'Give me a hint for today’s practice',
          'Explain the key concept in simple terms',
          'What are the common edge cases?',
        ],
        isDemoResponse: true,
      };
    }

    // 2. Hint or Problem-Solving Guidance
    if (
      prompt.includes('hint') ||
      prompt.includes('stuck') ||
      prompt.includes('help me solve') ||
      prompt.includes('how to start')
    ) {
      return {
        content: `### 💡 Guided Problem-Solving Hint for **${topic}**

Let's break this down methodically without giving away the full solution immediately:

1. **Clarify the Input & Invariant**:
   - What is the expected input shape and type?
   - What invariant must hold true after each step or iteration?

2. **Intuition & Mental Model**:
   - For **${topic}** in **${track}**, start with the brute-force or simplest naive approach.
   - Ask yourself: *What is redundant in the brute-force calculation?* Can you store previous state or eliminate duplicate checks?

3. **Step 1 to Code**:
   - Write out the function signature and handle the base case / boundary conditions first (e.g., \`null\`, \`0\`, or empty input).

Would you like the **Next Step Clue**, or do you want to share your current code draft so we can debug it together?`,
        suggestedFollowUps: [
          'Give me the next step clue',
          'Show me a minimal code skeleton',
          'What is the optimal time complexity?',
        ],
        isDemoResponse: true,
      };
    }

    // 3. Code Debugging
    if (
      prompt.includes('debug') ||
      prompt.includes('error') ||
      prompt.includes('wrong') ||
      prompt.includes('fix') ||
      prompt.includes('bug') ||
      prompt.includes('undefined') ||
      prompt.includes('syntax')
    ) {
      return {
        content: `### 🔍 Code Debugging Diagnostic

When debugging issues related to **${topic}** in ${track}, the most frequent failure points are:

1. **Boundary & Off-By-One Errors**:
   - Check array indexing bounds (\`i < length\` vs \`i <= length\`).
   - In recursive logic, verify the base termination condition returns before continuing.

2. **State & Mutation**:
   - Ensure you are not inadvertently mutating state or pointers that other operations rely upon.
   - In asynchronous code (JavaScript/React), verify promises are awaited properly.

3. **Smallest Useful Fix**:
   - Insert localized assertions or print statements before the crash line to inspect variable values at runtime.

\`\`\`${context.trackId === 'dsa' ? 'cpp' : context.trackId === 'ai' ? 'python' : 'javascript'}
// Debugging template: verify inputs and state invariants
function verifyState(input) {
  if (!input) {
    console.error("Invariant violation: input is undefined or null");
    return;
  }
  // Proceed with validated state
}
\`\`\`

Paste the exact code snippet and error trace above, and I will highlight the specific line causing the issue.`,
        suggestedFollowUps: [
          'Here is my code snippet (paste below)',
          'How do I write unit test cases for this?',
          'Explain common pitfalls for this topic',
        ],
        isDemoResponse: true,
      };
    }

    // 4. Learning Resources Recommendation
    if (
      prompt.includes('resource') ||
      prompt.includes('learn') ||
      prompt.includes('guide') ||
      prompt.includes('video') ||
      prompt.includes('docs')
    ) {
      const resourceList = allRes.length > 0 ? allRes : (primaryRes ? [primaryRes] : []);
      const formattedResources = resourceList
        .map(
          r => `• **[${r.title}](${r.url})**  
  *Provider*: ${r.provider} (${r.type}, ~${r.estimatedTime})  
  *Takeaway*: ${r.whatYouWillLearn}${r.practiceUrl ? `\n  *Companion Practice*: [${r.practiceTitle || 'Practice Problem'}](${r.practiceUrl})` : ''}`
        )
        .join('\n\n');

      return {
        content: `### 📚 Curated Learning Resources for **${topic}**

Based on your active track (**${track}**), here are verified resources from our curriculum catalogue:

${formattedResources || `• **[Official Documentation for ${topic}](${context.curatedResourceUrl || 'https://developer.mozilla.org/'})**`}

Every link above points directly to official verified material (no fabricated or dead links). Which aspect of ${topic} would you like to explore first?`,
        suggestedFollowUps: [
          'Walk me through the primary concept',
          'What are the prerequisite topics for this?',
          'Give me a practice exercise',
        ],
        isDemoResponse: true,
      };
    }

    // 5. Roadmap Progression & Prerequisites
    if (
      prompt.includes('next') ||
      prompt.includes('roadmap') ||
      prompt.includes('prereq') ||
      prompt.includes('skip') ||
      prompt.includes('why')
    ) {
      return {
        content: `### 🗺️ Curriculum Progression Analysis

- **Current Track**: ${track}
- **Current Topic**: ${topic}
- **Progress**: You have completed **${context.completedSkillsCount} of ${context.totalSkillsCount}** topics in this curriculum.

#### Why is ${topic} essential?
In ${track}, ${topic} forms a foundational pillar. Without mastering this topic, advanced modules (such as full applications or dynamic optimization) will feel disjointed.

#### What to tackle next:
1. Complete today's 3-step checklist for **${topic}**.
2. Solve the companion practice problem on ${primaryRes?.provider || 'the practice platform'}.
3. Once completed, your roadmap will automatically unlock the dependent topics in the curriculum.

If you already have practical experience with this topic, you can open the topic drawer in the **Roadmap** and click **"Verify Prerequisite Knowledge"** to fast-track (+25 XP).`,
        suggestedFollowUps: [
          'Explain the concept of ' + topic,
          'Recommend a practice problem',
          'How does this topic apply in industry?',
        ],
        isDemoResponse: true,
      };
    }

    // 6. Default / General Concept Explanation
    return {
      content: `### 📖 Concept Breakdown: **${topic}**

Here is a structured overview of **${topic}** within your **${track}** curriculum:

#### 1. Core Intuition
${topic} allows you to structure and process data efficiently without writing repetitive boilerplate. It establishes the mechanical foundation used throughout production software.

#### 2. Canonical Code Example
\`\`\`${context.trackId === 'dsa' ? 'cpp' : context.trackId === 'ai' ? 'python' : 'javascript'}
${
  context.trackId === 'dsa'
    ? `// C++: Idiomatic implementation pattern for ${topic}
#include <iostream>
#include <vector>

void solve() {
    // 1. Establish state and base conditions
    std::vector<int> data = {1, 2, 3, 4, 5};
    // 2. Execute optimal algorithm
}
`
    : context.trackId === 'ai'
    ? `# Python: Core vectorization pattern for ${topic}
import numpy as np

def process_features(X):
    # Vectorized computation without explicit slow loops
    return np.mean(X, axis=0)
`
    : `// JavaScript/TypeScript: Clean architecture pattern for ${topic}
export function handleAction(state, payload) {
  // Pure transformation maintaining state immutability
  return { ...state, ...payload };
}
`
}
\`\`\`

#### 3. Complexity & Performance
- **Time Complexity**: Optimal implementations operate in $O(N)$ or $O(N \\log N)$.
- **Space Complexity**: Look for opportunities to achieve $O(1)$ auxiliary memory where possible.

#### 4. Common Mistake to Avoid
Avoid nested quadratic loops ($O(N^2)$) when hashing or two-pointer techniques can achieve linear time.

Would you like me to walk through a step-by-step dry run, or give you a challenge problem to practice?`,
      suggestedFollowUps: [
        'Walk through a step-by-step dry run',
        'Give me a coding hint for this topic',
        'Recommend official learning resources',
      ],
      isDemoResponse: true,
    };
  }
}
