# 🚀 DevCollab — Collaborative Coding, Redefined

DevCollab is a state-of-the-art, real-time collaborative developer platform that merges repository management, interactive kanban boards, real-time chats, developer social feeds, and Gemini-powered AI assistants into one gamified, high-performance ecosystem. 

Built with **React (Vite) + TypeScript + Node.js (Express) + MongoDB**, DevCollab empowers developers to create, import, edit, simulate, and review code collaboratively while earning experience points (XP) and raising their developer level.

---

## ✨ Features

### 📂 Real-time Repository Studio
* **In-Browser Editor:** Full-fledged code editing environment powered by the [Monaco Editor](https://github.com/suren-atoyan/monaco-react) featuring syntax highlighting, custom file themes, and responsive layout structures.
* **Commit-like Simplicity:** Create, edit, and delete files with commit-message histories that sync live to the database.
* **Import Engine:** Seamlessly clone public repositories directly from GitHub and GitLab (respects MongoDB size constraints and performs deep-directory tree conversion).
* **Fork & Star:** Clone existing repositories into your workspace, keep track of parent repositories, and star projects to bookmark them.
* **Repository Discussions:** Multi-threaded discussion panel embedded directly inside each repository for inline team brainstorming.

### 🔄 Dynamic Collaboration & WebSockets
* **Live Presence Indicators:** View online collaborators and workspace participants in real-time.
* **Typing Indicator Broadcasts:** See who is composing messages in repository chat channels instantly.
* **Synchronized Kanban Boards:** Drag-and-drop task boards powered by `@hello-pangea/dnd` that sync live changes to all active users via Socket.io.
* **Global Chat Network:** Join themed discussion rooms, reply directly to messages, delete messages, and keep track of active developer channels.

### 🤖 Gemini AI Developer Copilot
* **Code Explanations:** Deep structural explanations of your codebase snippets in markdown formatting.
* **Security & Performance Audit:** Scans your code for potential memory leaks, syntax errors, and provides refactoring suggestions.
* **Contextual AI Chatbot:** An overlay chatbot that references your active file context to answer questions, write test cases, or debug issues on the fly.
* **Runtime Compiler Simulator:** Simulates compiling and executing code in multiple programming languages (JavaScript, Python, C++, Java, etc.) to capture console stdout/stderr.

### 🎮 Gamification & Developer Social Feed
* **Level & XP Engine:** Earn **50 XP** for creating repositories, **10 XP** for file commits, and **5 XP** for other community engagements. Watch your level dynamically scale as you build!
* **Streak Tracking:** Keep your code streak alive with continuous daily contributions.
* **Developer Feed:** Post updates with tags, comment on posts, and like messages to interact with other developers in the system.
* **Interactive Profile Cards:** Show off your bio, tech stack, skills list, "Open to Work" status, portfolio links, experience timeline, and earned badges.

---

## 🛠️ Technology Stack

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS v4, Custom glassmorphism variables
* **Animations:** Framer Motion (micro-interactions, transitions, page entries)
* **Visuals:** TS Particles (interactive background particles), Lucide React (modern SVG iconography)
* **Libraries:** `@monaco-editor/react`, `@hello-pangea/dnd`, `socket.io-client`, `react-markdown`

### Backend
* **Runtime:** Node.js, Express, TypeScript
* **Database:** MongoDB via Mongoose
* **Sockets:** Socket.io (real-time bi-directional events)
* **Auth:** JSON Web Tokens (JWT), BcryptJS
* **AI Integration:** `@google/genai` (SDK utilizing the `gemini-2.5-flash` model)

---

## 📂 Repository Structure

```text
DevCollab-Project/
├── backend/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── index.ts          # Express & Socket.io server entry point
│   │   ├── models/           # Mongoose schemas (User, Repository, Post, Activity)
│   │   └── routes/           # REST API endpoints (Auth, Repo, Users, AI, Posts)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (Kanban, AI Chat, FileTree, etc.)
│   │   ├── contexts/         # React Contexts (Auth)
│   │   ├── pages/            # View pages (Dashboard, Auth, RepoStudio, Profile, Feed, etc.)
│   │   ├── App.tsx           # Page router configurations
│   │   └── main.tsx          # React application root
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/)
* [MongoDB](https://www.mongodb.com/) (either running locally or a MongoDB Atlas URI)
* A [Gemini API Key](https://aistudio.google.com/) for AI features.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd DevCollab-Project
```

### 2. Configure Backend
Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` root directory and populate it with your environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_signing_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start Backend Development Server
```bash
npm run dev
```
The backend server will launch on `http://localhost:5000` (or your configured `PORT`).

### 4. Configure Frontend
Navigate to the `frontend` directory:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The client app will launch at `http://localhost:5173`. You can override the backend URL if hosting elsewhere by setting `VITE_API_URL` in your deployment or environment variables (defaults to `http://localhost:5000`).

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new developer.
* `POST /api/auth/login` — Sign in and receive JWT token.

### Repositories (`/api/repos`)
* `GET /api/repos?type=personal|public` — Get your repositories or public repositories to explore.
* `POST /api/repos` — Create a new blank repository.
* `POST /api/repos/import` — Import code from public Git repositories (GitHub/GitLab).
* `GET /api/repos/:id` — Fetch full repository information, commits, and discussions.
* `POST /api/repos/:id/files` — Create or update a file (triggers a live commit).
* `DELETE /api/repos/:id/files` — Delete a file in a repository.
* `POST /api/repos/:id/kanban` — Sync Kanban task cards.
* `POST /api/repos/:id/star` — Toggle starred status.
* `POST /api/repos/:id/fork` — Fork repository to user's profile.
* `POST /api/repos/:id/discussions` — Post discussion message in the repository comments.

### Gemini AI Assistant (`/api/ai`)
* `POST /api/ai/explain` — Request structural code analysis.
* `POST /api/ai/review` — Review code for bugs, security holes, and style refactoring.
* `POST /api/ai/chat` — Chat with context-aware assistant.
* `POST /api/ai/run` — Simulates terminal execution of code snippets.

### Users & Social Profiles (`/api/users`)
* `GET /api/users/me` — Fetch current user details, calculating XP levels and streaks.
* `PUT /api/users/profile` — Update professional bio, stack, links, avatar.
* `GET /api/users/:username` — Fetch public user profiles.
* `GET /api/users/:username/activities` — Fetch contributions and history map.

### Social Feed (`/api/posts`)
* `GET /api/posts` — Fetch latest developer posts.
* `POST /api/posts` — Share code updates or technical posts.
* `POST /api/posts/:id/like` — Toggle likes on posts.
* `POST /api/posts/:id/comment` — Reply to posts.

---

## 🤝 Contribution Guidelines
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the ISC License. See `backend/package.json` and `frontend/package.json` for dependencies and authorization scopes.
