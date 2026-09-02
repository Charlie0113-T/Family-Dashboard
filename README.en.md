<p align="center">
  <img src="public/logo.svg" width="96" height="96" alt="Family Dashboard Logo" />
</p>

<h1 align="center">Family Dashboard</h1>

<p align="center">A privacy-first, fully offline family management dashboard — no server required, your data never leaves the browser.</p>

<p align="center">
  <span>English</span> ·
  <a href="README.md"><b>简体中文</b></a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-000000.svg?style=flat-square&labelColor=0a0a0a" />
  <img alt="React" src="https://img.shields.io/badge/React-19-000000.svg?style=flat-square&labelColor=0a0a0a&logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-000000.svg?style=flat-square&labelColor=0a0a0a&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-000000.svg?style=flat-square&labelColor=0a0a0a&logo=vite&logoColor=white" />
  <img alt="Local First" src="https://img.shields.io/badge/storage-100%25%20local-000000.svg?style=flat-square&labelColor=0a0a0a" />
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-000000.svg?style=flat-square&labelColor=0a0a0a" />
</p>

---

**Family Dashboard** is a privacy-first family management dashboard that runs entirely in your local browser — no backend server needed. It ships with master-password protection and an extensible, plugin-style module architecture to help family members manage everyday things in one place.

## ✨ Features

- 🔐 **Master password protection** — a single password locks and unlocks the entire dashboard
- 📱 **Trusted device** — optionally trust "this device for 7 days" so refreshing the page won't ask for the password again; you can still lock the dashboard instantly at any time
- 🧩 **Modular architecture** — self-registering, plugin-style modules that are easy to extend
- 🔒 **Client-side encryption** — sensitive modules (Diary, Accounting) are encrypted with AES-GCM before being persisted; the key is derived from the master password via PBKDF2
- 🕐 **Local-timezone dates** — every "today" is resolved in local time, so late-night entries never get shifted to the next day by UTC offsets
- 💾 **Local-first storage** — all data lives in the browser's `localStorage` and works fully offline
- ✨ **anime.js powered motion** — lightweight animations for card entrances, month-switch swipes, and number counters, respecting the OS "reduce motion" setting
- 🤖 **AI integration ready** — a local LLM interface (Ollama/llama.cpp) is already scaffolded, stay tuned

## 📦 Built-in Modules

| Module | Description | Encrypted |
|------|------|----------|
| ✅ **Tasks** | A shared family to-do list — add, complete, and delete items | No |
| 📔 **Diary** | Date-navigable daily journal with autosave | ✅ Yes |
| 😊 **Mood** | Daily mood check-in (5 levels) with a 7-day history | No |
| 💪 **Health** | Track water intake, sleep duration, and step count | No |
| 💰 **Accounting** | Monthly income/expense tracking with swipe navigation between months; the entry form date always follows the month currently being viewed, so you never end up "viewing February but recording to September" | ✅ Yes |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or another package manager

### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

Open `http://localhost:5173` in your browser. On first visit you'll be asked to set a master password.

## 🏗️ Project Structure

```
src/
├── App.tsx                     # Root component: routing config & module registration entry
├── main.tsx                    # React app entry point
├── components/                 # Shared UI components
│   ├── Layout.tsx              # Global layout (body + footer)
│   ├── LockScreen.tsx          # Password setup / unlock screen
│   └── ModuleCard.tsx          # Dashboard module card
├── pages/                      # Route-level pages
│   ├── Dashboard.tsx           # Main dashboard (module grid)
│   └── ModulePage.tsx          # Dynamic page for a single module
├── modules/                    # Feature modules
│   ├── todo/TodoModule.tsx     # Tasks module
│   ├── diary/DiaryModule.tsx   # Diary module (encrypted)
│   ├── mood/MoodModule.tsx     # Mood module
│   ├── health/HealthModule.tsx # Health module
│   └── accounting/AccountingModule.tsx # Accounting module (monthly income/expense)
├── module-system/              # Module system
│   ├── ModuleRegistry.ts       # Central module registry
│   └── ModuleTypes.ts          # Module type definitions
├── core/                       # Core service layer
│   ├── auth/AuthService.ts     # Master password auth (SHA-256)
│   ├── data/DataService.ts     # localStorage data service
│   ├── encryption/             # AES-GCM encryption service
│   └── ai/AIService.ts         # AI interface (scaffolded)
├── store/
│   └── useAppStore.ts          # Zustand global state
└── utils/
    └── helpers.ts              # Date utility functions
```

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------|------|------|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool |
| React Router DOM | 7 | Client-side routing |
| Zustand | 5 | Global state management |
| anime.js | 4 | UI animation |
| Web Crypto API | Built into the browser | AES-GCM encryption |
| UUID | 13 | Unique ID generation |

## 🧩 Adding a Custom Module

1. Create a new module directory under `src/modules/` with a component file:

```tsx
// src/modules/mymodule/MyModule.tsx
import { ModuleRegistry } from '../../module-system/ModuleRegistry'

function MyModule() {
  return <div>My module content</div>
}

ModuleRegistry.register({
  id: 'mymodule',
  name: 'My Module',
  icon: '⭐',
  description: 'A short description of the module',
  encrypted: false,
  Component: MyModule,
})

export default MyModule
```

2. Import the module in `src/App.tsx`:

```tsx
import './modules/mymodule/MyModule'
```

The module will automatically show up on the dashboard.

## 🔑 Security Notes

- **Master password**: stored as a SHA-256 hash, used only for authentication
- **Data encryption**: modules marked as encrypted (Diary, Accounting) are encrypted with AES-GCM before being written to `localStorage`, so only ciphertext ever touches disk. The key is derived from the master password via PBKDF2 (100,000 iterations) and kept in memory only. Plaintext diary data left over from older versions can still be read, and is automatically re-encrypted the next time it's opened or saved
- **Local storage**: all data is stored in `localStorage` under the `fd_` prefix and is never uploaded to any server
- **Session management**: the in-memory key is cleared immediately when the dashboard is locked
- **Trusted device**: checking "trust this device for 7 days" saves the unlock key in that device's `localStorage`, so refreshing the page won't require the password again during that window. Anyone with access to that browser can open the dashboard during that time, so only enable this on trusted devices at home; clicking "Lock" in the top-right corner immediately locks the dashboard and revokes the device's trusted status

## 📄 License

This project is open source under the Apache License 2.0.
