# VedSarthi Devotee App — Mobile Companion & Architecture Guide

> **Application**: VedSarthi Devotee Mobile App (`Devotee/`)  
> **Platform**: React Native 0.82 (iOS & Android) + TypeScript  
> **Backend API**: `apps/api` (Fastify / REST + WebSockets)  
> **Web Parity Source**: `VedSarthi-main/apps/web`  
> **Latest Audit & Implementation Date**: November 2026  

---

## 1. Executive Summary & Overview

VedSarthi Devotee is a spiritual companion application connecting Sanatan Dharma devotees with certified Gurukul Acharyas, sacred Vedic ceremonies, and consecrated pure Samagri items.

The mobile app has achieved comprehensive feature and media parity with the VedSarthi web portal (`apps/web`). It operates on real backend endpoints with zero mock data, real-time multilingual text normalization, Cloudflare R2 worker CDN asset integration, and strict TypeScript verification (0 errors).

---

## 2. Technical Architecture & State Management

### 2.1 Navigation Architecture
The application uses React Navigation v7 with a deep stack hierarchy:

```
RootNavigator
 ├── AuthNavigator (Login, Register, OTP Verification, Forgot/Reset Password)
 └── MainTabNavigator (Sticky 5-Tab Sacred Navigation)
      ├── HomeTab ➔ HomeNavigator
      │    ├── HomeScreen (Panchang, Carousel, Sacred Verticals, Trending Pujas)
      │    ├── FestivalCalendarScreen (Live Countdown, Parva Tithis, Shastric Vidhi)
      │    ├── PanditsDirectoryScreen (Search, City/Language Filters)
      │    └── PanditDetailScreen (Lineage, Gurukul Degrees, Ceremonies)
      ├── PujasTab ➔ PujaNavigator
      │    ├── PujaCatalogScreen (Multi-category Vedic ceremonies)
      │    ├── PujaDetailScreen (Significance, Inclusions, Samagri list)
      │    ├── PujaCheckoutScreen (4-step booking funnel)
      │    ├── MyBookingsScreen (Filter tabs, attendance tokens)
      │    ├── BookingDetailScreen (5-step timeline, attendance token, Dakshina)
      │    └── DevoteePanditChatScreen (Real-time threaded Acharya chat)
      ├── MalaTab ➔ JapamMalaScreen (Elevated 108-bead Japa Mala counter with haptics)
      ├── StoreTab ➔ StoreNavigator
      │    ├── StoreHomeScreen (Catalog, Search, Category filter pills)
      │    ├── BestSellerScreen (Multi-facet sorted bestsellers)
      │    ├── SacredGiftsScreen (Gift customizer, curated hampers, corporate form)
      │    ├── ProductDetailScreen (Image gallery, purity certificate, variants)
      │    ├── CartScreen (Itemized basket, Sacred Gift toggle, coupons)
      │    ├── StoreCheckoutScreen (Address picker, speed options, payment)
      │    ├── OrderConfirmationScreen (ORD-XXXXXX, shipment timeline)
      │    └── OrdersHistoryScreen (Active shipment tracking, items preview)
      └── AccountTab ➔ AccountNavigator
           ├── DevoteeDashboardScreen (2x2 Metrics, Sankalp preview, quick links)
           ├── ProfileSettingsScreen (Name, verified phone, gotra, email)
           ├── FamilyMembersScreen (Interactive Family Sankalp Tree CRUD)
           ├── SavedAddressesScreen (Puja venue & delivery destination book)
           ├── SupportDeskScreen (Ticket categorization & live helpdesk chat)
           ├── PaymentLedgerScreen (Unified chronological transactions ledger)
           ├── OrdersHistoryScreen (Samagri purchases)
           └── MyBookingsScreen (Ceremonies list)
```

### 2.2 Global State & Cache Layer
- **TanStack React Query v5**: Handles caching, automatic background invalidation, and refetching for bookings, orders, services, products, family members, addresses, and support desk threads.
- **Zustand Store Ecosystem**:
  - `useAuthStore`: Session persistence with token storage, user credentials, and logout cleanup.
  - `useCartStore`: Sacred Basket management with unit price calculation, variant handling, sacred gifting notes, promo code evaluation (`VEDIC10`, `SHIVA15`, `SHUBH10`, `FESTIVE20`), and free shipping thresholds (> ₹499).
  - `useMalaStore`: 108-bead japa cycle counter with haptic feedback vibrations and sound chimes.
  - `useThemeStore`: Shastric Khadi/Ivory light theme (`bgSand`, `bgCream`, `primary`).

