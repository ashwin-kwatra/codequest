import type { ChatMessage, LearnerContext } from '../types';
import { getPrimaryResourceForTopic, getResourcesForTopic } from '../data/resources';

export interface AiResponseResult {
  content: string;
  suggestedFollowUps: string[];
}

export interface AiProvider {
  sendMessage(
    messages: ChatMessage[],
    context: LearnerContext,
    signal?: AbortSignal
  ): Promise<AiResponseResult>;
  isConfigured(): boolean;
}

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
      throw new Error(`Endpoint returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.reply || data.content,
      suggestedFollowUps: data.suggestedFollowUps || [],
    };
  }
}

export class ContextualMentorEngine implements AiProvider {
  isConfigured(): boolean {
    return true;
  }

  async sendMessage(
    messages: ChatMessage[],
    context: LearnerContext,
    signal?: AbortSignal
  ): Promise<AiResponseResult> {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 350);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
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

    if (
      prompt.includes('today') ||
      prompt.includes('quest') ||
      prompt.includes('daily') ||
      prompt.includes('plan')
    ) {
      return {
        content: `### Today's Learning Objective: ${context.dailyQuestTopic || topic}

Recommended approach:

1. **Study Concept**:
   Read the guide from **${context.curatedResourceProvider || 'Curriculum Reference'}** on ${context.dailyQuestTopic || topic}.
   ${context.curatedResourceUrl ? `[View Lesson Guide](${context.curatedResourceUrl})` : ''}

2. **Hands-On Implementation**:
   ${context.dailyQuestObjective || 'Write working code implementing the primary primitive.'}

3. **Verification Checkpoint**:
   Test boundary cases, empty inputs, and error states before marking the quest complete.`,
        suggestedFollowUps: [
          'Give me a hint for today’s practice',
          'Explain the key concept in simple terms',
          'What are the common edge cases?',
        ],
      };
    }

    if (
      prompt.includes('hint') ||
      prompt.includes('stuck') ||
      prompt.includes('help me solve') ||
      prompt.includes('how to start')
    ) {
      return {
        content: `### Problem-Solving Guidance for **${topic}**

1. **Clarify Input & Expected Output**:
   - What is the expected shape and type?
   - What invariant must hold after each iteration or transformation?

2. **Core Intuition**:
   - Start with the naive or brute-force approach first.
   - Look for redundant operations, repeated computations, or unnecessary scans that can be eliminated.

3. **Implementation Step**:
   - Define the function signature and handle base conditions or edge inputs first.

Would you like a more specific code hint, or would you like to review your current implementation?`,
        suggestedFollowUps: [
          'Give me the next step clue',
          'Show me a minimal code skeleton',
          'What is the optimal time complexity?',
        ],
      };
    }

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
        content: `### Debugging Diagnostic for **${topic}**

Common checkpoints to review:

1. **Boundary & Off-By-One Errors**:
   - Check loop boundaries and indexing constraints.
   - For recursive logic, ensure the base case returns before subsequent calls.

2. **State & Mutation**:
   - Verify variables are not being mutated unexpectedly across scopes.
   - Ensure asynchronous operations and promises are properly resolved.

\`\`\`${context.trackId === 'dsa' ? 'cpp' : context.trackId === 'ai' ? 'python' : 'javascript'}
function verifyState(input) {
  if (!input) {
    console.error("Invariant violation: input is undefined or null");
    return;
  }
  // Safe state transition
}
\`\`\`

Share the relevant snippet and error message for a targeted diagnosis.`,
        suggestedFollowUps: [
          'Here is my code snippet (paste below)',
          'How do I write unit test cases for this?',
          'Explain common pitfalls for this topic',
        ],
      };
    }

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
          r => `• **[${r.title}](${r.url})** (${r.provider}, ~${r.estimatedTime})\n  ${r.whatYouWillLearn}${r.practiceUrl ? `\n  Practice: [${r.practiceTitle || 'Exercise'}](${r.practiceUrl})` : ''}`
        )
        .join('\n\n');

      return {
        content: `### Curated Resources for **${topic}**

${formattedResources || `• **[Official Documentation for ${topic}](${context.curatedResourceUrl || 'https://developer.mozilla.org/'})**`}`,
        suggestedFollowUps: [
          'Walk me through the primary concept',
          'What are the prerequisite topics for this?',
          'Give me a practice exercise',
        ],
      };
    }

    if (
      prompt.includes('next') ||
      prompt.includes('roadmap') ||
      prompt.includes('prereq') ||
      prompt.includes('skip') ||
      prompt.includes('why')
    ) {
      return {
        content: `### Curriculum Status: **${topic}**

- **Track**: ${track}
- **Progress**: ${context.completedSkillsCount} of ${context.totalSkillsCount} topics completed.

#### Importance
${topic} provides foundational concepts required for advanced modules in ${track}. Mastering it ensures smooth progression into complex application architectures.

#### Recommended Next Steps:
1. Finish the daily quest checklist for **${topic}**.
2. Complete the corresponding practice problem on ${primaryRes?.provider || 'the learning platform'}.
3. The roadmap will automatically unlock downstream dependent skills upon completion.`,
        suggestedFollowUps: [
          'Explain the concept of ' + topic,
          'Recommend a practice problem',
          'How does this topic apply in industry?',
        ],
      };
    }

    return {
      content: `### Concept Overview: **${topic}**

#### 1. Core Principle
${topic} provides structural patterns to organize and process information effectively, minimizing runtime cost and code duplication.

#### 2. Implementation Pattern
\`\`\`${context.trackId === 'dsa' ? 'cpp' : context.trackId === 'ai' ? 'python' : 'javascript'}
${
  context.trackId === 'dsa'
    ? `#include <iostream>
#include <vector>

void solve() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    // Optimal traversal
}
`
    : context.trackId === 'ai'
    ? `import numpy as np

def process_features(X):
    return np.mean(X, axis=0)
`
    : `export function handleAction(state, payload) {
  return { ...state, ...payload };
}
`
}
\`\`\`

#### 3. Complexity
- **Time Complexity**: Standard operations target $O(N)$ or $O(N \\log N)$.
- **Space Complexity**: Target $O(1)$ auxiliary space when in-place transformation is viable.`,
      suggestedFollowUps: [
        'Walk through a step-by-step dry run',
        'Give me a coding hint for this topic',
        'Recommend official learning resources',
      ],
    };
  }
}
