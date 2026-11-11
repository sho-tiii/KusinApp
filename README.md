<div align="center">
  <img src="web/public/assets/kusinapp-logo-horizontal.png" alt="KusinApp Logo" width="280" />

  <h3>Smart Filipino Meal Planning & Pantry Management System</h3>
  <p><i>Lasang Pinoy sa Bawat Luto — Balanced Nutrition & Smart Budgeting for Filipino Households.</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-13-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Android-Kotlin-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android" />
  </p>
</div>

---

## Overview

**KusinApp** is a cross-platform meal planning and kitchen inventory application designed for Filipino households, solo meal preppers, and health-conscious home cooks. It combines health-aware recipe curation with real-time pantry tracking and localized market cost estimation.

### Key Features
- **Personalized Health Onboarding** — Computes BMI and daily Basal Metabolic Rate (BMR) via the Mifflin-St Jeor equation alongside dietary goals and health conditions.
- **Smart Pantry & Spoilage Tracking** — Monitors household ingredients, quantities, and expiration dates to reduce food waste.
- **Budget-Conscious Meal Planning** — Generates automated grocery lists with local Philippine market price benchmarks (*palengke* vs. supermarket).
- **Unified Authentication & Role Governance** — Supports Email/Password, Google OAuth, OTP password recovery, and dedicated Admin & Super Admin portals.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | React 19, Vite, Tailwind CSS |
| **Mobile App** | Native Android (Kotlin / Java) |
| **Backend & Auth** | Firebase Authentication, Firebase Realtime Database |
| **Email Service** | Resend / EmailJS REST API |

---

## Project Structure

```text
KusinApp/
├── web/                  # React + Vite + Tailwind CSS web application
│   ├── public/           # Static brand assets and icons
│   ├── src/
│   │   ├── components/   # Auth, Onboarding, Admin, and Common UI components
│   │   ├── config/       # Firebase Web SDK initialization
│   │   ├── services/     # Auth, Admin, and Email services
│   │   ├── App.jsx       # Root application and portal router
│   │   └── main.jsx      # Application entry point
│   ├── .env.example      # Environment variable template
│   ├── tailwind.config.js
│   └── package.json
├── mobile/               # Native Android Studio project files & configs
└── backend/              # Firebase Realtime Database & Cloud configurations
```

---

## Getting Started

### Prerequisites
- **[Node.js](https://nodejs.org/)** `v18.x` or higher (`v20 LTS` recommended)
- **npm** `v9.x` or higher
- **Git**

### Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sho-tiii/KusinApp.git
   cd KusinApp/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `web/.env` and provide your Firebase Web API key:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=kusinapp-accd6.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=kusinapp-accd6
   VITE_FIREBASE_STORAGE_BUCKET=kusinapp-accd6.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=923819958215
   VITE_FIREBASE_APP_ID=1:923819958215:web:32683482ae758d3490c3e2
   VITE_FIREBASE_MEASUREMENT_ID=G-9L0V6VF5FY
   VITE_FIREBASE_DATABASE_URL=https://kusinapp-accd6-default-rtdb.asia-southeast1.firebasedatabase.app
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## Application Portals

Once the development server is running, access the portals in your browser:

| Portal | Local URL | Description |
| :--- | :--- | :--- |
| **User Companion Web** | `http://localhost:5173/` | Standard user login, registration, and health onboarding |
| **Admin & Super Admin** | `http://localhost:5173/?portal=admin` | Administrative sign-in, role guard, and profile security |

> **Development Tip:** During local testing without an external email API key configured, generated 6-digit OTP codes are logged to the browser **DevTools Console (`F12`)**. You may also use the development test code `123456`.

---

## Available Scripts

Run these commands inside the `/web` directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server with HMR |
| `npm run build` | Builds the production bundle into `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint across the codebase |

---

<div align="center">
  <sub>© 2026 KusinApp · Built with ❤️ for Filipino Kitchens</sub>
</div>
