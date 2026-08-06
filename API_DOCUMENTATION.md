# API_DOCUMENTATION.md — Brand Investment Program REST APIs

## Overview
This document specifies all endpoints added or modified for the ELESENE Brand Investment Program.

---

## 1. User & Investment Dashboard Endpoints

### `GET /api/loyalty/investment/summary`
- **Auth**: Protected (Customer)
- **Description**: Returns user's lifetime investment, IP, LP, current tier, progress to next tier, perks, recent transactions, and redemptions.
- **Response**:
```json
{
  "success": true,
  "summary": {
    "lifetimeInvestmentAmount": 14500.00,
    "investmentPoints": 14500,
    "loyaltyPoints": 145,
    "investmentTier": "Silver",
    "tierAchievedAt": "2026-07-15T10:00:00.000Z",
    "nextTierProgress": 92,
    "pointsToNextTier": 500,
    "nextTier": "Gold",
    "totalReferrals": 2,
    "engagementScore": 370
  }
}
```

### `GET /api/loyalty/investment/history`
- **Auth**: Protected (Customer)
- **Query Params**: `page=1`, `limit=20`
- **Description**: Paginated list of all IP and LP transactions with breakdown of source and order reference.

### `POST /api/loyalty/investment/engage`
- **Auth**: Protected (Customer)
- **Body**: `{ "activityType": "profile_completion" | "social_share" | "review", "referenceId": "string" }`
- **Description**: Evaluates and awards engagement bonus points (e.g. +50 IP for profile completion, +25 IP for social share).

### `POST /api/loyalty/investment/redeem`
- **Auth**: Protected (Customer)
- **Body**: `{ "rewardType": "coupon" | "free_shipping" | "product", "lpCost": 100 }`
- **Description**: Redeems Loyalty Points for rewards without reducing Investment Points balance.

---

## 2. Product & Checkout Investment Endpoints

### `POST /api/loyalty/investment/calculate-order`
- **Auth**: Optional / Public
- **Body**: `{ "cartSubtotal": 5400.00, "campaignCode": "FESTIVAL15" }`
- **Description**: Pre-calculates exact IP and LP earned and projects next tier progress.

---

## 3. Admin Management Endpoints

### `GET /api/loyalty/admin/investment-analytics`
- **Auth**: Admin / SuperAdmin
- **Description**: Program-wide analytics including total IP/LP issued, LTV distribution, tier metrics, and top investors.

### `POST /api/loyalty/admin/adjust-points`
- **Auth**: Admin / SuperAdmin
- **Body**: `{ "userId": "UUID", "ipAmount": 500, "lpAmount": 50, "reason": "Customer Service Goodwill" }`
- **Description**: Manually updates points balance with audit logging.

### `PUT /api/loyalty/admin/tiers/:id`
- **Auth**: SuperAdmin
- **Body**: Min IP, Max IP, Tier Name, Perks JSON, Sort Order.
- **Description**: Dynamic configuration of brand investment tier thresholds.
