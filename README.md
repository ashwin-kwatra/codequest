# CodeQuest

A structured developer learning platform that turns career goals into actionable daily quests, verified learning resources, and portfolio deliverables.

---

## Overview

CodeQuest bridges the gap between scattered course catalogs and structured career roadmaps. It pairs an explainable roadmap generation engine with a daily habit loop, verified learning resources across 36 core computer science topics, and an interactive coding mentor.

Learners select from three core tracks:
- **DSA & Coding Interviews (C++)**: Algorithms, algorithmic paradigms, and interview patterns.
- **Full Stack Development (JavaScript / React / Node.js)**: Modern web foundations, APIs, databases, and deployment.
- **AI & Machine Learning (Python)**: Data wrangling, statistics, supervised learning, and neural network foundations.

---

## Core Features

### Daily Quest Engine
- **Targeted Learning Objectives**: Generates daily study missions tied directly to the learner's active roadmap position and time commitment.
- **Sequential Checklist**: Structured 3-step loop: Concept Study &rarr; Hands-on Practice &rarr; Verification Challenge.
- **Verified Resource Links**: Direct links to documentation and companion practice problems for every topic.
- **Streak & Consistency Tracking**: Calendar-based streak tracking with idempotent reward distribution.

### Curated Resource Catalogue
A centralized, typed catalogue covering all 36 curriculum topics with verified external resources:
- **DSA**: takeUforward (Striver's A2Z DSA Sheet), LeetCode companion exercises.
- **Full Stack**: MDN Web Docs Curriculum and University of Helsinki's Full Stack Open.
- **AI / ML**: Google Machine Learning Crash Course and companion Kaggle / Colab exercises.

### In-App Coding Mentor
- **Context-Aware Assistance**: Detects the active curriculum track, current lesson, daily quest, and active project milestone.
- **Pedagogical Support**: Explains concepts with code snippets and complexity analyses, provides progressive hints without spoiling answers, and aids in debugging.
- **Flexible Provider Architecture**: Runs on a built-in offline engine by default, with support for custom server API endpoints (`/api/chat`).

### Adaptive Roadmaps & Portfolio Deliverables
- **Prerequisite Dependency Graph**: Unlocks downstream skills as prerequisite milestones are completed.
- **Skill Fast-Tracking**: Verify existing knowledge to skip redundant introductory topics.
- **Milestone-Driven Projects**: Real-world portfolio applications with incremental implementation milestones.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 8 |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **State & Persistence** | Context API + `localStorage` / `sessionStorage` |
| **Styling** | Custom CSS Design System |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashwin-kwatra/codequest.git
   cd codequest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser:
   Visit [http://localhost:5173](http://localhost:5173) (or the port indicated in your terminal).

### Production Build

```bash
npm run build
```

---

## Project Structure

```
codequest/
├── src/
│   ├── components/
│   │   ├── AiAssistant/     # Collapsible assistant panel, floating launcher, markdown parser
│   │   ├── Sidebar.tsx      # Application navigation sidebar
│   │   └── ...
│   ├── context/
│   │   ├── AppContext.tsx   # Global application state, progress, and gamification
│   │   └── AiContext.tsx    # Mentor panel state, messaging, and provider integration
│   ├── data/
│   │   ├── curriculum.ts    # 36 curriculum topics, tasks, and project milestones
│   │   └── resources.ts     # Centralized, typed curated learning resources
│   ├── engine/
│   │   ├── aiContext.ts     # Learner context resolution (track, topic, quest, project)
│   │   ├── aiProvider.ts    # Assistant provider abstraction and offline reasoning engine
│   │   ├── dailyQuest.ts    # Daily quest generation and date rollover logic
│   │   └── recommendation.ts# Timeline calculation and career track recommendations
│   ├── pages/
│   │   ├── Landing.tsx      # Welcome page and profile launchers
│   │   ├── Onboarding.tsx   # Guided 7-step career assessment
│   │   ├── Recommendation.tsx# Path evaluation and curriculum preview
│   │   ├── Dashboard.tsx    # Workspace home, daily quest card, and activity history
│   │   ├── Roadmap.tsx      # Visual curriculum tree with topic resource drawers
│   │   ├── TaskDetail.tsx   # Lesson instructions, companion links, and hints
│   │   ├── Projects.tsx     # Portfolio project workspaces and milestone checklists
│   │   └── Profile.tsx      # User statistics, achievements, and track settings
│   ├── store/
│   │   └── storage.ts       # Persistence layer and calendar streak calculations
│   ├── types.ts             # TypeScript interfaces and domain models
│   ├── App.tsx              # Application shell and route configuration
│   └── index.css            # Design system, layout variables, and typography
├── package.json
└── vite.config.ts
```

---

## License

MIT
