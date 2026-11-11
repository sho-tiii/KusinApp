# KusinApp — GitHub Issues Backlog

This document provides ready-to-copy GitHub Issue templates for tracking all remaining project milestones and sprint backlogs in the [KusinApp GitHub Issues Tracker](https://github.com/sho-tiii/KusinApp/issues).

---

## 🔴 Immediate Priority Issues

### Issue #1: Native Android Mobile Application Development (`/mobile`)
* **Title:** `[Mobile] Setup Android Studio project and implement Firebase Auth sync`
* **Labels:** `mobile`, `enhancement`, `priority: high`
* **Milestone:** `Mobile Sprint 1`
* **Body:**
```markdown
### Summary
Initialize and configure the native Android Studio project under `/mobile` using Kotlin/Java. Ensure Firebase is properly initialized with `google-services.json` and user states synchronize with Firebase Realtime Database.

### Scope of Work
- [ ] Initialize Android Studio project structure under `/mobile` (minSdk 26, targetSdk 34+).
- [ ] Connect `google-services.json` and configure Google Services Gradle plugin.
- [ ] Implement mobile authentication screens (Login, Register, and Google Sign-In) adhering to the KusinApp design palette.
- [ ] Implement mobile onboarding questionnaire mirroring the 5-step assessment (BMI, BMR, personas, and comorbidities).
- [ ] Synchronize user profile data with Firebase Realtime Database at `users/{uid}`.

### Acceptance Criteria
- App compiles and runs cleanly on Android emulator or physical device.
- Users registered on web can log in on mobile, and vice versa.
```

---

### Issue #2: Production Transactional Email Service & Template Formatting
* **Title:** `[Backend/Web] Enhance transactional email formatting and production OTP dispatch`
* **Labels:** `backend`, `infrastructure`, `priority: high`
* **Milestone:** `Sprint 2`
* **Body:**
```markdown
### Summary
Upgrade the transactional email infrastructure to ensure consistent delivery and polished visual formatting for 6-digit OTP verification codes and registration welcome notices.

### Scope of Work
- [ ] Refine responsive HTML email templates in `web/src/services/emailTemplates.js` for cross-client compatibility (Gmail, Outlook, iOS Mail).
- [ ] Replace temporary sender subdomain with production sender configuration (e.g., custom domain via Resend or EmailJS).
- [ ] Ensure sender display name is explicitly set to `KusinApp` with custom avatar.
- [ ] Verify instant email dispatch latency under 5 seconds for OTP codes.

### Acceptance Criteria
- Users receive registration welcome emails and OTP password reset codes directly in their inbox without checking browser console.
- Email layout renders cleanly on both mobile and desktop screens.
```

---

## 🥑 Sprint 2: Pantry & Inventory Management

### Issue #3 (US-04): Pantry Item Entry & Categorization
* **Title:** `[Feature] US-04: Pantry item entry with units and expiration tracking`
* **Labels:** `feature`, `web`, `mobile`, `sprint-2`
* **Milestone:** `Sprint 2`
* **Body:**
```markdown
### User Story
As a home cook, I want to log my pantry ingredients with quantities, units, and expiration dates so that I know what is currently in stock.

### Tasks
- [ ] Create Pantry Item form (Name, Category: Meat, Vegetables, Pantry Staples, Canned Goods, Spices).
- [ ] Support flexible units (g, kg, ml, L, pcs, can, pack).
- [ ] Realtime Database persistence under `pantry/{uid}/items`.
```

---

### Issue #4 (US-05): Pantry Inventory Dashboard
* **Title:** `[Feature] US-05: Real-time pantry inventory dashboard with sorting and search`
* **Labels:** `feature`, `web`, `mobile`, `sprint-2`
* **Milestone:** `Sprint 2`

---

### Issue #5 (US-06): Expiration & Low-Stock Alerts
* **Title:** `[Feature] US-06: Expiration warnings and low-stock indicators`
* **Labels:** `feature`, `ux`, `sprint-2`
* **Milestone:** `Sprint 2`

---

### Issue #6 (US-07): Mobile Barcode Scanner & Quick-Add
* **Title:** `[Mobile] US-07: Implement barcode scanning and quick-add chips for ingredients`
* **Labels:** `mobile`, `feature`, `sprint-2`
* **Milestone:** `Sprint 2`

---

## 🍲 Sprint 3: Filipino Recipe Discovery & Smart Meal Planning

### Issue #7 (US-08): Filipino Recipe Catalog & Nutritional Information
* **Title:** `[Feature] US-08: Curated Filipino recipe repository with calorie & macro breakdowns`
* **Labels:** `feature`, `content`, `sprint-3`
* **Milestone:** `Sprint 3`

---

### Issue #8 (US-09): Health-Tailored Meal Recommendation Engine
* **Title:** `[Feature] US-09: Smart meal recommendations based on BMR and health comorbidities`
* **Labels:** `feature`, `algorithm`, `sprint-3`
* **Milestone:** `Sprint 3`

---

### Issue #9 (US-10): "What Can I Cook?" Pantry Matchmaker
* **Title:** `[Feature] US-10: Recipe generator matching in-stock pantry items`
* **Labels:** `feature`, `sprint-3`
* **Milestone:** `Sprint 3`

---

## 🛒 Sprint 4: Budget & Automated Grocery List

### Issue #10 (US-11): Automated Grocery List Generator
* **Title:** `[Feature] US-11: Smart grocery list builder deducting pantry items from meal plans`
* **Labels:** `feature`, `sprint-4`
* **Milestone:** `Sprint 4`

---

### Issue #11 (US-12): Philippine Market Price Estimator (*Palengke* vs. Supermarket)
* **Title:** `[Feature] US-12: Estimated grocery bill calculator in Philippine Peso (PHP)`
* **Labels:** `feature`, `sprint-4`
* **Milestone:** `Sprint 4`

---

### Issue #12 (US-13): Household Grocery Budget Capping & Alerts
* **Title:** `[Feature] US-13: Weekly budget limit setting with over-budget alerts`
* **Labels:** `feature`, `sprint-4`
* **Milestone:** `Sprint 4`

---

## 🛡️ Sprint 5: Administrative Content Management System (CMS)

### Issue #13 (US-15 & US-16): Admin Recipe Management Portal
* **Title:** `[Admin] US-15 & US-16: Recipe CRUD, nutrition verification, and approval workflow`
* **Labels:** `admin`, `feature`, `sprint-5`
* **Milestone:** `Sprint 5`

---

### Issue #14 (US-17 & US-18): Ingredient & Benchmark Price Masterlist
* **Title:** `[Admin] US-17 & US-18: Manage ingredient masterlist and market price index`
* **Labels:** `admin`, `feature`, `sprint-5`
* **Milestone:** `Sprint 5`

---

### Issue #15 (US-23 & US-24): Super Admin Role Delegation
* **Title:** `[SuperAdmin] US-23 & US-24: Admin role assignment, permissions, and credential management`
* **Labels:** `admin`, `security`, `sprint-5`
* **Milestone:** `Sprint 5`

---

### Issue #16 (US-25 & US-26): System Audit Logs & Usage Analytics
* **Title:** `[SuperAdmin] US-25 & US-26: System activity audit logs and user analytics dashboard`
* **Labels:** `admin`, `analytics`, `sprint-5`
* **Milestone:** `Sprint 5`
