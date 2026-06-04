# 💻 DevCollab Frontend (Client)

This is the frontend client module of the **DevCollab** platform. It is built as a Single Page Application (SPA) using React, TypeScript, Vite, and Tailwind CSS.

For the full platform documentation, architecture diagram, and setup instructions, please visit the **[Main Project README](../README.md)**.

## 🛠️ Stack & Key Libraries

* **React 19 & TypeScript** — Core application framework.
* **Tailwind CSS v4 & custom HSL colors** — Glassmorphic, dark-mode design system.
* **Framer Motion** — Smooth transitions, page entry animations, and hover micro-animations.
* **TS Particles** — Interactive, modern particle background context.
* **Monaco Editor (`@monaco-editor/react`)** — Rich browser-based code editing.
* **Socket.io Client** — Real-time event synchronization (chats, Kanban board, user presence).
* **React Markdown** — Elegant parsing of AI code reviews and comments.
* **Drag-and-Drop (`@hello-pangea/dnd`)** — Handles column transitions on Kanban boards.

## 🚀 Running Locally

Ensure the [Backend service](../backend) is configured and running.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```
   The development client will run at `http://localhost:5173`.

3. **Production build:**
   ```bash
   npm run build
   ```
   Generates a static web bundle inside `dist/`.
