# KusinApp Mobile App (`/mobile`)

Cross-platform mobile application for **KusinApp** built with **React Native** and **Expo**, connected directly to Firebase Realtime Database and Firebase Authentication.

---

## 📱 Features
- **Cross-Platform Support**: Runs on both **Android** (physical device or Android Emulator) and **iOS** (iPhone/iPad via Expo Go).
- **Firebase Authentication**: Email and password registration & login with persistent sessions.
- **Realtime Database Synchronization**: User profile data persists to `users/{uid}` in the `asia-southeast1` region.
- **Linked Firebase Credentials**:
  - Android: `google-services.json` (`com.atelier101.kusinapp`)
  - iOS: `GoogleService-Info.plist` (`com.atelier101.kusinapp`)

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18 or v20 LTS recommended).
2. **Expo CLI** (executed automatically via `npx expo`).
3. **Testing Environment**:
   - **Android Emulator** via Android Studio (recommended for PC desktop development).
   - Or **Expo Go** on your physical smartphone:
     - **Android**: Install **[Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)** from Google Play.
     - **iPhone (iOS)**: Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** from App Store.

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
This will launch the Expo Metro Bundler and display shortcut controls and a QR code in your terminal.

---

### Step 3: Run on Your Device

#### 🤖 Option A: On Android Studio Emulator (PC)
1. Open **Android Studio** ➔ **Virtual Device Manager**.
2. Click **Play (▶)** on your virtual device (recommended: Pixel 7 or 8 with API 34 or 35).
3. Once the virtual phone is running on your desktop, go to your terminal and press:
   ```text
   a
   ```
4. Expo will automatically install Expo Go inside the emulator and launch KusinApp!

> **Troubleshooting `Windows Hypervisor Platform is not enabled`:**
> 1. Check Task Manager (`Ctrl + Shift + Esc`) ➔ **Performance** ➔ **CPU**. Verify that **Virtualization: Enabled** is shown. If disabled, enable Intel VT-x or AMD SVM in your BIOS/UEFI.
> 2. In Windows Search, open **"Turn Windows features on or off"** and enable both **Windows Hypervisor Platform** and **Virtual Machine Platform**. Restart your PC.

#### 📱 Option B: On a Physical Android Device
1. Open the **Expo Go** app on your Android phone.
2. Tap **"Scan QR code"**.
3. Scan the QR code displayed in your computer terminal.

#### 🍎 Option C: On an iPhone (iOS)
1. Open the default **Camera** app on your iPhone.
2. Point your camera at the QR code in your computer terminal.
3. Tap the notification banner that says **"Open in Expo Go"**.

---

## ⌨️ Useful Shortcuts
| Key | Action |
| :--- | :--- |
| `r` | Force reloads the app on the active device |
| `a` | Launches / connects to the Android Emulator |
| `Ctrl + M` | Opens the developer menu inside the Android Emulator |
| `j` | Opens the JavaScript debugger |
