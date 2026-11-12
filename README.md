<div align="center">
  <img src="web/public/assets/kusinapp-logo-horizontal.png" alt="KusinApp Logo" width="280" />

  <h3>Smart Filipino Meal Planning & Pantry Management System</h3>
  <p><i>Lasang Pinoy sa Bawat Luto — Balanced Nutrition & Smart Budgeting for Filipino Households.</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/React_Native-Expo-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Firebase-13-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Android-Emulator-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android" />
    <img src="https://img.shields.io/badge/iOS-Expo_Go-000000?style=flat-square&logo=apple&logoColor=white" alt="iOS" />
  </p>
</div>

---

## 📖 Overview

**KusinApp** is a modern, cross-platform meal planning and kitchen inventory application specifically tailored for Filipino households, solo meal preppers, and health-conscious home cooks. It combines Filipino recipe curation with real-time pantry inventory tracking, personalized biometric health metrics, and localized market cost estimation (*palengke* vs. supermarket).

### ✨ Key Features
- **Personalized Health Onboarding** — Computes BMI and daily Basal Metabolic Rate (BMR) via the Mifflin-St Jeor equation alongside dietary goals and health conditions.
- **Smart Pantry & Spoilage Tracking** — Monitors household ingredients, quantities, and expiration dates to reduce food waste.
- **Budget-Conscious Meal Planning** — Generates automated grocery lists with local Philippine market price benchmarks.
- **Unified Authentication & Security** — Supports Email/Password, Google OAuth, OTP password recovery, terms & privacy agreement safeguards, and dedicated Admin & Super Admin portals.
- **Multi-Platform Experience** — Seamless sync between the web dashboard and mobile app powered by Firebase Realtime Database.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Web Frontend** | React 19, Vite, Tailwind CSS 3.4 | Fast, modern web companion & admin portals |
| **Mobile App** | React Native, Expo | Native mobile experience for Android and iOS |
| **Backend & Auth** | Firebase Auth, Realtime Database | Real-time cross-platform state synchronization |
| **Email Service** | Resend / EmailJS REST API | Secure OTP code verification & password recovery |

---

## 📁 Project Structure

```text
KusinApp/
├── web/                  # React 19 + Vite + Tailwind CSS web application
│   ├── public/           # Static brand assets, horizontal/stacked logos
│   ├── src/
│   │   ├── components/   # Auth, Onboarding, Admin, Modals, Navbar, UI
│   │   ├── config/       # Firebase Web SDK initialization
│   │   ├── services/     # Auth, Admin, and Email services
│   │   ├── App.jsx       # Root router & role governance
│   │   └── main.jsx      # Vite entry point
│   ├── tailwind.config.js# Custom brand color palettes & typography
│   └── package.json
├── mobile/               # React Native + Expo mobile application
│   ├── assets/           # Centerpiece splash art, transparent logo marks
│   ├── src/
│   │   ├── components/   # Reusable UI controls, buttons, cards, animations
│   │   ├── screens/      # Welcome, Login, SetupIntro, Home dashboards
│   │   └── services/     # Firebase Mobile SDK initialization & Auth
│   ├── app.json          # Expo application configuration & bundle IDs
│   └── package.json
└── backend/              # Firebase Database schema & cloud rules
```

---

## 🚀 Getting Started

### Prerequisites
- **[Node.js](https://nodejs.org/)** `v18.x` or `v20 LTS` recommended
- **npm** `v9.x` or higher
- **Git**
- *(For Mobile Testing)* **[Android Studio](https://developer.android.com/studio)** or **Expo Go** on your physical phone (Android / iOS)

---

### 🌐 1. Running the Web Companion (`/web`)

1. **Navigate to the web directory:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Firebase Web configuration:
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

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

| Portal | Local URL | Description |
| :--- | :--- | :--- |
| **User Companion** | `http://localhost:5173/` | Member login, registration, and health onboarding |
| **Admin & Super Admin** | `http://localhost:5173/?portal=admin` | Staff portal, role guards, and recipe governance |

---

### 📱 2. Running the Mobile App (`/mobile`)

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Choose your test environment:**
   - **Option A: On your Android Emulator (PC Desktop)**
     1. Open **Android Studio** ➔ **Virtual Device Manager**.
     2. Click **Play (▶)** on your virtual phone (e.g., Pixel 7 / Pixel 8 with API 34 or 35).
     3. In your terminal where Expo is running, press **`a`**.
     4. Expo will automatically install Expo Go into the emulator and launch KusinApp!
   - **Option B: On your Physical Phone (Expo Go)**
     1. Download **Expo Go** from the Google Play Store (Android) or App Store (iOS).
     2. Scan the QR code displayed in your terminal using Expo Go (Android) or default Camera (iOS).

---

## ⚙️ Android Studio Emulator Troubleshooting (Windows)

If the emulator displays:  
`Windows Hypervisor Platform is not enabled`

1. **Check CPU Virtualization:**
   - Press `Ctrl + Shift + Esc` (Task Manager) ➔ **Performance** ➔ **CPU**.
   - Ensure **Virtualization: Enabled** is shown.
   - If *Disabled*, enable **Intel Virtualization Technology (VT-x)** or **AMD SVM Mode** in your computer's BIOS/UEFI.
2. **Enable Windows Features:**
   - Search for **"Turn Windows features on or off"** in the Windows Start menu.
   - Check ☑️ **Windows Hypervisor Platform** and ☑️ **Virtual Machine Platform**.
   - Click **OK** and restart your computer.

---

## ⌨️ Development Commands

### Web (`/web`)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with HMR |
| `npm run build` | Compiles optimized production bundle in `dist/` |
| `npm run preview` | Locally serves the production build |
| `npm run lint` | Runs ESLint across the codebase |

### Mobile (`/mobile`)
| Command | Description |
| :--- | :--- |
| `npx expo start` | Starts Metro bundler development server |
| `a` *(in terminal)* | Launches or connects to Android Emulator |
| `r` *(in terminal)* | Reloads the app on connected devices |
| `Ctrl + M` *(in emulator)* | Opens the developer menu & inspector |

---

<div align="center">
  <sub>© 2026 KusinApp · Built with ❤️ for Filipino Kitchens</sub>
</div>
