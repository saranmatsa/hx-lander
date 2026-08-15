# HX Lander

HX Lander is a full-stack waitlist experience for HX Engineering. It includes:

- A React + Vite frontend landing page and waitlist flow
- A Node.js + Express API server
- MongoDB-backed persistence with a local JSON fallback
- Token-based, passwordless waitlist position lookup and cancellation

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Express 4
- MongoDB Node Driver
- Tailwind CSS 4
- Motion + Three.js for UI animation

## Project Structure

- `/home/runner/work/hx-lander/hx-lander/src` – Frontend app and UI components
- `/home/runner/work/hx-lander/hx-lander/server` – Backend DB/email modules
- `/home/runner/work/hx-lander/hx-lander/mongodb` – MongoDB schema typings
- `/home/runner/work/hx-lander/hx-lander/data/waitlist.json` – Local fallback datastore
- `/home/runner/work/hx-lander/hx-lander/server.ts` – App/API server entrypoint

## Prerequisites

- Node.js 20+ (recommended)
- npm
- MongoDB instance (optional, app falls back to local JSON storage)

## Environment Variables

Copy `.env.example` to `.env.local` (or `.env`) and set values:

- `GEMINI_API_KEY` (optional, only needed for Gemini-powered features)
- `APP_URL` (optional)
- `MONGODB_URI` (optional but recommended for persistent multi-instance use)
- `MONGODB_DB_NAME` (optional, defaults in code)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (optional email delivery)

## Scripts

- `npm run dev` – Run Express + Vite in development
- `npm run build` – Build frontend and bundle server into `dist/server.cjs`
- `npm run start` – Start production bundle
- `npm run preview` – Preview Vite build
- `npm run lint` – TypeScript type-check (`tsc --noEmit`)
- `npm run clean` – Remove build artifacts

## Local Development

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - `cp .env.example .env.local`
   - update values in `.env.local`
3. Start development server:
   - `npm run dev`
4. Open the app:
   - `http://localhost:3000`

## API Overview

Server routes are defined in `/home/runner/work/hx-lander/hx-lander/server.ts`.

- `POST /api/waitlist` – Join waitlist and receive access token
- `POST /api/waitlist/join` – Alternate join endpoint
- `POST /api/waitlist/check-position` – Check position by token
- `POST /api/waitlist/cancel` – Cancel position by token
- `GET /api/waitlist/count` – Get active waitlist count
- `GET /api/waitlist/roster` – Get public roster
- `GET /api/waitlist/candidate` – Lookup candidate by email or candidateId
- `POST /api/waitlist/verify` – Verify email with code

## Notes

- Access tokens are hashed with SHA-256 before storage.
- If MongoDB is unavailable, data is read/written from `data/waitlist.json`.
- In production, static assets are served from `dist`.
