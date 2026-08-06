# PROJECT_ANALYSIS.md — ELESENE Brand Investment & Loyalty Architecture

## 1. Executive Summary & System Overview

ELESENE is a next-generation luxury fashion e-commerce web application designed with high visual standards, micro-interactions, responsive layouts, and an end-to-end commerce pipeline (catalog, cart, checkout, payments, user accounts, order management, and loyalty mechanics).

This project analysis documents the current architectural state of ELESENE prior to executing Phase 1 through Phase 8 of the **Brand Investment Program** transformation.

---

## 2. High-Level Architecture Diagram

```
                              ┌────────────────────────────────────────┐
                              │            CLIENT (REACT + VITE)       │
                              │  - React 18 + Vite                    │
                              │  - Zustand Stores (Auth, Cart, UI)    │
                              │  - React Query (Server State Cache)   │
                              │  - Framer Motion (Luxury UI/UX)       │
                              │  - TailwindCSS + Custom Tokens        │
                              └───────────────────┬────────────────────┘
                                                  │
                                          REST / JSON APIs
                                                  │
                              ┌───────────────────▼────────────────────┐
                              │          SERVER (NODE.JS + EXPRESS)    │
                              │  - Express REST APIs                   │
                              │  - JWT & Supabase Auth Middleware      │
                              │  - Sequelize ORM                       │
                              │  - Service Layer (Loyalty, Payment)    │
                              │  - Grok AI Engine                      │
                              └───────────────────┬────────────────────┘
                                                  │
                                            Sequelize ORM
                                                  │
                              ┌───────────────────▼────────────────────┐
                              │         DATABASE (POSTGRESQL)          │
                              │  - Users, Orders, Products, Cart      │
                              │  - Loyalty Tiers & Transactions       │
                              │  - Notifications & Reviews             │
                              └────────────────────────────────────────┘
```

---

## 3. Directory Structure & Key Subsystems

```
ELESENE/
├── client/                      # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/                 # Axios API clients & fallback datasets
│   │   ├── components/          # Reusable UI & domain components
│   │   ├── hooks/               # Custom React hooks (auth, cart, loyalty)
│   │   ├── pages/               # Page views (Shop, Checkout, Account, Admin)
│   │   ├── store/               # Zustand global state management
│   │   └── utils/               # Formatting, constants, helper logic
├── server/                      # Backend Application (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Database (Sequelize), Supabase, Env configs
│   │   ├── controllers/         # Request handlers (User, Order, Loyalty, Admin)
│   │   ├── middleware/          # Auth, CORS, Uploads, Rate Limiting
│   │   ├── migrations/          # DB Schema migrations
│   │   ├── models/              # Sequelize model definitions
│   │   ├── routes/              # Express API route maps
│   │   └── services/            # Core business logic (Loyalty, Email, Grok AI)
```

---

## 4. Existing Data & API Flow

1. **User Authentication Flow**:
   - Client authenticates via Supabase Auth or direct email/password JWT endpoint (`/api/auth`).
   - `auth.middleware.js` inspects Bearer tokens, resolves identity, updates or auto-provisions user rows in PostgreSQL.

2. **Commerce & Checkout Flow**:
   - Products & variants browsed via `/api/products`.
   - Cart persisted via server API (`/api/cart`) and local sync.
   - Order creation triggered via `/api/orders`, creating pending `Order` and `OrderItem` records.
   - Payment via Razorpay (`/api/payments`), updating payment status to `paid`.

3. **Current Loyalty Engine Flow**:
   - Order delivery triggers `awardPoints()` in `loyalty.service.js`.
   - Ratio: 1 point per ₹100 spent.
   - Return/refund triggers `reversePoints()`, deducting awarded points.
   - Tiers evaluated against `LoyaltyTier` table definitions (default tiers: Member, Insider, Founder).

---

## 5. Database Schema Relationships

```
        ┌─────────────┐             ┌──────────────┐
        │    User     │1───────────*│    Order     │
        └──────┬──────┘             └──────┬───────┘
               │                           │
               │1                          │1
               │                           │
               │*                          │*
        ┌──────▼──────┐             ┌──────▼───────┐
        │ LoyaltyTxn  │             │  OrderItem   │
        └─────────────┘             └──────────────┘
```

Existing core tables:
- `users`: Core profile, firebase_uid, email, loyalty_points, loyalty_tier.
- `orders`: Order totals, payment status, points_awarded, tracking.
- `loyalty_transactions`: Audit log of earn/reversal/adjustment points.
- `loyalty_tiers`: Dynamic tier ranges and perk definitions.
- `loyalty_return_stats`: Fraud prevention and return rate tracking.

---

## 6. Components Inventory

### Reusable Components
- `client/src/components/common/Header.jsx`: Main navigation bar.
- `client/src/components/common/Footer.jsx`: Global brand footer.
- `client/src/components/common/Skeleton.jsx`: UI loading skeletons.
- `client/src/components/auth/CustomerAuthGuard.jsx`: Route guard for authenticated users.

### Components to Modify
- `client/src/pages/account/LoyaltyPage.jsx`: Replace basic points UI with the **Brand Investment Dashboard**.
- `client/src/pages/account/DashboardTabs.jsx`: Integrate investment progress indicators.
- `client/src/pages/product/ProductDetailPage.jsx`: Integrate "Invest with this purchase" preview.
- `client/src/pages/checkout/CheckoutPage.jsx`: Show real-time IP/LP earned and tier progress.
- `client/src/pages/admin/LoyaltyManagement.jsx`: Transform into **Brand Investment Management Dashboard**.

### Components to Create
- `client/src/components/investment/InvestmentTierCard.jsx`: Premium tier card with metallic gradients and progress bars.
- `client/src/components/investment/InvestmentTimeline.jsx`: Visual timeline of investment milestones and activity.
- `client/src/components/investment/RewardRedemptionModal.jsx`: Interactive modal for redeeming Loyalty Points for rewards.
- `client/src/components/investment/CheckoutInvestmentBanner.jsx`: Interactive summary widget during checkout.
- `client/src/components/investment/CelebrationModal.jsx`: Post-payment motion celebrating investment unlock.

---

## 7. Technical Risks & Mitigation Strategies

1. **Race Conditions in Point Accrual**:
   - *Risk*: Concurrent order updates or multiple review submissions multiplying points.
   - *Mitigation*: Enforce Sequelize database transactions (`t`) with row locks (`FOR UPDATE`) during point balance updates.

2. **Decimal Precision & Point Manipulation**:
   - *Risk*: Floating point rounding errors in INR to IP/LP conversions.
   - *Mitigation*: Use Math.floor on whole currency units and store integer points in DB.

3. **Referral & Engagement Fraud**:
   - *Risk*: Self-referrals or repeated fake reviews to harvest IP/LP.
   - *Mitigation*: Unique referral constraints, IP address hashing, purchase verification before awarding review bonuses.
