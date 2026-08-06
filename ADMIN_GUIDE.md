# ADMIN_GUIDE.md — Brand Investment Administration Guide

## 1. Accessing the Brand Investment Dashboard
- Navigate to `/admin/loyalty` or select **Brand Investment** from the Admin Sidebar.
- Authorization requirement: Must hold `admin` or `superadmin` role.

---

## 2. Dynamic Tier Management
1. Navigate to **Tier Configuration** tab.
2. View existing thresholds:
   - **Seed**: 0 – 2,999 IP
   - **Bronze**: 3,000 – 7,999 IP
   - **Silver**: 8,000 – 14,999 IP
   - **Gold**: 15,000 – 29,999 IP
   - **Platinum**: 30,000 – 59,999 IP
   - **Diamond**: 60,000+ IP
3. Click **Edit Tier** to adjust min/max ranges or associated perks (early access, free shipping, VIP event access).

---

## 3. Campaign & Multiplier Setup
- Configure global multipliers for special events:
  - **Anniversary Campaign**: 2.0x Investment Points
  - **Festival Campaign**: 1.5x Investment Points
  - **Double Investment Days**: Multiplier toggle for specific dates.

---

## 4. Manual Point Adjustments & Audit Trails
1. Search for customer by name, email, or user ID.
2. Select **Adjust Investment/Loyalty Points**.
3. Input IP and LP deltas along with a required **Reason**.
4. Every change is immutably logged into `investment_transactions` with admin ID attribution.
