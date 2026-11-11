# KusinApp

> **A Smart Filipino Meal Planning and Pantry Management System**  
> *Filipino flavors for every meal — balanced nutrition and budget-friendly management for Filipino households.*

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
5. [Feature Verification & Testing Guide](#feature-verification--testing-guide)
6. [Delivered Milestones (Sprint 1)](#delivered-milestones-sprint-1)
7. [GitHub Issues & Backlog Roadmap](#github-issues--backlog-roadmap)
8. [Design System & Team Conventions](#design-system--team-conventions)

---

## Project Overview

**KusinApp** is a cross-platform system (React Web Companion + Native Android Studio Mobile Application) designed to assist Filipino households, solo meal preppers, and health-conscious home cooks to:
- **Plan balanced meals** tailored to specific health profiles (BMI, BMR computed via the Mifflin-St Jeor formula, comorbidities including hypertension, diabetes, and hyperuricemia/gout) and household budgets.
- **Manage pantry inventory** to reduce household food spoilage and eliminate redundant grocery purchases.
- **Automate grocery lists** with local Philippine market price estimations (*palengke* vs. supermarket benchmarks).

---

## Repository Structure

```text
KusinApp/
├── web/                     # React + Vite + Tailwind CSS Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Register, ForgotPassword (Unified User & Admin)
│   │   │   ├── onboarding/  # 5-step Health & Cooking Skill Assessment
│   │   │   ├── admin/       # Split-screen Admin & Super Admin Login & Profile
│   │   │   └── common/      # Reusable SVG Icons, PasswordInput, ConfirmationModal, etc.
│   │   ├── services/        # authService, adminService, emailService, emailTemplates
│   │   ├── config/          # Firebase Web SDK initialization
│   │   ├── App.jsx          # Root routing, portal switching (?portal=admin)
│   │   └── main.jsx
│   ├── tailwind.config.js   # Tailwind CSS theme configuration
│   ├── postcss.config.js    # PostCSS & Autoprefixer configuration
│   ├── .env.example         # Environment template for Firebase & transactional email services
│   └── package.json
├── mobile/                  # Native Android Studio Application (Kotlin/Java)
│   ├── google-services.json # Android Firebase configuration
│   └── GoogleService-Info.plist
├── backend/                 # Firebase Realtime Database schemas & Cloud Functions
│   └── firebase-config.json
└── README.md                # Project documentation and team onboarding guide
```

---

## Prerequisites

Before setting up the project locally, ensure the following software is installed on your computer:
1. **[Node.js](https://nodejs.org/)** (v18.x or later — v20 LTS recommended).
2. **Git** (installed and configured in your shell).
3. **Web Browser** (Google Chrome, Brave, Microsoft Edge, or Firefox).
4. *(For Mobile Developers)*: **Android Studio** (Hedgehog / Iguana or later with Android SDK 34+).

---

## Step-by-Step Setup Guide

Follow these steps to run the web application locally:

### 1. Clone the Repository
Open your terminal and clone the repository:
```bash
git clone https://github.com/sho-tiii/KusinApp.git
cd KusinApp/web
```

### 2. Install Dependencies
Install all required React, Tailwind CSS, and Firebase packages:
```bash
npm install
```

### 3. Create Local Environment Configuration
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` in your code editor and verify the Firebase Web API configuration:
```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=kusinapp-accd6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kusinapp-accd6
VITE_FIREBASE_STORAGE_BUCKET=kusinapp-accd6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=923819958215
VITE_FIREBASE_APP_ID=1:923819958215:web:32683482ae758d3490c3e2
VITE_FIREBASE_MEASUREMENT_ID=G-9L0V6VF5FY
VITE_FIREBASE_DATABASE_URL=https://kusinapp-accd6-default-rtdb.asia-southeast1.firebasedatabase.app
```

*(Optional: To dispatch real emails to your Gmail inbox, fill in either your free EmailJS or Resend API key as described in `.env.example`).*

### 4. Start the Local Development Server
```bash
npm run dev
```

### 5. Open in Your Browser
- **User Companion Web App:** [http://localhost:5173/](http://localhost:5173/)
- **Admin & Super Admin Portal:** [http://localhost:5173/?portal=admin](http://localhost:5173/?portal=admin)

---

## Feature Verification & Testing Guide

### 1. User Authentication & Onboarding
- **Sign Up:** Register a new account with email and password. Verify the real-time **Password Requirements** checklist and **Password Strength Meter**.
- **Google Sign-In:** Click *"Continue with Google"* for seamless 1-click passwordless login.
- **Onboarding Assessment (US-03):** Complete the 5-step health assessment (Persona & Household, Demographics, Dietary Goal, Cooking Skill, Health Conditions). Verify that your BMI category and daily BMR (kcal/day) are calculated and synced to Firebase Realtime Database.
- **Profile Retake:** From the profile dashboard, test the *"Retake Onboarding Assessment"* workflow to ensure confirmation dialogs prompt correctly.

### 2. Password Recovery (OTP Flow)
1. On the login screen, click **"Forgot Password?"**.
2. Enter your registered email address and submit.
3. **Retrieving the OTP in Development:**
   - Open your browser **DevTools (F12)** &rarr; **Console tab** to view the generated 6-digit OTP code preview.
   - Alternatively, enter the development master code **`123456`** to proceed immediately.
4. Enter your new password, submit, and confirm that login works with the updated credentials.

### 3. Admin & Super Admin Portal
- Navigate to the portal via the **"Admin Portal ↗"** button in the navbar or via `?portal=admin`.
- Test role-based protection: regular user accounts will be rejected by the administrative role guard.
- Log in with administrative credentials to access the Admin Profile, edit display details, and change administrative passwords securely.
- Confirm that administrative logout completes cleanly and redirects to the login screen.

---

## Delivered Milestones (Sprint 1)

All Sprint 1 deliverables are completed and committed to `dev`:

| Item | Title | Description | Status |
| :--- | :--- | :--- | :--- |
| **US-01** | User Registration | Email/password registration and Google OAuth sign-in. | Completed |
| **US-02** | User Login & Session | Secure authentication, persistent state, and modal-guarded logout. | Completed |
| **US-03** | Health Onboarding | 5-step assessment calculating BMI, Mifflin-St Jeor BMR, and dietary goals. | Completed |
| **US-14** | Admin Authentication | Split-screen portal login enforcing role-based guard against regular accounts. | Completed |
| **US-19** | Admin Profile | Profile view, display name modification, and password updating. | Completed |
| **US-22** | Super Admin Authentication | Unified elevated administrative login. | Completed |
| **US-27** | Super Admin Security | Elevated administrative profile management and security controls. | Completed |
| **Security** | Password Strength Meter | Visual indicator and validation requirements across all auth forms. | Completed |
| **Recovery** | Unified Forgot Password | Cohesive 4-step OTP email recovery flow for both user and admin portals. | Completed |
| **Templates**| Transactional Email System | Welcome notice and OTP email layouts with KusinApp branding. | Completed |

---

## GitHub Issues & Backlog Roadmap

Below are the prioritized backlog items ready to be tracked as GitHub Issues:

### 🔴 Immediate Priorities

#### Issue #1: Native Android Mobile Application Development (`/mobile`)
- **Type:** `feature` / `mobile`
- **Milestone:** Mobile Sprint 1
- **Description:** Initialize and configure the native Android Studio project (Kotlin/Java) under `/mobile`. Connect with Firebase using `google-services.json`, set up authentication screens matching the KusinApp design system, and implement Realtime Database synchronization for user profile and onboarding states.
- **Acceptance Criteria:**
  - Android Studio project compiles cleanly with minimum SDK 26 (Android 8.0+) and target SDK 34+.
  - Users can register, log in, and view their onboarding profile on Android devices.
  - User data syncs seamlessly with Firebase Realtime Database matching the web companion.

#### Issue #2: Production Transactional Email Service & Template Formatting
- **Type:** `enhancement` / `infrastructure`
- **Milestone:** Sprint 2
- **Description:** Finalize the transactional email infrastructure for sending OTP recovery codes and registration welcome notices. Improve email template responsiveness, replace placeholder sender domains with verified custom sender identities, and ensure reliable delivery to external mailboxes (Gmail, Yahoo, Outlook) via Resend or EmailJS.
- **Acceptance Criteria:**
  - OTP and Welcome emails render cleanly across mobile and desktop email clients.
  - 6-digit OTP delivery completes within seconds without manual console inspection.
  - Sender display name displays as `KusinApp` with custom logo avatar branding.

---

### ⏳ Future Sprint Backlogs

#### Sprint 2: Pantry & Inventory Management
* **Issue #3 (US-04): Pantry Item Entry & Categorization**
  - Add ingredients with name, quantity, measurement unit, category (vegetables, meat, spices, canned goods), and expiration date.
* **Issue #4 (US-05): Pantry Inventory Dashboard**
  - Searchable, filterable real-time inventory view sorted by expiration priority.
* **Issue #5 (US-06): Expiration & Low-Stock Alerts**
  - Visual warning badges for items expiring within 3 days to prevent food waste.
* **Issue #6 (US-07): Quick Add & Barcode Scanner (Mobile)**
  - Fast barcode lookup and frequently-used ingredient quick-add chips for Android.

#### Sprint 3: Filipino Recipe Discovery & Smart Meal Planning
* **Issue #7 (US-08): Filipino Recipe Repository**
  - Database of classic Filipino recipes (Sinigang, Adobo, Tinola, Pinakbet) with step-by-step instructions and nutritional facts.
* **Issue #8 (US-09): Health-Tailored Meal Recommendation Algorithm**
  - Matchmaker engine recommending dishes that adhere to user BMR targets and comorbidity constraints (low sodium for hypertension, low glycemic index for diabetes).
* **Issue #9 (US-10): "What Can I Cook?" Pantry Matchmaker**
  - Filter recipes based on ingredients currently in stock in the user's pantry.

#### Sprint 4: Automated Budget & Grocery List
* **Issue #10 (US-11): Automated Grocery List Generation**
  - Auto-generate shopping lists from weekly meal plans minus in-stock pantry items.
* **Issue #11 (US-12): Philippine Market Price Estimator**
  - Approximate total recipe and grocery costs based on local *palengke* vs. supermarket benchmarks (in PHP).
* **Issue #12 (US-13): Household Budget Capping**
  - Set weekly grocery budget limits with warning notifications when planned meals exceed limits.

#### Sprint 5: Administrative Content Management System (CMS)
* **Issue #13 (US-15 & US-16): Admin Recipe Management Portal**
  - Administrative CRUD interfaces to create, edit, verify, and publish community recipes.
* **Issue #14 (US-17 & US-18): Ingredient & Benchmark Price Masterlist**
  - Manage standard ingredient catalog and update regional price index data.
* **Issue #15 (US-23 & US-24): Super Admin Role Delegation**
  - Super Admin interface to invite, assign, and revoke Admin accounts and permissions.
* **Issue #16 (US-25 & US-26): System Audit Logs & Usage Analytics**
  - Track administrative actions, user registrations, and platform metrics.

---

## Design System & Team Conventions

To preserve visual consistency across all portals and applications:

1. **SVG Iconography (No Raw Emojis):** Do not render native emoji characters in user interfaces. Always import accessible SVG icons from [`src/components/common/Icons.jsx`](web/src/components/common/Icons.jsx).
2. **Color Palette:**
   - **Primary Amber / Gold:** `#f59e0b` / `#d97706` (Primary brand color, buttons, active states)
   - **Chili Red Accent:** `#d92d20` (Alerts, destructive confirmations, highlight badges)
   - **Warm Cream Background:** `#f7f4ee` (Page background)
   - **Card Surface:** `#ffffff` (Card containers, modal surfaces, form inputs)
   - **Slate Text:** `#1e293b` (Headings, primary body) and `#64748b` (Muted labels, placeholders)
3. **Git Workflow:**
   - Create feature branches off `dev` (e.g., `feature/pantry-crud` or `feature/mobile-auth`).
   - Do not commit `.env` files containing private production secrets.
   - Use clear conventional commit prefixes: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`.

---

*For setup questions or assistance, reach out via the team channel or consult inline code documentation in `web/src/`.*
