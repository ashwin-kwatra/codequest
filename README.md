# ⚡ CodeQuest
### *Turn "What should I learn?" into your first actionable step in 60 seconds.*

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

**CodeQuest** is a gamified, personalized coding career roadmap platform designed for college students and beginners who want to enter tech but don't know what to learn, where to start, or which career path fits them best.

Instead of generic course catalogs or chat assistants, CodeQuest pairs an **explainable roadmap generation engine** with a **Daily Quest-First habit loop** and **verified, topic-specific curated learning resources** for all 36 curriculum topics across DSA, Full Stack, and AI/ML.

---

## ✨ Key Features

### ⚡ Today's Quest — The Primary Habit Anchor
Redesigned with a **Quest-First dashboard hierarchy**, placing the learner's daily mission front and center:
- **Personalized Daily Quest Generation:** Tailored automatically to the learner's current track, satisfied prerequisites, and daily availability (30m, 1h, 2h, 3h+).
- **Interactive 3-Step Sequential Checklist:**
  1. **Study Concept (Learn):** Read the curated primary resource or documentation section.
  2. **Hands-On Practice (Practise):** Solve the direct companion exercise on Striver's sheet, LeetCode, MDN, or Kaggle.
  3. **Checkpoint Challenge (Challenge):** Complete a verifiable challenge to reinforce knowledge.
- **Direct Curated Resource Integration:** Every quest features an explicit link to verified official lessons and companion practice problems.
- **Anti-Duplication Progression:** Step progress and completion rewards (+50 XP bonus) are awarded idempotently once per calendar date, preventing XP farming.
- **7-Day Consistency History:** Visual weekly tracker showing daily quest checkmarks, active streaks, and total quests completed.
- **Continuous Learning:** Completed quests celebrate today's takeaway and allow launching the next quest early without altering past records.

