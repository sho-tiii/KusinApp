# KusinApp Mobile App (`/mobile`)

Cross-platform mobile application for **KusinApp** built with **React Native** and **Expo**, connected directly to Firebase Realtime Database and Firebase Authentication.

---

## 📱 Features
- **Cross-Platform Support**: Runs on both **Android** and **iOS (iPhone/iPad)**.
- **Firebase Authentication**: Email and password registration & login with persistent sessions.
- **Realtime Database Synchronization**: User profile data persists to `users/{uid}` in the `asia-southeast1` region.
- **Linked Firebase Credentials**:
  - Android: `google-services.json` (`com.atelier101.kusinapp`)
  - iOS: `GoogleService-Info.plist` (`com.atelier101.kusinapp`)

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or v20 LTS recommended).
2. **Expo CLI** (installed automatically via `npx expo`).
3. **Your Smartphone**:
   - **Android**: Install **[Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)** from the Google Play Store.
   - **iPhone (iOS)**: Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** from the Apple App Store.

---

### Step 1: Install Dependencies
Open your terminal and navigate to the `/mobile` directory:
```bash
cd mobile
npm install
```

---

### Step 2: Start the Expo Development Server
```bash
npx expo start
```
This will launch the Expo Metro Bundler and display a large **QR code** in your terminal.

---

### Step 3: Run on Your Device

#### 🤖 On an Android Device
1. Open the **Expo Go** app on your Android phone.
2. Tap **"Scan QR code"**.
3. Scan the QR code displayed in your computer terminal.
4. The JavaScript bundle will download and the KusinApp mobile app will open immediately!
*(Alternatively, press `a` in your terminal to launch an Android Emulator if configured in Android Studio).*

#### 🍎 On an iPhone (iOS)
1. Open the default **Camera** app on your iPhone.
2. Point your camera at the QR code displayed in your computer terminal.
3. Tap the yellow notification banner that says **"Open in Expo Go"**.
4. The app will launch directly inside Expo Go on your iPhone!
*(Alternatively, on a Mac with Xcode, press `i` in your terminal to launch the iOS Simulator).*

---

## 🧪 Testing Registration & Login
1. When the app loads, you will see the **KusinApp Mobile** screen with tabs for **[Log In]** and **[Sign Up]**.
2. **Register a New Account**:
   - Tap **Sign Up**.
   - Enter your Full Name, Email, and Password (min. 8 characters).
   - Tap **Create Account**.
   - Your account is automatically created in Firebase Auth and registered in the Realtime Database at `users/{uid}`!
3. **Login with Existing Account**:
   - Tap **Log In**.
   - Enter your email and password.
   - You can log in using accounts previously registered on the web companion or on mobile!
4. **View Authenticated Dashboard**:
   - Once logged in, the screen displays your profile details, role, and a live database sync confirmation indicator.
   - Tap **Log Out from Mobile** to securely end your session.