### 2.3 Resilient Multilingual Normalization
All backend strings returned from multilingual schemas (e.g. `{ en: string, hi?: string }`) are safely unpacked via `resolveLocalizedText()` in [`Devotee/src/utils/localization.ts`](file:///Users/psiborg/Documents/projects/files/Devotee/src/utils/localization.ts). This completely eliminates React Native child rendering exceptions (`Objects are not valid as a React child`).

---

## 3. Core Operational User Journeys (Verified Working Like Web)

### 3.1 Sacred Puja Booking Funnel
1. **Catalog & Discovery**: Devotee explores ceremonies across Griha Pravesh, Vivah, Rudrabhishek, Mahalakshmi, Pitru Shanti, and Navagraha with Dakshina values and ceremony durations.
2. **Puja Detail**: Displays authentic CDN imagery, Vedic scriptural significance, included rituals, samagri items provided by VedSarthi vs arranged by devotee, and mode choice (Doorstep Home Puja, Temple E-Puja, Online Sankalp).
3. **4-Step Booking Funnel (`PujaCheckoutScreen`)**:
   - **Step 1: Mode & Venue Address**: Pick between Doorstep Puja, Temple Consecrated, or Online Video. Enter or pick saved venue address.
   - **Step 2: Date & Shubh Muhurat**: Select auspicious date and time slot (Brahma Muhurat, Morning, Pradosh Kaal, Nishita Kaal).
   - **Step 3: Family Sankalp & Samagri**: Choose full authentic samagri kit from VedSarthi vs self-arranged, select participating family members from Sankalp Tree, and add custom Sankalp notes.
   - **Step 4: Dakshina Review & Payment Choice**: Review itemized dakshina, apply Shubh coupons, and choose payment plan:
     - **25% Advance Booking Deposit** (balance 75% payable post-ceremony upon completion).
     - **100% Full Payment**.
4. **Post-Booking Routing**: Instantly generates booking ID and navigates directly to the live Ceremony Command Center.

### 3.2 Live Ceremony Command Center & Acharya Communication
1. **Status Timeline Tracker**: Visual 5-stage progress indicator:
   $$\text{Booking Reserved} \longrightarrow \text{Acharya Matched} \longrightarrow \text{Priest En Route} \longrightarrow \text{In Progress} \longrightarrow \text{Consecrated \& Blessed}$$
2. **6-Digit Attendance Verification Code**: Displays secure attendance token that the devotee shares with the assigned Pandit upon arrival to verify physical presence.
3. **Devotee-Acharya Threaded Messaging**: Real-time communication screen (`DevoteePanditChatScreen`) allowing the devotee to communicate directly with the assigned Acharya, with quick-reply Shastric prompt chips.
4. **Dakshina Balance Payment**: One-tap completion for the remaining 75% balance dakshina post-ceremony.
5. **Emergency Cancellation**: Option to reschedule or cancel with valid reason capture.

### 3.3 Consecrated Samagri Store & Sacred E-Commerce
1. **Store Home & Search**: Search across A2 Ghee, Brass Diyas, Havan Samagri, Japa Malas, and Consecrated Kits with real-time category filtering.
2. **Dedicated Best Sellers (`BestSellerScreen`)**:
   - Multi-facet sorting: Top Rated, Most Popular, Price Low-to-High, Price High-to-Low.
   - Filter chips: In Stock Only, Price brackets (< ₹500, ₹500–₹1500, > ₹1500).
3. **Dedicated Sacred Gifting (`SacredGiftsScreen`)**:
   - Personal Gifting with Blessing Note Preview: Toggle between Handwritten and Calligraphy styles, enter recipient and sender names, customize devotional blessing text.
   - Curated hampers: `Rudrabhishek Sacred Tokri`, `Mahalakshmi Luxury Gift Box`, `Shri Satyanarayan Pujan Hamper`, `Teerth Dham Prasadam Pouch`.
   - Corporate & Custom Bulk Gifting Modal: Inquiry form with organization name, contact details, estimated quantity (25–500+ units), and instant confirmation.
4. **Product Detail (`ProductDetailScreen`)**: High-res image gallery with thumbnail preview, 100% Certified Vedic Purity badge with lab batch number, variant selector (e.g. 500g vs 1kg), quantity stepper, Shastric vidhi guide, and dual CTAs ("Add to Sacred Basket" and "Buy Now").
5. **Sacred Basket (`CartScreen`)**: Visual itemized list, quantity increment/decrement, swipe/tap removal, free shipping progress indicator, Sacred Gifting toggle with personalized note, and promo coupon engine (`VEDIC10`, `SHIVA15`, `SHUBH10`, `FESTIVE20`).
6. **Store Checkout (`StoreCheckoutScreen`)**: Delivery destination picker with inline new address modal, delivery speed selection (Standard 3–5 days vs Sacred Express 24–48 hours with Ganga Jal packing), payment mode selection (UPI, Credit/Debit Card, Net Banking, Cash/Dakshina on Delivery), and order placement calling `useCreateOrder()`.
7. **Order Confirmation (`OrderConfirmationScreen`)**: Auspicious celebration receipt with unique `ORD-XXXXXX` number, interactive 4-stage shipment tracker (`Order Placed` ➔ `Temple Consecration / Packing` ➔ `Dispatched` ➔ `Delivered`), and delivery summary.
8. **Orders History (`OrdersHistoryScreen`)**: Chronological purchase list with filter tabs (All, Active Shipments, Delivered) and shipment tracking shortcuts.

### 3.4 Devotee Account & Spiritual Dashboard Management
1. **Devotee Dashboard**: 2x2 metric counters (Puja Bookings, Samagri Orders, Saved Wishlist, Family Gotras) hooked to deep navigations, devotee verified identity badge, and quick launchpad.
2. **Family Sankalp Tree CRUD (`FamilyMembersScreen`)**: Full management of family members:
   - Name & Relationship selection (`Self`, `Spouse`, `Father`, `Mother`, `Son`, `Daughter`, `Brother`, `Sister`, `Grandfather`, `Grandmother`, `Other`).
   - Gotra lineage input.
   - 12 Rashis (Zodiac Moon Signs) horizontal picker.
   - 27 Nakshatras (Birth Stars) horizontal picker.
   - Add, edit, and delete mutations integrated with real backend endpoints.
3. **In-App Threaded Support Desk (`SupportDeskScreen`)**:
   - Create tickets categorized by topic (`puja_booking`, `samagri_delivery`, `payouts_refunds`, `account`).
   - Live threaded chat view between devotee and support administration with message timestamping and auto-polling.
4. **Vedic Profile Settings (`ProfileSettingsScreen`)**: Devotee name, Gotra, email for tax invoices, and verified mobile number with active OTP badge.
5. **Saved Addresses Manager (`SavedAddressesScreen`)**: Doorstep puja venues and samagri delivery destinations with default address selection and delete confirmation.
6. **Unified Payment & Refund Ledger (`PaymentLedgerScreen`)**: Unified chronological ledger uniting both Puja Dakshinas and Samagri Store purchases with category filters, status indicators, and tax receipt download alerts.

### 3.5 Discovery, Shastric Knowledge & Sanatan Calendar
1. **Daily Panchang Widget**: Live Vedic astronomical data (Tithi, Nakshatra, Shubh Muhurat, Rahu Kaalam, Auspicious directions).
2. **Festival Calendar (`FestivalCalendarScreen`)**:
   - Interactive live countdown ticker to the next major festival (Days : Hours : Mins : Secs).
   - Festival discount banner with coupon code `SHIVA15`.
   - Comprehensive Parva catalog (Maha Shivratri, Chaitra Navratri, Hanuman Jayanti, Guru Purnima, Janmashtami, Sharad Navratri, Diwali) with tithis, fasting/vrat rules, Shastric significance, and direct "Book Festival Puja" CTA.
3. **Elevated 108-Bead Japa Mala (`JapamMalaScreen`)**: Sacred central action on the bottom tab bar with haptic bead feedback, 108 counter cycle reset, and devotional chanting audio.

---

## 4. Comprehensive Parity Scorecard: Mobile vs. Web

| Feature / Capability | Web Portal (`apps/web`) | Mobile App (`Devotee/`) | Operational Status in Mobile |
| :--- | :---: | :---: | :--- |
| **Hero Image Carousel & Banner** | Yes | Yes | Fully operational with web CDN slides |
| **Daily Panchang & Muhurat Widget** | Yes | Yes | Fully operational with `usePanchang()` |
| **Sanatan Verticals Launchpad** | Yes | Yes | Fully operational with photographic cards |
| **Puja Catalog & Multi-Category Filters** | Yes | Yes | Fully operational (`PujaCatalogScreen`) |
| **Puja Detail & Shastric Significance** | Yes | Yes | Fully operational (`PujaDetailScreen`) |
| **4-Step Puja Booking & Muhurat Checkout** | Yes | Yes | Fully operational (`PujaCheckoutScreen`) |
| **25% Advance vs 100% Dakshina Selection** | Yes | Yes | Fully operational |
| **My Bookings & Ceremony Hub** | Yes | Yes | Fully operational (`MyBookingsScreen`) |
| **Ceremony Command Center & Status Tracker** | Yes | Yes | Fully operational (`BookingDetailScreen`) |
| **6-Digit Attendance Verification Code** | Yes | Yes | Fully operational with instructions |
| **Real-time Devotee-Pandit In-App Chat** | Yes | Yes | Fully operational (`DevoteePanditChatScreen`) |
| **Acharyas & Pandits Directory** | Yes | Yes | Fully operational (`PanditsDirectoryScreen`) |
| **Acharya Profile & Gurukul Lineage** | Yes | Yes | Fully operational (`PanditDetailScreen`) |
| **Consecrated Samagri Store Catalog** | Yes | Yes | Fully operational (`StoreHomeScreen`) |
| **Dedicated Best Sellers Showcase** | Yes | Yes | Fully operational (`BestSellerScreen`) |
| **Sacred Gifting & Corporate Hampers** | Yes | Yes | Fully operational (`SacredGiftsScreen`) |
| **Product Variants & Weight Selector** | Yes | Yes | Fully operational (`ProductDetailScreen`) |
| **Consecration & Lab Purity Badge** | Yes | Yes | Fully operational |
| **Sacred Basket & Promo Code Engine** | Yes | Yes | Fully operational (`CartScreen`) |
| **Multi-Step Store Checkout** | Yes | Yes | Fully operational (`StoreCheckoutScreen`) |
| **Order Confirmation & Shipment Tracker** | Yes | Yes | Fully operational (`OrderConfirmationScreen`) |
| **Orders History & Package Tracking** | Yes | Yes | Fully operational (`OrdersHistoryScreen`) |
| **Family Sankalp Tree CRUD (Gotra/Nakshatra)**| Yes | Yes | Fully operational (`FamilyMembersScreen`) |
| **Devotee Profile & Address Book** | Yes | Yes | Fully operational (`ProfileSettingsScreen`) |
| **Saved Addresses Manager** | Yes | Yes | Fully operational (`SavedAddressesScreen`) |
| **In-App Threaded Support Desk** | Yes | Yes | Fully operational (`SupportDeskScreen`) |
| **Payment & Refund Ledger** | Yes | Yes | Fully operational (`PaymentLedgerScreen`) |
| **Hindu Festival Calendar & Live Countdown** | Yes | Yes | Fully operational (`FestivalCalendarScreen`) |
| **Elevated 108-Bead Japa Mala Counter** | No | Yes | **Mobile-Exclusive Feature** |

---

## 5. Remaining Features & Future Enhancements Roadmap

The following auxiliary features exist on the web platform and are scheduled for upcoming release phases:

### Phase 5A: Reverse Logistics & Order Returns Portal
- **Web Reference**: [`apps/web/src/app/account/returns/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/returns/page.tsx)
- **Scope**: Devotee self-service damaged item return requests (`POST /returns`), photo upload of broken terracotta/brass goods, inspection status tracking, and automated refund credit.

### Phase 5B: Dedicated Shastric Knowledge Hub & Blogs
- **Web Reference**: [`apps/web/src/app/blog/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/blog/page.tsx)
- **Scope**: Articles and scriptural guidance on Vedic rituals, fasting guidelines, Vastu Shastra rules, and mantra pronunciations.

### Phase 5C: Temple Live Darshan Video Streaming
- **Web Reference**: WebRTC / HLS streaming embeds for Kashi Vishwanath, Mahakaleshwar, and Har Ki Pauri Ganga Aarti.
- **Scope**: Low-latency video player screen (`LiveDarshanScreen`) with live Aarti timings and synchronized digital bell/chime interactions.

### Phase 5D: Kundli & Astrological Chart Calculator
- **Web Reference**: Kundli chart generator using devotee birth date, time, and coordinates to calculate Lagna, Moon sign, and Doshas.

---

## 6. Development & Verification Guide

### 6.1 Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio (Android SDK 34+) or Xcode 15+ (for iOS)
- Running backend service on `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000` (iOS / physical device)

### 6.2 Running the Application
```bash
# Navigate to devotee app directory
cd Devotee

# Install dependencies if not already present
npm install

# Start Metro Bundler
npm start

# In a separate terminal, launch Android or iOS
npm run android
# or
npm run ios
```

### 6.3 Code Quality & TypeScript Verification
To verify that all screens, types, and hooks compile with 0 errors:
```bash
cd Devotee
./node_modules/.bin/tsc --noEmit
```
**Expected Output**: Exits cleanly with return code 0 and zero errors.