### 📚 Centralized Curated Resource Catalogue (All 36 Topics)
Every single topic across all three tracks is backed by real, verified, typed external resources:
- **DSA / Coding Interviews:** Centered on [takeUforward Striver's A2Z DSA Sheet](https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet), covering arrays, recursion, linked lists, trees, graphs, greedy algorithms, dynamic programming, and interview patterns.
- **Full Stack Development:** Grounded in the official [MDN Web Docs Curriculum](https://developer.mozilla.org/en-US/curriculum/) for HTML, CSS, JavaScript, and DOM, plus [University of Helsinki's Full Stack Open](https://fullstackopen.com/en/) for React, Node.js, Express, MongoDB, Auth, and CI/CD.
- **AI / Machine Learning:** Anchored in [Google's Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) with companion Colab exercises, Pandas, NumPy, statistical pre-work, supervised learning, and neural network foundations.
- **Metadata for Every Entry:** Provider name, verified URL, resource type (`course`, `documentation`, `practice`, `video`), difficulty (`beginner`, `intermediate`, `advanced`), estimated duration, what the learner will gain, and companion practice links.

### ⏱️ 60-Second Onboarding Wizard
- Rapid 7-step guided assessment covering career clarity, interests, existing technical background, daily study availability, and target deadlines.
- Automatically infers one of three core learner archetypes without forcing rigid labels:
  - **Persona A (The Completely Lost Beginner):** Explores interests with zero prior coding experience; receives structured fundamentals.
  - **Persona B (The Directionless Learner):** Has scattered or basic skills; identifies transferable strengths and bridges gaps with a guiding portfolio project.
  - **Persona C (The Goal-Driven Learner):** Knows their target (e.g. FAANG coding interviews or Web Dev); gets an optimized prerequisite sequence.

### 🧠 Adaptive Roadmap Generation Engine
- **Prerequisite Dependency Graph:** Tracks explicit prerequisite requirements across 36 comprehensive skills.
- **Skill Fast-Tracking:** Identifies skills you already possess, skips redundant introductory topics, or allows fast-tracking via verification challenges.
- **Realistic Timeline Calculator:** Divides total curriculum hours by realistic weekly study availability, transparently flagging unrealistic deadlines and providing achievable milestone recommendations.
- **Seamless Track Switching:** Switch between tracks anytime without resetting earned XP or historical activity.

### 🎯 Three Focused Career Paths
1. **⚡ DSA / Coding Interviews (C++):**
   - *12 Skills:* C++ Fundamentals ➔ Big-O Complexity ➔ Arrays & Strings ➔ Searching & Sorting ➔ Hashing ➔ Recursion & Backtracking ➔ Linked Lists, Stacks & Queues ➔ Trees & BSTs ➔ Graphs & Traversals ➔ Greedy Algorithms ➔ Dynamic Programming ➔ FAANG Interview Patterns.
2. **🌐 Full Stack Development (JavaScript / React / Node):**
   - *12 Skills:* Semantic HTML/CSS ➔ JavaScript Fundamentals ➔ DOM Manipulation ➔ Git & GitHub ➔ React Fundamentals ➔ APIs & Async JS ➔ Backend with Node/Express ➔ RESTful APIs ➔ Relational Databases (SQL) ➔ Authentication & JWT ➔ Testing & Deployment ➔ Capstone Showcase.
3. **🤖 AI / Machine Learning (Python):**
   - *12 Skills:* Python Foundations ➔ Functions & OOP ➔ NumPy ➔ Pandas Wrangling ➔ Data Visualization (Seaborn/Matplotlib) ➔ Statistics & Probability ➔ Data Preprocessing ➔ Supervised Learning ➔ Model Evaluation & ROC-AUC ➔ Feature Engineering & Pipelines ➔ Neural Networks ➔ Model Deployment with FastAPI.

### 🎮 Gamification & Daily Streaks
- **Progression & XP:** Earn XP on every completed task (15–40 XP), quest step (10 XP), daily quest completion bonus (+50 XP), challenge, and project milestone (50–100 XP).
- **Calendar-Based Streaks:** Streaks are calculated using local calendar days (`YYYY-MM-DD`). Consecutive calendar days advance the streak; missed calendar days safely reset the streak; same-day completions never inflate it.
- **9 Achievement Badges:** Unlock badges such as *First Steps*, *On a Roll (3-Day Streak)*, *Week Warrior (7-Day Streak)*, *Problem Solver*, *Builder*, *Skill Unlocked*, *Ship It*, and *Speed Learner*.
- **Interactive Feedback:** Animated floating XP bursts (`+XP`) and celebration toast notifications.

### 🏗️ "Build My Project" Portfolio Trackers
Each path features 3 graduated starter projects (9 total) that evolve as you learn:
- **DSA:** *Practice & Revision Tracker*, *Interactive Algorithm Visualizer*, *FAANG Pattern Dashboard*.
- **Full Stack:** *Personal Portfolio & Blog*, *Student Productivity & Habit Dashboard*, *Campus Task & Event Collaboration Hub*.
- **AI/ML:** *Exploratory Data Analysis Dashboard*, *Academic Performance Predictor*, *ML-Powered Prediction Web Application*.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom CSS Design System with dark-first developer aesthetic (Charcoal `#0a0b0f`, Purple `#8b5cf6`, Cyan `#22d3ee`, Neon Green `#4ade80`).
- **State & Storage:** Persistent `localStorage` abstraction layer with demo reset and sample persona seeders.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/codequest.git
   cd codequest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev -- --port 3000
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build
To create an optimized production bundle:
```bash
npm run build
```

---

## 🧪 Hackathon Demo & Testing Guide

For quick evaluation during live demonstrations or judging:

1. **Test Pre-configured Personas (1-Click):**
   - On the [Landing Page](http://localhost:3000), locate the **Instant Hackathon Demo Profiles** box right beneath the hero buttons.
   - Click **Persona A (Taylor - Lost Beginner)**, **Persona B (Jordan - Directionless AI/ML)**, or **Persona C (Alex - Goal-Driven DSA)** to instantly load a realistic state with completed milestones, streak history, and active daily quests.
2. **Test Daily Quest Hero & Checklist:**
   - In the **Dashboard**, interact with the **Today's Quest** hero card.
   - Click the checkmarks for **Step 1 (Study Concept)** and **Step 2 (Hands-On Practice)** to see live XP bursts.
   - Check off **Step 3 (Challenge)** to unlock the celebration state, key takeaways summary, and +50 XP completion bonus.
   - Click **Start Next Quest Early ⚡** to demonstrate advancing to the next curriculum topic without losing history.
3. **Test Curated Resources:**
   - Click **"Open Resource ↗"** on any quest or go to **Roadmap** and click **"Resources & Learn"** on any topic.
   - Notice direct links to Striver's A2Z DSA sheet, MDN Curriculum, Full Stack Open, or Google ML Crash Course, complete with companion practice problems.
4. **Test Adaptive Prerequisite Verification:**
   - In the **Roadmap**, click on any unlocked skill and choose **"★ I Already Know This (Verify & Skip)"**. Complete the quick checkpoint to verify how dependent skills unlock automatically.
5. **Reset Demo Data:**
   - Click **Reset Demo** in the sidebar or profile page to clear `localStorage` and restart anytime.

---

## 📂 Project Structure

```
├── src/
│   ├── components/         # Reusable UI components (Sidebar, etc.)
│   ├── context/            # AppContext (global gamification & quest actions)
│   ├── data/
│   │   ├── curriculum.ts   # Core track skills, tasks, and portfolio projects
│   │   └── resources.ts    # Centralized, typed curated resources catalogue (36 topics)
│   ├── engine/
│   │   ├── dailyQuest.ts   # Daily quest generator & calendar date engine
│   │   └── recommendation.ts # Timeline calculator & archetype inference
│   ├── pages/
│   │   ├── Landing.tsx     # Hero page & demo profile launchers
│   │   ├── Onboarding.tsx  # 7-step career assessment wizard
│   │   ├── Recommendation.tsx # Path evaluation & first task preview
│   │   ├── Dashboard.tsx   # Quest-First Hero, 7-day history, stats & missions
│   │   ├── Roadmap.tsx     # Connected skill tree with curated resource modals
│   │   ├── TaskDetail.tsx  # Step-by-step instructions, curated guides & XP triggers
│   │   ├── Projects.tsx    # Curated portfolio projects & milestone checklists
│   │   └── Profile.tsx     # Stats, achievements, persona card & track switcher
│   ├── store/              # localStorage persistence layer & calendar streak logic
│   ├── types.ts            # Core TypeScript interfaces (CuratedResource, DailyQuest, etc.)
│   ├── App.tsx             # Route definitions & layout wrappers
│   ├── index.css           # Global design system & animations
│   └── main.tsx            # Application entry point
├── package.json
└── vite.config.ts
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
