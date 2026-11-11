# KusinApp 🍲

> **A Smart Filipino Meal Planning and Pantry Management System**  
> *Lasang Pinoy sa Bawat Luto — Sustansya at Badyet para sa Pamilyang Pilipino.*

---

## 📌 Talaan ng Nilalaman (Table of Contents)
1. [Overview ng Proyekto](#-overview-ng-proyekto)
2. [Project Structure](#-project-structure)
3. [Prerequisites](#-prerequisites)
4. [Step-by-Step Setup Guide para sa mga Ka-Group](#-step-by-step-setup-guide-para-sa-mga-ka-group)
5. [Paano I-test ang mga Features](#-paano-i-test-ang-mga-features)
6. [Sprint Status & Remaining Backlogs](#-sprint-status--remaining-backlogs)
7. [Design System & Team Guidelines](#-design-system--team-guidelines)

---

## 📖 Overview ng Proyekto

Ang **KusinApp** ay isang cross-platform system (Web + Android Mobile) na naglalayong tulungan ang mga pamilyang Pilipino, solo meal preppers, at health-conscious cooks na:
- **Mag-plano ng pagkain** batay sa kanilang kalusugan (BMI, BMR gamit ang Mifflin-St Jeor formula, comorbidities tulad ng hypertension/diabetes) at budget.
- **Mamahala ng pantry inventory** upang maiwasan ang panis at pagkaaksaya ng pagkain.
- **Awtomatikong bumuo ng grocery list** na may pagtatantya ng presyo (palengke vs supermarket).

---

## 📂 Project Structure

```text
KusinApp/
├── web/                     # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Register, ForgotPassword (Unified User & Admin)
│   │   │   ├── onboarding/  # 5-step Health & Cooking Skill Assessment
│   │   │   ├── admin/       # Admin & Super Admin Split-screen Login & Profile
│   │   │   └── common/      # Reusable Icons (SVG), PasswordInput, Modals, etc.
│   │   ├── services/        # authService, adminService, emailService, emailTemplates
│   │   ├── config/          # Firebase Web SDK initialization
│   │   ├── App.jsx          # Root routing, portal switching (?portal=admin)
│   │   └── main.jsx
│   ├── .env.example         # Environment template para sa Firebase at EmailJS/Resend
│   └── package.json
├── mobile/                  # Native Android Studio Application (Kotlin/Java)
│   ├── google-services.json # Android Firebase configuration
│   └── GoogleService-Info.plist
├── backend/                 # Firebase Realtime Database schemas & Cloud Functions
│   └── firebase-config.json
└── README.md                # Dokumentasyon ng proyekto
```

---

## 💻 Prerequisites

Bago simulan ang pag-setup sa inyong computer, tiyaking naka-install ang mga sumusunod:
1. **[Node.js](https://nodejs.org/)** (v18.x o mas bago — inirerekomenda ang v20 LTS).
2. **Git** (naka-install at naka-configure sa inyong terminal).
3. **Web Browser** (Google Chrome, Brave, o Edge).
4. *(Opsyonal para sa mobile developers)*: **Android Studio Hedgehog / Iguana**.

---

## 🚀 Step-by-Step Setup Guide para sa mga Ka-Group

Sundin lamang ang 5 simpleng steps na ito para mapagana ang project locally:

### Step 1: I-clone ang Repository
Buksan ang terminal o command prompt:
```bash
git clone https://github.com/sho-tiii/KusinApp.git
cd KusinApp/web
```

### Step 2: I-install ang Dependencies
I-install ang lahat ng kailangang React at Firebase packages:
```bash
npm install
```

### Step 3: Gumawa ng `.env` File
Kopyahin ang `.env.example` para maging `.env`:
```bash
cp .env.example .env
```
Buksan ang bagong `.env` file sa VS Code o notepad at ilagay ang inyong Firebase Web API Key:
```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=kusinapp-accd6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kusinapp-accd6
VITE_FIREBASE_STORAGE_BUCKET=kusinapp-accd6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=923819958215
VITE_FIREBASE_APP_ID=1:923819958215:web:32683482ae758d3490c3e2
VITE_FIREBASE_MEASUREMENT_ID=G-9L0V6VF5FY
VITE_FIREBASE_DATABASE_URL=https://kusinapp-accd6-default-rtdb.firebaseio.com
```

*(Opsyonal: Kung gusto ninyong mag-send ng totoong email sa inyong Gmail, maglagay ng libreng EmailJS o Resend API key gaya ng nakasaad sa `.env.example`).*

### Step 4: Patakbuhin ang Development Server
```bash
npm run dev
```

### Step 5: Buksan sa Browser
Pumunta sa:
- **Companion Web Viewer (User Portal):** `http://localhost:5173/`
- **Admin / Super Admin Portal:** `http://localhost:5173/?portal=admin`

---

## 🧪 Paano I-test ang mga Features

### 1. User Authentication & Onboarding
- **Sign Up:** Subukang mag-register gamit ang email at password. Pansinin ang real-time **Password Requirements** at **Password Strength Meter**.
- **Google Sign-In:** I-click ang *"Continue with Google"* para sa instant 1-click passwordless login.
- **Onboarding Assessment (US-03):** Sagutan ang 5 steps (Persona & Household, Demographics, Dietary Goal, Cooking Skill, Health Conditions). Awtomatikong kukuwentahin ang iyong BMI category at BMR (kcal/day).

### 2. Forgot Password / OTP Flow
1. Sa login form, i-click ang **"Forgot Password?"**.
2. Ilagay ang iyong registered email address at i-click ang *"Send Verification Code"*.
3. **Paano makuha ang OTP Code habang nagde-develop?**
   - Buksan ang browser **DevTools (F12)** &rarr; **Console tab**. Naka-print doon ang generated 6-digit OTP code.
   - **Dev Master Code:** Pwede ring i-type ang code na **`123456`** para makapag-proceed agad nang mabilis.
4. Maglagay ng bagong password at subukang mag-login ulit gamit ang bagong password.

### 3. Admin & Super Admin Portal
- I-click ang **"Admin Portal ↗"** sa kanang itaas ng navbar (o buksan ang `http://localhost:5173/?portal=admin`).
- May split-screen layout na nagpapakita ng administrative branding.
- May built-in role guard: kung user account ang gagamitin, haharangin ito at sasabihing administrative privilege ang kailangan.
- Sa loob ng Admin Profile, maaaring mag-edit ng name, email, at magpalit ng password gamit ang secure confirmation dialog.

---

## 📋 Sprint Status & Remaining Backlogs

### ✅ Sprint 1: Foundation, Authentication, & Onboarding (TAPOS NA)
- [x] **US-01:** User Registration (Email/Password & Google OAuth).
- [x] **US-02:** User Login, Session Persistence, at Logout na may Confirmation Modal.
- [x] **US-03:** Health, Skill, & Persona Onboarding Assessment (Mifflin-St Jeor formula, BMI, BMR, Household size, Comorbidities).
- [x] **US-14:** Split-screen Admin Authentication with Role-Based Guard.
- [x] **US-19:** Admin Profile Viewing and Editing.
- [x] **US-22:** Super Admin Unified Authentication.
- [x] **US-27:** Super Admin Profile & Password Security Management.
- [x] **Password Security:** Password strength meter at requirement validator.
- [x] **Password Recovery:** 4-step OTP email-based Forgot Password flow (unified sa User at Admin).
- [x] **Email Dispatcher:** Branded Welcome at OTP email notification templates via EmailJS / Resend.

---

### ⏳ Remaining Backlogs para sa mga Susunod na Sprints

#### 🥑 Sprint 2: Pantry & Inventory Management (Target: Mobile & Web)
* **US-04 (Pantry Item Entry):** Pagdadagdag ng sangkap sa pantry (Pangalan, dami/quantity, unit, expiration date, kategorya: gulay, karne, rekado, de-lata).
* **US-05 (Inventory Dashboard & Tracking):** Real-time monitoring ng natitirang stock sa bahay na may sorting ayon sa expiration date.
* **US-06 (Expiration & Low-Stock Alerts):** Visual warnings para sa mga sangkap na malapit nang mapanis (anti-spoilage indicator).
* **US-07 (Barcode / Quick Add - Mobile):** Mabilisang pag-scan o pag-input ng regular na binibiling sangkap.

#### 🍲 Sprint 3: Filipino Recipe Discovery & Smart Meal Planning
* **US-08 (Recipe Catalog):** Database ng mga pagkaing Pinoy (Sinigang, Adobo, Tinola, Pinakbet, etc.) na may nutritional breakdown (calories, sodium, carbs) at cooking time.
* **US-09 (Health-Tailored Meal Recommender):** Algoritmong nagmumungkahi ng ulam batay sa BMR at health conditions mula sa onboarding (hal. low-sodium para sa may hypertension; low-glycemic para sa may diabetes).
* **US-10 ("Anong Ulam Gamit ang Pantry?"):** Matchmaker engine na nagpapakita kung anong pwedeng lutuin gamit lamang ang mga sangkap na nasa pantry na ng user.

#### 🛒 Sprint 4: Automated Budget & Grocery List
* **US-11 (Smart Grocery Generator):** Awtomatikong paggawa ng listahan ng bibilhin: *(Mga sangkap sa napiling meal plan) minus (mga sangkap na available na sa pantry)*.
* **US-12 (Palengke vs. Supermarket Price Estimation):** Pagtatantya ng kabuuang gagastusin sa pamamalengke sa piso (PHP).
* **US-13 (Budget Capping):** Pagtatakda ng lingguhang badyet at pagbibigay ng babala kung lampas na sa budget ang plano.

#### 🛡️ Sprint 5: Admin & Super Admin Content Management System (CMS)
* **US-15 & US-16 (Admin Recipe Management):** Pag-create, edit, at pag-verify ng bagong recipes at nutritional data.
* **US-17 & US-18 (Market Price Updates):** Pamamahala ng masterlist ng standard ingredients at benchmark prices sa palengke.
* **US-23 & US-24 (Super Admin Role Delegation):** Paglikha at pag-assign ng mga Admin accounts at pag-manage ng permissions.
* **US-25 & US-26 (System Audit Logs & Analytics):** Pagsubaybay sa aktibidad ng mga admin at statistics ng active users.

#### 📱 Sprint 6: Native Android Mobile Integration & Offline Cache
* Pag-sync ng Kotlin/Java Android app sa Firebase Realtime Database.
* Local SQLite / Room caching para sa offline viewing ng pantry at meal plans.
* Android Push Notifications para sa expiration warnings bago matulog.

---

## 🎨 Design System & Team Guidelines

Para manatiling cohesive at professional ang buong proyekto, sundin ang mga alituntuning ito:

1. **Walang Emojis sa UI:** Huwag gumamit ng mga generic emoji characters sa UI. Gamitin ang malinis na custom SVG icons mula sa [`src/components/common/Icons.jsx`](web/src/components/common/Icons.jsx).
2. **Color Palette:**
   - **Primary Amber / Gold:** `#f59e0b` / `#d97706` (main brand color, CTAs)
   - **Chili Accent / Red:** `#d92d20` (destructive actions, alerts, highlights)
   - **Warm Cream Background:** `#f7f4ee` (body background, light mode)
   - **Card Surface:** `#ffffff` (card backgrounds, inputs)
   - **Slate Text:** `#1e293b` (primary text) at `#64748b` (subtitles/placeholders)
3. **Git Workflow:**
   - Mag-branch palagi mula sa `dev` bago gumawa ng bagong feature (hal. `feature/pantry-crud`).
   - Huwag mag-commit ng `.env` files na may sensitibong private keys.
   - Sumulat ng malinaw at descriptive na commit messages.

---

*Para sa mga katanungan o tulong sa setup, mag-message sa group chat o tingnan ang code comments sa loob ng `web/src/`.*
