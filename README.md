# 🏪 Dukan Bari - Hyperlocal Store Discovery, Reverse-Enquiry & Live Merchant Platform

Complete architecture featuring separate folders for **React Native Mobile (Expo)**, **Next.js Web (Desktop/Admin/Merchant)**, and **Node.js Express + Socket.io Backend**.

---

## 📂 Repository Structure

```
e:/Dukan Bari/
├── backend/                 # Node.js, Express, TypeScript, Socket.io Real-Time Server
│   ├── src/
│   │   ├── config/          # Supabase, Cloudinary & Env configs
│   │   ├── middleware/      # Supabase JWT Auth & Role-Based RBAC
│   │   ├── routes/          # Store discovery, Reverse enquiry, Deals, Chat, Upload
│   │   ├── services/        # Cloudinary stream & FCM push notification worker
│   │   └── sockets/         # 1-to-1 live chat, store status toggle, room engine
│   ├── package.json
│   └── tsconfig.json
│
├── web/                     # Next.js 14 (App Router) Desktop Web & Portals
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx           # Email/password, Google OAuth, role switcher
│   │   │   │   ├── signup/page.tsx          # Dual role picker (Customer vs Dukandar + Store details)
│   │   │   │   └── forgot-password/page.tsx # Password reset email request
│   │   │   ├── admin/page.tsx               # 🛡️ Superadmin Portal (Platform metrics, KYC verification queue, alerts)
│   │   │   ├── merchant/page.tsx            # 🛍️ Dukandar Desk (1-tap Live Status Open/Close, Reverse Enquiry radar)
│   │   │   ├── explore/page.tsx             # 👤 Customer Discovery (1-5km radius slider, store cards, direct chat)
│   │   │   └── page.tsx                     # Landing page with interactive role launchpad
│   │   ├── context/AuthContext.tsx          # Supabase Auth, Google OAuth, session & role state
│   │   └── lib/supabase.ts
│   ├── package.json
│   └── tailwind.config.js
│
├── mobile/                  # React Native (Expo) Cross-Platform Mobile App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx          # Mobile login with Google button & quick role switcher
│   │   │   │   ├── SignupScreen.tsx         # Mobile signup with customer vs merchant selector
│   │   │   │   └── ForgotPasswordScreen.tsx # Mobile password recovery
│   │   │   ├── superadmin/
│   │   │   │   └── SuperadminDashboardScreen.tsx # Mobile KYC review and emergency alerts
│   │   │   ├── dukandar/
│   │   │   │   └── DukandarDashboardScreen.tsx   # Mobile 1-tap Live Open/Closed switch, enquiry quotes
│   │   │   └── customer/
│   │   │       └── CustomerHomeScreen.tsx        # Mobile GPS discovery (0.5-5km), reverse enquiry modal
│   │   ├── context/AuthContext.tsx          # Mobile Supabase auth with AsyncStorage
│   │   └── navigation/RootNavigator.tsx     # Role-based stack routing
│   ├── App.tsx
│   ├── package.json
│   └── app.json
│
└── supabase/
    └── migrations/
        └── 20261017000000_initial_hyperlocal_schema.sql # PostGIS + RLS + Stored procedures
```

---

## 🔐 Auth & Role-Based Access Control (RBAC)

### 1. Authentication Flows Implemented:
- **Login (`/login`):** Email / phone + password authentication, automatic redirection according to role.
- **Signup (`/signup`):** Interactive role tabs. Selecting **Dukandar** reveals dedicated physical store fields (Store Name, Retail Category, Physical Address, City, Pincode).
- **Forgot Password (`/forgot-password`):** Trigger password reset email via Supabase Auth.
- **Google Sign-In:** One-click OAuth with Supabase provider (`signInWithOAuth({ provider: 'google' })`).
- **Instant Demo Switcher:** 1-tap role buttons (`Superadmin`, `Dukandar`, `Customer`) embedded on login screens to instantly evaluate every portal without waiting for database seeding.

---

## 🎯 The Three Role Portals

### 1. 🛡️ Superadmin Portal (`web/src/app/admin/page.tsx` & `mobile/.../SuperadminDashboardScreen.tsx`)
- **Platform Health:** Total registered stores, live shoppers within 1-5km grids, active Socket.io chat rooms, 24h reverse query volume.
- **Merchant Verification & Onboarding:** Queue of pending store registrations. 1-click **Approve**, **Reject**, or **Re-evaluate**.
- **System-Wide Broadcast Alerts:** Emergency alert dispatcher pushing notifications across all operational zones.

### 2. 🛍️ Dukandar (Shop Owner) Desk (`web/src/app/merchant/page.tsx` & `mobile/.../DukandarDashboardScreen.tsx`)
- **1-Tap Live Store Status Toggle (`OPEN` / `CLOSED`):** Glowing badge immediately reflecting on user maps & feeds.
- **Reverse Enquiry Radar:** Real-time inbox showing item queries from nearby shoppers (within 3 km). 1-tap reply with availability and price quote (e.g. ₹250).
- **Flash Deals & Geofenced Push Alerts:** Form to post deals (e.g., "FLAT 20% OFF till 8 PM") that trigger geofenced push alerts to nearby app users.
- **Direct 1-to-1 Live Chat:** Real-time conversation with customers.

### 3. 👤 User / Khareedar Discovery (`web/src/app/explore/page.tsx` & `mobile/.../CustomerHomeScreen.tsx`)
- **Hyperlocal Discovery:** Dynamic 0.5 to 5 km radius slider and category filters.
- **Live Badges:** Real-time indicators (`Live Open · Closes at 9:30 PM`, `Closed (Merchant Toggle)`).
- **Broadcast Reverse-Enquiry:** Float/modal button allowing customers to query all nearby shops for an item at once.
- **Direct Live Chat & WhatsApp fallback.**

---

## 🚀 How to Run

### Run Backend Server:
```bash
cd backend
npm install
npm run dev
# Server runs on port 5000 (HTTP + Socket.io)
```

### Run Next.js Web Application:
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

### Run React Native Mobile App:
```bash
cd mobile
npm install
npm start
# Press 'a' for Android emulator, 'i' for iOS simulator, or scan QR code with Expo Go
```
