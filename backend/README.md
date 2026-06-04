# ⚙️ DevCollab Backend (Server)

This is the backend server module of the **DevCollab** platform. It handles the REST APIs, user authentication, database persistence, Gemini AI integrations, and real-time Socket.io connections.

For the full platform documentation, architecture diagram, and setup instructions, please visit the **[Main Project README](../README.md)**.

## 🛠️ Stack & Key Libraries

* **Node.js & Express** — Web application server.
* **TypeScript** — Strongly typed server development.
* **MongoDB & Mongoose** — Document store for users, repositories, activities, and posts.
* **Socket.io** — Real-time event transport layer (chats, typing feedback, Kanban status sync).
* **JWT & BcryptJS** — Secure password hashing and token-based API authentication.
* **@google/genai** — Official Google Gemini API client integration utilizing the `gemini-2.5-flash` model.

## 🚀 Running Locally

1. **Configure Environment Variables:**
   Create a `.env` file in this directory (refer to the [.env template](.env) for reference):
   ```env
   MONGODB_URI=your_mongodb_uri
   PORT=5000
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

4. **Production Build:**
   ```bash
   npm run build
   ```
   Compiles TypeScript into Node.js execution bundles inside the `dist/` directory.
