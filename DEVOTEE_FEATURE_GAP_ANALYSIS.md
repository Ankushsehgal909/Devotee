# VedSarthi Devotee App Feature Gap Analysis: Web vs. Mobile

> **Audit Date**: November 2026  
> **Target Mobile Project**: [`Devotee/`](file:///Users/psiborg/Documents/projects/files/Devotee) (React Native 0.88.1, React 19, TypeScript, Zustand, TanStack Query)  
> **Reference Web Portal**: [`VedSarthi-main/apps/web/`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web) (Next.js 16 App Router, Tailwind CSS)  
> **Audit Standard**: Every listed web feature has been verified as **100% active and onboard in code**. Any commented-out, dead, or redirected routes have been audited and excluded.

---

## 1. Executive Summary & Audit Scorecard

The **VedSarthi Web Portal** provides devotees with a complete spiritual ecosystem: booking doorstep and online Pujas with verified Acharyas, purchasing consecrated Hawan Samagri, managing family Sankalp trees, tracking ceremonies live, and accessing in-app support.

In comparison, the **`Devotee` mobile application** is currently an early-stage shell. While it possesses clean foundational architecture (authentication screens, theme tokens, Zustand stores, and basic catalog views), **over 70% of the core devotee journey remains unimplemented or exists only as static UI stubs (`onPress={() => {}}` or `Alert.alert`)**.

```
┌────────────────────────────────────────────────────────┬─────────────┬──────────────┐
│ Devotee Functional Pillar                              │ Web Status  │ Mobile App   │
├────────────────────────────────────────────────────────┼─────────────┼──────────────┤
│ 1. Authentication & Onboarding                         │ Onboard     │ Complete     │
│ 2. Sacred Puja Booking Funnel (Muhurat/Venue/Checkout) │ Onboard     │ Missing (0%) │
│ 3. Live Ceremony Tracking & Attendance Verification    │ Onboard     │ Missing (0%) │
│ 4. Pandits & Acharyas Directory                        │ Onboard     │ Missing (0%) │
│ 5. Consecrated Samagri Store, Cart & Checkout          │ Onboard     │ Stub (20%)   │
│ 6. Family & Gotra Sankalp Tree Management (CRUD)       │ Onboard     │ Read-only    │
│ 7. Devotee Orders & Shipment Tracking                  │ Onboard     │ Missing (0%) │
│ 8. Unified Payment & Invoice PDF Ledger                │ Onboard     │ Missing (0%) │
│ 9. Returns & Refund Management Portal                  │ Onboard     │ Missing (0%) │
│ 10. In-App Threaded Devotee Support Desk & Chat        │ Onboard     │ Missing (0%) │
│ 11. Interactive 108-Bead Japam Mala Counter            │ Absent      │ Complete ⭐   │
└────────────────────────────────────────────────────────┴─────────────┴──────────────┘
```

---

## 2. Granular Gap Breakdown by Functional Pillar

---

### Pillar 1: Sacred Puja Booking & Checkout Funnel

On the web portal, devotees progress through a comprehensive 4-step booking funnel ([`PujaCheckout.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/PujaCheckout.tsx)) with real-time hold mechanisms, Pandit matching, and flexible dakshina payments. In the mobile app ([`PujaDetailScreen.tsx`](file:///Users/psiborg/Documents/projects/files/Devotee/src/screens/puja/PujaDetailScreen.tsx)), tapping *"Select Shubh Muhurat"* merely fires an `Alert.alert`.

#### What Exists in Web but is MISSING in Mobile App:

1. **Step 1: Ceremony Mode & Venue Address Picker** ([`PujaVenueAddress.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/PujaVenueAddress.tsx))
   - **Mode Selection**: At home (`home_visit`), Interactive live online (`online`), or At a sacred temple (`in_person`).
   - **Saved Address Selector**: Pulls saved devotee addresses (`/me/addresses`) with one-tap selection.
   - **Address Form**: Full doorstep venue form (Devotee name, contact phone, street address, city, state, pincode).
   - **Pincode Delivery & Serviceability Check**: Real-time validation against served zones via `/delivery-location`.
   - **Temple Location Picker**: Dropdown of participating temples when `in_person` mode is selected.

2. **Step 2: Auspicious Date & Muhurat Slot Selection** ([`DateStrip.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/DateStrip.tsx), [`DateAvailabilityCalendar.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/DateAvailabilityCalendar.tsx))
   - **Horizontal Date Strip**: Visual calendar strip displaying days, weekdays, and active Vedic Tithis.
   - **Muhurat Window Picker**: Categorized slots:
     - Morning Muhurat (Pratah Kaal)
     - Abhijit Muhurat (Auspicious midday peak)
     - Evening Muhurat (Sandhya Kaal)
   - **Custom Special Request Form** ([`SpecialRequestForm.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/SpecialRequestForm.tsx)): Devotees can request custom times or special shastric variations directly to Pandits (`POST /bookings/requests`).

3. **Step 3: Pandit Selection & Acharya Matching** ([`MarketplacePandits.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/MarketplacePandits.tsx), [`SuggestedAcharyas.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/SuggestedAcharyas.tsx))
   - **Auto-Assign vs. Choose Pandit**: Option to allow VedSarthi to allocate the best available Vedic priest or hand-pick an Acharya.
   - **Acharya Preview Drawer**: View Pandit credentials, Gurukul lineage, total pujas performed, verified badges, and introduction video.

4. **Step 4: Samagri Selection & Puja Extras** ([`PujaExtras.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/PujaExtras.tsx))
   - **Samagri Choice**: "VedSarthi brings 100% consecrated Samagri kit" vs. "Devotee arranges basic items at home".
   - **Ritual Add-Ons**: Option to add supplementary chants (e.g. Navagraha Japam, Rudrabhishek, flower garlands, Desi cow milk/ghee).

5. **Step 5: Devotee Sankalp & Family Assignment**
   - Automatically pull the registered Family Sankalp tree (Gotra, Nakshatra, Rashi) and choose which family members will be included in the live mantra recitation.

6. **Step 6: Review, Quotation & Payment Choice** ([`PujaPaymentChoice.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/PujaPaymentChoice.tsx))
   - **Itemized Cost Quotation**: Clear split of Ritual Dakshina, Samagri fee, Add-ons, and Platform escrow.
   - **Payment Options**:
     - **25% Advance Booking Dakshina**: Pay 25% now to secure the Muhurat slot; balance 75% due after ceremony completion.
     - **100% Full Payment**: Pay total amount upfront.
   - **Checkout Hold Timer**: 15-minute slot lock (`POST /checkout/holds`).
   - **Cancellation Policy Acceptance**: Dynamic cancellation rules display (`CancellationPolicy.tsx`).

---

### Pillar 2: Live Ceremony Tracking, Attendance Verification & Devotee Booking Hub

On the web portal, [`/account/bookings`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/bookings/page.tsx) and [`/account/bookings/[id]`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/bookings/[id]/page.tsx) provide an active command center for all booked pujas. In the mobile app, there is no booking list or detail screen.

#### What Exists in Web but is MISSING in Mobile App:

1. **Devotee Bookings Hub Screen** ([`/account/bookings`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/bookings/page.tsx))
   - Grid and List view toggle for upcoming, active, and past ceremonies.
   - Filter chips: All, Confirmed, Pending Pandit, In Progress, Completed, Cancelled.
   - Payment status tags: "Advance Paid", "Balance Due", "Fully Settled".
   - **My Pandit Custom Requests Hub** ([`MyPanditRequests.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/MyPanditRequests.tsx)): Track status of custom inquiry bids sent to Acharyas.

2. **Ceremony Status Progress Tracker** ([`BookingProgress.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/BookingProgress.tsx))
   - Visual ceremony timeline: `Booking Created` ➔ `Pandit Assigned` ➔ `Priest Traveling` ➔ `Pooja In Progress` ➔ `Consecrated & Completed`.

3. **Devotee 6-Digit Attendance Verification Code** ([`CustomerAttendanceCode.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/CustomerAttendanceCode.tsx))
   - Secure verification token displayed to the devotee to share with the Acharya upon arrival to consecrate the start/completion of the ritual.

4. **In-App Devotee-to-Pandit Live Chat** ([`BookingChat.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/BookingChat.tsx))
   - Dedicated threaded conversation between the devotee and their assigned Pandit to coordinate arrival time, venue directions, and samagri setup.

5. **Balance Dakshina Payment Action** ([`CustomerBookingPayments.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/CustomerBookingPayments.tsx), [`BookingPaymentStatus.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/BookingPaymentStatus.tsx))
   - One-tap button to clear remaining 75% balance dakshina post-puja via Razorpay (UPI, Card, Netbanking).

6. **Pandit Replacement & Reassignment Flow** ([`BookingReplacement.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/BookingReplacement.tsx))
   - If a pandit has an emergency and declines, the devotee is presented with an instant replacement card to accept an alternate verified Acharya without losing their muhurat.

7. **Ceremony Cancellation & Refund Preview** ([`CancelBooking.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/booking/CancelBooking.tsx))
   - Interactive cancellation dialogue displaying tiered refund calculation based on time remaining until the muhurat.

---

### Pillar 3: Pandits & Acharyas Directory

On the web portal, devotees can explore certified Pandits directly through [`/pandits`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/pandits/page.tsx) and view rich profiles at [`/pandits/[slug]`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/pandits/[slug]/page.tsx).

#### What Exists in Web but is MISSING in Mobile App:

1. **Pandits Directory Screen (`PanditsDirectoryScreen`)**
   - Search bar by Acharya name or keyword.
   - Filter by City (Varanasi, Haridwar, Ujjain, Prayagraj, Delhi NCR, Mumbai, etc.).
   - Filter by Vedic Language (Hindi, Sanskrit, Marathi, Tamil, Telugu, Gujarati, Bengali, etc.).
   - Filter by Ritual Specialization (Vastu, Navagraha, Rudrabhishek, Vivah, Pitru Shanti).
   - Sorting options: Recommended, Experience (years), Devotee Rating.

2. **Acharya Profile & Lineage Screen (`PanditDetailScreen`)**
   - Verified badge, Gurukul background, Vedic education degrees, and lineage certificates.
   - Introduction video playback preview.
   - Devotee reviews and shlok blessings.
   - Catalogue of pujas performed by this specific Pandit with direct "Book with this Pandit" CTA.

---

### Pillar 4: Consecrated Samagri E-Commerce Store & Checkout

In the mobile app, [`StoreHomeScreen.tsx`](file:///Users/psiborg/Documents/projects/files/Devotee/src/screens/store/StoreHomeScreen.tsx) shows a simple list of products. However, tapping the Cart icon does nothing (`onPress={() => {}}`), and there is no product detail view, cart screen, or store checkout.

#### What Exists in Web but is MISSING in Mobile App:

1. **Product Detail Screen (`ProductDetailScreen`)** ([`apps/web/src/app/store/[slug]`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/store/[slug]/page.tsx))
   - High-resolution sacred image gallery ([`ProductGallery.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/shop/ProductGallery.tsx)).
   - Consecration & Vedic authenticity badge (Gir cow A2 certification, lab-tested purity).
   - Linked Product Variants ([`LinkedProductVariants.tsx`](file:///Users/psiborg/Documents/projects/files/Devotee/src/types/store.ts)) for weight/size (e.g. 500g vs 1kg Ghee, Brass idol sizes).
   - Coupon discounts panel ([`CouponPanel.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/shop/CouponPanel.tsx)).
   - Sacred Gift toggle with customizable blessing note.

2. **Dedicated Cart & Sacred Basket Screen (`CartScreen`)** ([`apps/web/src/app/cart/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/cart/page.tsx))
   - Visual itemized basket with thumbnail, unit price, quantity increment/decrement, and swipe-to-delete.
   - Dual-queue segregation: **Products Cart** vs. **Sacred Gift Cart** ([`CartJourneys.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/shop/CartJourneys.tsx)).
   - Promo code input box (`VEDIC10`, `SHUBH10`, `FESTIVE20`).
   - Price summary: Subtotal, Vedic Promo Discount, Standard/Express Shipping, Total Amount.

3. **Multi-Step Store Checkout Screen (`StoreCheckoutScreen`)** ([`apps/web/src/app/checkout/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/checkout/page.tsx))
   - **Delivery Address Picker**: Choose from saved addresses or enter new destination with pincode validation.
   - **Delivery Speed Options** ([`DeliveryOptions.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/checkout/DeliveryOptions.tsx)): Standard 3-5 day delivery vs. Priority Express.
   - **Gift Consecration**: Optional recipient name, address, and personalized spiritual message card.
   - **Payment Gateway**: Integration with Razorpay (UPI apps, Cards, Netbanking).

4. **Order Confirmation & Tracking Screen (`OrderConfirmationScreen`)** ([`apps/web/src/app/order-confirmation/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/order-confirmation/page.tsx))
   - Order receipt with unique `ORD-XXXXXX` number.
   - Shipment Timeline tracker ([`ShipmentTimeline.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/order-confirmation/ShipmentTimeline.tsx)): `Order Placed` ➔ `Consecration / Packing` ➔ `Dispatched` ➔ `Out for Delivery` ➔ `Delivered`.

---

### Pillar 5: Devotee Account & Spiritual Dashboard Management

The mobile app's [`DevoteeDashboardScreen.tsx`](file:///Users/psiborg/Documents/projects/files/Devotee/src/screens/account/DevoteeDashboardScreen.tsx) currently has several dead buttons with `onPress={() => {}}`.

#### What Exists in Web but is MISSING in Mobile App:

1. **Family & Gotra Sankalp Tree CRUD Management** ([`FamilyMembers.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/devotee/FamilyMembers.tsx))
   - *Current Mobile State*: Read-only list of family members with no way to add, edit, or delete.
   - *Missing Capabilities*:
     - **Add Family Member Modal**: Enter Full Name, Relation (`self`, `spouse`, `father`, `mother`, `son`, `daughter`, `brother`, `sister`, `grandfather`, `grandmother`, `other`).
     - **Vedic Astrological Coordinates**: Selection dropdowns for all 27 Nakshatras, 12 Rashis, Gotra name, and Birth details (Date, Time, City).
     - **Edit & Delete Mutations**: Full integration with `POST/PATCH/DELETE /me/family-members`.

2. **Samagri Orders History Screen (`OrdersHistoryScreen`)** ([`apps/web/src/app/account/orders/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/orders/page.tsx))
   - Paginated list of completed and pending store purchases (`GET /orders`).
   - Order items preview, delivery status badge, and tracking link.
   - **Invoice PDF Download**: Download official tax invoice PDF (`GET /invoices/:id/pdf`).

3. **Unified Payments & Transactions Ledger (`PaymentLedgerScreen`)** ([`apps/web/src/app/account/payments/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/payments/page.tsx))
   - Unified chronological ledger uniting both **Puja Dakshina Payments** and **Samagri Store Orders**.
   - Category filtering: All, Pujas, Samagri, Refunds.
   - Status indicators: Success, Pending, Refunded.
   - Transaction reference IDs, payment methods (UPI/Card), and invoice receipts.

4. **Product Returns & Refunds Portal (`ReturnsScreen`)** ([`apps/web/src/app/account/returns/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/returns/page.tsx))
   - View status of return requests raised on damaged or incorrect items (`GET /returns`).
   - Status pipeline: Request Raised ➔ Inspection Approved ➔ Picked Up ➔ Refund Initiated.

5. **Saved Wishlist Screen (`WishlistScreen`)** ([`apps/web/src/app/account/wishlist/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/wishlist/page.tsx))
   - Grid of saved/bookmarked pujas and sacred store items with one-tap "Move to Cart" or "Book Now".

6. **Devotee Profile & Address Book Screen (`ProfileSettingsScreen`)** ([`apps/web/src/app/account/profile/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/profile/page.tsx))
   - Profile editing: Name, Gender, Date of Birth (`PATCH /me`).
   - Contact verification: Change/verify email and mobile phone with OTP.
   - **Saved Addresses Manager**: Create, edit, and delete multiple home/temple addresses (`GET/POST/PATCH/DELETE /me/addresses`).

7. **In-App Threaded Devotee Support Desk (`SupportDeskScreen`)** ([`apps/web/src/app/account/support/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/account/support/page.tsx))
   - Create tickets categorized by topic (`payouts_refunds`, `puja_booking`, `samagri_delivery`, `account`).
   - Live threaded chat with platform support administrators (`SupportChat` with `role="customer"`).

---

### Pillar 6: Discovery, Home Experience & Vedic Knowledge

While the mobile [`HomeScreen.tsx`](file:///Users/psiborg/Documents/projects/files/Devotee/src/screens/home/HomeScreen.tsx) displays a daily Panchang card and 3 trending pujas, it lacks the rich discovery layers present on the web homepage.

#### What Exists in Web but is MISSING in Mobile App:

1. **Festival Calendar & Shubh Muhurats Hub** ([`apps/web/src/app/festivals/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/festivals/page.tsx))
   - Hindu festival calendar (Navratri, Maha Shivratri, Diwali, Ekadashi, Janmashtami, Ganesh Chaturthi).
   - Significance, fast guidelines, and recommended vidhis.

2. **Vedic Knowledge & Sanatan Articles Hub** ([`apps/web/src/app/blog/page.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/app/blog/page.tsx))
   - Shastric articles, mantra meanings, ritual significance, and astrological insights.

3. **Location / Pincode Delivery Serviceability Selector in Header** ([`DeliveryLocationPicker.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/common/DeliveryLocationPicker.tsx))
   - Header bar dropdown allowing the devotee to set their current city/pincode to auto-filter available Pandits and delivery estimates.

4. **Post-Puja Devotee Review Submission Form** ([`ReviewForm.tsx`](file:///Users/psiborg/Documents/projects/files/VedSarthi-main/apps/web/src/components/reviews/ReviewForm.tsx))
   - Interactive 5-star rating, tag selection (Punctual, Knowledgeable, Authentic Vidhi), and text feedback for completed pujas.

---

## 3. Mobile-Exclusive Feature (Present in Mobile, Absent in Web)

- **Interactive 108-Bead Japam Mala Counter (`JapamMalaScreen.tsx`)**:
  - Elevated central tab in the bottom navigation.
  - Realistic haptic vibration and chime sounds on each bead rotation.
  - Mantra selector (Gayatri Mantra, Maha Mrityunjaya, Om Namah Shivaya, Hare Krishna, Hanuman Chalisa).
  - Round counter (108 beads per round), daily japa target, and streak tracker.
  - *Status*: ⭐ Fully operational and exclusive to mobile.

---

## 4. Side-by-Side Screen & Parity Matrix

| Feature / Screen | Web Route / Component | Mobile App Screen File | Status in Mobile | Priority |
| :--- | :--- | :--- | :--- | :---: |
| **Authentication & OTP** | `/login`, `/register`, `/verify-otp` | `screens/auth/*` | ✅ **Fully Onboard** | Completed |
| **Home / Darshan** | `/` (`apps/web/src/app/page.tsx`) | `screens/home/HomeScreen.tsx` | ⚠️ **Partial** (Lacks festivals & search) | Medium |
| **Puja Catalog & Filters** | `/pujas`, `/puja/[slug]` | `screens/puja/PujaCatalogScreen.tsx` | ✅ **Fully Onboard** | Completed |
| **Puja Details & Vidhi** | `/pujas/[slug]` | `screens/puja/PujaDetailScreen.tsx` | ⚠️ **Partial** (Book CTA is stub) | High |
| **4-Step Puja Booking Flow** | `PujaCheckout.tsx` | *Missing Screen* | ❌ **Missing (0%)** | **Critical** |
| **Devotee Bookings Hub** | `/account/bookings` | *Missing Screen* (`MyBookingsScreen`) | ❌ **Missing (0%)** | **Critical** |
| **Live Ceremony Details** | `/account/bookings/[id]` | *Missing Screen* (`BookingDetailScreen`) | ❌ **Missing (0%)** | **Critical** |
| **Attendance Verification Code** | `CustomerAttendanceCode.tsx` | *Missing Component / Modal* | ❌ **Missing (0%)** | **Critical** |
| **Devotee-Pandit Chat** | `BookingChat.tsx` | *Missing Screen / Modal* | ❌ **Missing (0%)** | High |
| **Pandits Directory** | `/pandits` | *Missing Screen* (`PanditsDirectoryScreen`) | ❌ **Missing (0%)** | High |
| **Pandit Profile & Booking** | `/pandits/[slug]` | *Missing Screen* (`PanditProfileScreen`) | ❌ **Missing (0%)** | High |
| **Store Product Details** | `/store/[slug]` | *Missing Screen* (`ProductDetailScreen`) | ❌ **Missing (0%)** | High |
| **Sacred Basket / Cart** | `/cart` | *Missing Screen* (`CartScreen`) | ❌ **Missing (0%)** | **Critical** |
| **Store Multi-Step Checkout** | `/checkout` | *Missing Screen* (`StoreCheckoutScreen`) | ❌ **Missing (0%)** | **Critical** |
| **Order Confirmation** | `/order-confirmation` | *Missing Screen* (`OrderConfirmScreen`) | ❌ **Missing (0%)** | High |
| **Orders History & Invoices** | `/account/orders` | *Missing Screen* (`OrdersHistoryScreen`) | ❌ **Missing (0%)** | High |
| **Payment & Refund Ledger** | `/account/payments` | *Missing Screen* (`PaymentLedgerScreen`) | ❌ **Missing (0%)** | Medium |
| **Family Sankalp Tree CRUD** | `FamilyMembers.tsx` | `screens/account/DevoteeDashboardScreen.tsx` | ⚠️ **Read-Only** (No Add/Edit/Del) | High |
| **Devotee Profile & Addresses** | `/account/profile` | *Missing Screen* (`ProfileEditScreen`) | ❌ **Missing (0%)** | Medium |
| **Product Returns Portal** | `/account/returns` | *Missing Screen* (`ReturnsScreen`) | ❌ **Missing (0%)** | Low |
| **In-App Helpdesk Support** | `/account/support` | *Missing Screen* (`SupportDeskScreen`) | ❌ **Missing (0%)** | High |
| **Saved Wishlist** | `/account/wishlist` | *Missing Screen* (`WishlistScreen`) | ❌ **Missing (0%)** | Medium |
| **Festival Calendar** | `/festivals` | *Missing Screen* (`FestivalCalendarScreen`) | ❌ **Missing (0%)** | Low |
| **108-Bead Japam Mala** | *None (Mobile Exclusive)* | `screens/utilities/JapamMalaScreen.tsx` | ✅ **Fully Onboard** | Completed |

---

## 5. Recommended Phased Implementation Roadmap

To systematically bring the Devotee mobile app to complete feature parity with the web platform without destabilizing existing code, the following implementation sequence is recommended:

### Phase 1: Core Puja Booking & Ceremony Tracking (Highest Impact)
1. **Build `PujaCheckoutScreen.tsx`**:
   - Multi-step modal or stacked screen: Venue/Address ➔ Muhurat & Date ➔ Pandit & Samagri choice ➔ Review & 25%/100% Dakshina payment choice.
   - Hook to `POST /checkout/holds` and `POST /checkout/orders`.
2. **Build `MyBookingsScreen.tsx` & `BookingDetailScreen.tsx`**:
   - List active and past devotee bookings from `GET /bookings`.
   - Detailed tracker with live status timeline (`BookingProgress`), 6-digit attendance code display, balance payment button, and ceremony details.
3. **Build `DevoteePanditChatScreen.tsx`**:
   - Direct real-time chat between devotee and assigned Acharya (`GET/POST /bookings/:id/messages`).

### Phase 2: Samagri Store, Cart & E-Commerce Funnel
1. **Build `ProductDetailScreen.tsx`**:
   - Product gallery, variant selector (e.g. 500g vs 1kg Ghee), and "Add to Sacred Basket" CTA.
2. **Build `CartScreen.tsx`**:
   - Connect existing `useCartStore` to a full UI: item quantity updates, sacred gift note toggle, promo code input, and checkout button.
3. **Build `StoreCheckoutScreen.tsx` & `OrderConfirmationScreen.tsx`**:
   - Delivery address selection, delivery speed options, payment gateway trigger, and order confirmation receipt.
4. **Build `OrdersHistoryScreen.tsx`**:
   - View past samagri purchases and order tracking timeline.

### Phase 3: Devotee Account & Sankalp Tree Management
1. **Implement Family Member Add / Edit / Delete Modal**:
   - Allow devotees to add family members with Gotra, Nakshatra, Rashi, and Relation (`POST/PATCH/DELETE /me/family-members`).
2. **Build `ProfileSettingsScreen.tsx` & `SavedAddressesScreen.tsx`**:
   - Personal details edit and address book manager (`/me/addresses`).
3. **Build `SupportDeskScreen.tsx`**:
   - Threaded in-app support chat for customer assistance (`GET/POST /support/threads`).
4. **Build `PaymentLedgerScreen.tsx`**:
   - Unified transaction history across Pujas and Samagri orders.

### Phase 4: Pandits Directory & Discovery Enhancements
1. **Build `PanditsDirectoryScreen.tsx` & `PanditDetailScreen.tsx`**:
   - Browse and filter verified Acharyas by language, city, and Vedic specialization, with direct booking.
2. **Build `WishlistScreen.tsx`**:
   - Saved items and quick-access bookmarks.
3. **Add Location / Pincode Serviceability Selector** in the app header.
