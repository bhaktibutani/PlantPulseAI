# PlantPulse AI

PlantPulse AI is an AI-assisted plant-care application for farmers and urban gardeners. It combines plant image analysis and conversational plant-care guidance with account-based growing activity.

## Implemented features

- Farmer and Urban Gardener/Planner account roles, registration, and sign-in.
- Server-side password hashing with bcrypt and JWT-based sessions.
- Gemini-powered plant image analysis and Plant Doctor chat.
- English, Gujarati, and Hindi guidance in the plant-care flows.
- Plant, task, and activity-history features backed by MySQL when available.
- A local JSON fallback store when MySQL is unavailable.

## Technology

- React, TypeScript, and Vite for the frontend.
- Express and TypeScript for the API server.
- MySQL through `mysql2`.
- Google Gemini through `@google/genai`.

## Prerequisites

- Node.js compatible with the installed Vite version.
- npm.
- MySQL or MariaDB for database-backed persistence (XAMPP is one local option).
- A Gemini API key for AI analysis, chat, and recommendations.

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file:

   ```sh
   # Windows PowerShell
   Copy-Item .env.example .env
   ```

3. Edit `.env` on your computer. Set `GEMINI_API_KEY` to your Gemini API key and set `JWT_SECRET` to a private random value of at least 32 characters. Keep `.env` private; it is excluded from Git. For example, generate a value locally with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

   Do not commit or share the generated value. If you use the XAMPP default MySQL account, set `DB_USER=root` and leave `DB_PASSWORD` empty in your local `.env`.

4. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for your MySQL installation. The server creates the database and required tables with `CREATE ... IF NOT EXISTS` when it connects. Alternatively, import the supplied `database.sql` schema using MySQL or phpMyAdmin.

5. Start the full-stack development server:

   ```sh
   npm run dev
   ```

   The server defaults to `http://localhost:3000`. It serves the API and the Vite development frontend together.

6. Check TypeScript and build the frontend:

   ```sh
   npm run lint
   npm run build
   ```

## Environment variables

See `.env.example` for placeholder settings. The Gemini key is read by the server from `GEMINI_API_KEY`; it is not a frontend build-time variable. AI endpoints return a configuration error when the key is missing. Never put real credentials in `.env.example` or frontend source files.

The backend reads `JWT_SECRET` to sign and verify authentication tokens and will not start if it is missing or shorter than 32 characters. Changing it invalidates tokens signed with the previous value, so users may need to sign in again.

## Database and local data

`database.sql` contains the MySQL schema for users, activity history, plants, and care tasks. The server also creates these tables automatically if the configured database is reachable. If MySQL is unavailable, the app can use `.data/fallback_db.json` for local persistence; `.data/` is ignored by Git because it may contain personal information.

Do not commit `.env`, local database files, `.data/`, dependencies, or build output.
