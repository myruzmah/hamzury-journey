# Hamzury — Scalable Public Front Door & Applicant Portal

Modern, scalable web application for **Hamzury Innovation Hub**. Built with a modular ES6 architecture, optimized for instant hosting on **Vercel**, with **Google Firebase Cloud Firestore** for database records and **Cloudinary** for fast CDN storage of transfer receipts and placement letters.

---

## Features

- **Scalable Frontend Architecture**: Built with Vite and modular ES6 modules. Instant HMR in development and optimized production bundling for Vercel.
- **Adaptive Diagnostic Engine ("Guide Me")**: Multi-dimensional diagnostic logic (Direction, Experience, Age) calculating optimal path placement.
- **Interactive Multi-Step Application Wizard**:
  - Full support for 5 Routes (Junior Innovator, Innovator → CEO, CEO → Founder, Founder → Ecosystem, SIWES / Internship) and 14 career tracks.
  - Step-by-step guidance, placement duration, and prerequisite checks.
  - Receipt uploads with live progress bar.
  - Instant printable official application slip generation.
- **Live Cloud Status Portal**: Applicants can enter their reference code (`HMZ-2026-XXXXX`) to check live payment verification status and intake dates directly from Cloud Firestore.
- **Cloud Firestore Database**:
  - `applications`: Persists applicant profiles, track choices, payment verification status, Cloudinary receipt URLs, and timestamps.
  - `partnerships`: Captures corporate, school, and organization partnership requests.
  - `sponsorships`: Captures donor and impact sponsorships.
  - `treasury`: Live records for monthly public cohorts and evidence ledger.
- **Cloudinary Storage**: High-speed CDN storage for bank transfer receipts and SIWES school placement letters with real-time upload progress.
- **Graceful Fallback Mode**: If Cloudinary or Firebase credentials are not yet configured in local testing, the platform falls back to client-side data URLs without crashing.

---

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the template and fill in your Cloudinary upload preset (Firebase credentials are pre-configured):
```bash
cp .env.example .env
```
*(See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for step-by-step instructions on setting up an unsigned upload preset in Cloudinary).*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Vercel Deployment

### Build Locally
```bash
npm run build
```
The optimized production bundle is generated in the `dist/` directory.

### Deploying to Vercel
This repository is pre-configured for zero-friction Vercel hosting via `vercel.json`:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. In Project Settings -> **Environment Variables**, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Click **Deploy**. Vercel will build the frontend automatically and serve it with global edge CDN caching.
