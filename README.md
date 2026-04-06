<div align="center">

# Parallel Paths

### A full-stack architectural portfolio with a headless CMS — built for the modern web.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://parallelpaths.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vite.dev)

</div>

---

## Overview

**Parallel Paths** is a production-deployed portfolio platform for architect **Parag Jadhav**. It combines a visually immersive public-facing site with a fully functional, auth-protected Content Management System — enabling real-time project publishing, page asset management, and client inquiry tracking, all without touching the codebase after deployment.

> **Live Site →** [https://parallelpaths.vercel.app/](https://parallelpaths.vercel.app/)

---

## The Problem

Static portfolio sites break when they need to change. Every project update, image swap, or new inquiry meant either digging into code or paying for a heavyweight CMS. Architects need a system that feels premium to clients and effortless to manage — simultaneously.

## The Solution

A JAMstack architecture where the public site is a fast, animated React SPA backed by Firebase Firestore as a real-time database. A protected `/admin` route serves as the full CMS — no third-party dashboard, no plugins, no vendor lock-in.

---

## Features

### Public Site
- **Animated Hero** — Full-viewport entry with Framer Motion stagger animations and a dynamically fetched hero image from Firestore
- **Interactive Gallery** — `CardStack` component with drag-to-navigate, auto-advance, depth/tilt effects, and dot-navigation
- **Project Detail Pages** — Dynamic routes (`/gallery/:id`) rendering per-project: featured image, philosophy, spec sheet, multi-image Bento grid, and optional embeddable Spline 3D model
- **About Page** — Dual-theme (dark + light) editorial layout with Firestore-managed portrait and philosophy images
- **Services Page** — Animated stats counter and a live-updatable floating architectural model image
- **Contact Form** — Submissions written directly to Firestore `contacts` collection; custom animated dropdown for project type selection
- **SEO** — Per-route `<title>` and `<meta description>` managed via `react-helmet-async`; admin panel excluded via `noindex`
- **Performance** — All pages lazy-loaded via `React.lazy` + `Suspense`; images use `loading="lazy"` and `decoding="async"`

### Admin CMS (`/admin`)
- **Firebase Auth** — Email/password authentication; session persists via `onAuthStateChanged`; back-button access blocked on logout
- **Project Management** — Full CRUD: create, update, delete projects with multi-image upload, category, subtitle, materials, location, scale, completion date, and Spline 3D URL
- **In-Browser Image Cropping** — `react-easy-crop` integration with canvas blob generation before upload
- **External Image Hosting** — Crops uploaded to ImgBB API; CDN URLs stored in Firestore (keeps Firebase Storage quota free)
- **Page Content Control** — Live update of Home hero, Services model, and three About page images — all without redeployment
- **Inquiry Inbox** — View all contact form submissions with sender, email, message preview, and timestamp

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Routing** | React Router DOM v7 |
| **Animation** | Framer Motion |
| **Styling** | Tailwind CSS v4 |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Image Hosting** | ImgBB API |
| **SEO** | react-helmet-async |
| **Icons** | Material Symbols (Google), Lucide React |
| **Image Cropping** | react-easy-crop |
| **Deployment** | Vercel (SPA rewrites configured) |

---

## Architecture

```
Browser (React SPA)
    │
    ├── Public Routes           → Reads from Firestore (projects, settings)
    │       ├── /               → Home (hero image from settings)
    │       ├── /gallery        → CardStack (live Firestore data)
    │       ├── /gallery/:id    → ProjectDetails (single doc fetch)
    │       ├── /services       → Services (model image from settings)
    │       ├── /about          → About (portrait + philosophy from settings)
    │       └── /contact        → Contact (writes to contacts collection)
    │
    └── Protected Route
            └── /admin          → Admin CMS (Firebase Auth gate)
                    ├── Project CRUD  → Firestore + ImgBB API
                    ├── Image Upload  → react-easy-crop → ImgBB → Firestore
                    └── Inbox View    → Reads contacts collection

Firebase Firestore Collections:
    ├── projects/   { title, subtitle, category, philosophy, images[], mainImage,
    │                 location, scale, completion, materials, splineUrl, createdAt }
    ├── settings/   { homeHero, servicesModel, aboutPortrait, aboutPhilosophy,
    │                 aboutResilience }
    └── contacts/   { name, email, message, createdAt }
```

**Key design decisions:**
- All-client-side rendering keeps the infrastructure cost at $0 — no backend server required
- ImgBB for image storage eliminates Firebase Storage egress costs while maintaining a CDN
- Firestore Security Rules enforce auth on all writes; public reads only where necessary (`projects`, `settings`, `contacts.create`)

---

## Folder Structure

```
/
├── api/
│   └── upload.js              # Vercel serverless function (ImgBB proxy)
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── blocks/
│   │   │   └── interactive-bento-gallery.jsx   # Lightbox Bento grid
│   │   ├── ui/
│   │   │   ├── CardStack.jsx                   # 3D stacked card gallery
│   │   │   └── dropdown-01.jsx                 # Animated custom dropdown
│   │   ├── Footer.jsx
│   │   ├── ImageCropModal.jsx                  # In-browser crop UI
│   │   ├── Navbar.jsx
│   │   └── ProjectModal.jsx                    # Create/Edit project form
│   ├── firebase/
│   │   ├── config.js                          # Firebase app initialization
│   │   └── services/
│   │       ├── authService.js
│   │       ├── contactService.js
│   │       ├── imgbbService.js
│   │       ├── projectService.js
│   │       ├── settingsService.js
│   │       └── storageService.js
│   ├── layout/
│   │   └── MainLayout.jsx                     # Navbar + Outlet wrapper
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Admin.jsx                          # CMS dashboard
│   │   ├── Contact.jsx
│   │   ├── Gallery.jsx
│   │   ├── Home.jsx
│   │   ├── ProjectDetails.jsx
│   │   └── Services.jsx
│   ├── utils/
│   │   └── cropImage.js                       # Canvas crop utility
│   ├── App.jsx                                # Route definitions
│   ├── index.css                              # Design tokens + global styles
│   └── main.jsx                              # App entry point
├── firestore.rules                            # Firestore security rules
├── vercel.json                                # SPA rewrite config
├── .env.example                              # Environment variable template
└── vite.config.js
```

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- A Firebase project (Firestore + Authentication enabled)
- An ImgBB account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/ankit8801/paragjadhavarchitect-portfolio.git
cd paragjadhavarchitect-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in your credentials (see [Environment Variables](#environment-variables)).

### 4. Start the dev server
```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a template:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# ImgBB Image Hosting
VITE_IMGBB_API_KEY=
```

> **Note:** All variables prefixed with `VITE_` are inlined at build time by Vite and are safe for client-side use. They are not secret — your Firebase project is secured at the Firestore Rules level, not by hiding the API key.

On Vercel, set these same variables in **Project → Settings → Environment Variables**.

---

## Key Highlights

- **No CMS vendor dependency.** The entire content management layer is custom-built on Firebase — no Contentful, Strapi, or Sanity subscription required.
- **Zero-server-cost architecture.** The app runs entirely on Vercel's free tier + Firebase's Spark plan. Monthly infra cost: $0.
- **In-browser image processing.** Files are cropped, converted to a Canvas blob, and uploaded to a CDN — all inside the browser, with zero backend compute.
- **Firestore Security Rules as the auth layer.** Public reads are explicitly scoped per collection; all write mutations require a valid Firebase Auth session — enforced at the database level, not just the UI.
- **SEO-aware SPA.** Every route defines its own `<title>` and `<meta description>`. The admin panel is explicitly `noindex`ed.
- **Spline 3D embed with validation.** The project detail page validates Spline URLs at render time and shows a graceful fallback UI for invalid or private model links.
- **Performance-first code splitting.** Every page is a lazy-loaded chunk via `React.lazy`. The initial bundle delivers only what's needed for the entry route.

---

## Screenshots

| Page | Description |
|---|---|
| **Home** | Full-viewport animated hero with dynamic Firestore image |
| **Gallery** | Interactive 3D CardStack with auto-advance and drag support |
| **Project Detail** | Bento image grid + philosophy spec sheet + optional Spline 3D embed |
| **About** | Dual-theme editorial layout with signature animation |
| **Admin — Projects** | CRUD table with inline edit/delete actions |
| **Admin — Page Content** | Live image management for all site sections |
| **Admin — Inquiries** | Contact form submission inbox |

> _To add screenshots: drop images into `/public/screenshots/` and replace this table with `![caption](./public/screenshots/filename.png)` links._

---

## Future Improvements

- **Framer Motion page transitions** — Animate route changes with `AnimatePresence` exit variants (scaffold already in place in `App.jsx`)
- **Firestore real-time listeners** — Replace one-time `getDocs` fetches with `onSnapshot` to push project updates to the gallery without a page refresh
- **Image optimization pipeline** — Compress and convert uploads to WebP before sending to ImgBB to reduce CDN payload
- **TypeScript migration** — Incrementally add type safety to the service layer and component props (dev dependency already installed)
- **Project visibility toggle** — Add a `published: boolean` field to Firestore and filter the public gallery accordingly, enabling draft projects in the admin
- **Inquiry status management** — Mark inquiries as read/replied directly in the admin inbox

---

## Author

**Parag Jadhav**  
Architect & Digital Creator — building spaces and experiences that are timeless, intentional, and deeply human.

[![Portfolio](https://img.shields.io/badge/Portfolio-Live-black?style=flat-square)](https://paragjadhavarchitect-portfolio.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-ankit8801-181717?style=flat-square&logo=github)](https://github.com/ankit8801)

---

<div align="center">
<sub>Built with React, Firebase, and deliberate design decisions.</sub>
</div>
