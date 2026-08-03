# ELESENE — Developer's & Architecture Guide 🚀

Welcome to the official developer documentation for **ELESENE**, an ultra-luxury digital atelier and e-commerce platform. This document provides a comprehensive overview of the architecture, setup instructions, database migrations, configuration parameters, data models, API endpoints catalog, code quality standards, and production deployment procedures.

---

## 1. Architecture Overview

ELESENE is built using a modern decoupled monorepo architecture, separating the React single-page application (SPA) client from the Express RESTful API server.

```
ELESENE/
├── api/
│   └── index.js                   # Vercel Serverless Function Entrypoint (requires ../server/src/app)
├── client/                        # React 19 + Vite Storefront & Admin Application
│   ├── src/
│   │   ├── api/                   # Centralized API HTTP client wrappers
│   │   ├── assets/                # Static images & branding assets
│   │   ├── components/            # UI components (admin, common, home, layout, product, profile)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Route page components
│   │   ├── store/                 # Zustand state stores
│   │   ├── utils/                 # Utility helper functions
│   │   └── main.jsx               # Client entry point
│   ├── eslint.config.js           # Flat ESLint configuration
│   └── vite.config.js             # Vite bundler configuration
│
├── server/                        # Express 5 REST API Backend Server
│   ├── index.js                   # Forwarder re-exporting app (require('./src/app'))
│   ├── package.json               # Server package config (main: "src/app.js")
│   └── src/
│       ├── app.js                 # Shared Express Application configuration & routes
│       ├── index.js               # Standalone HTTP Server Listener (sequelize.authenticate + app.listen)
│       ├── config/                # Database & Supabase configurations
│       ├── controllers/           # Request handlers for routes
│       ├── middleware/            # Auth, CORS, Rate Limiters, Uploads middleware
│       ├── migrations/            # Sequelize database migrations
│       ├── models/                # Sequelize ORM model definitions
│       ├── routes/                # Express API Route definitions (8 domain routers)
│       ├── scripts/               # CLI scripts (seed-admin.js)
│       └── services/              # External services (payments, email)
│
├── .env.example                   # Unified Root Environment Variable Template
├── README.md                      # General Project Overview
└── DEVELOPERS.md                  # Detailed Technical Architecture Guide
```

### Entry Point Consolidation Architecture

To maintain consistency between serverless and server environments, server initialization is structured as follows:

1. **`server/src/app.js`**: Core Express app module. Instantiates Express, configures security headers (Helmet), CORS, JSON body-parser with `req.rawBody` capture, static uploads serving (`/uploads`), health checks (`/` and `/api`), mounts all 8 API route groups, and attaches 404 and 500 error handlers.
2. **`server/src/index.js`**: Standalone HTTP listener. Imports `app` from `./app`, connects to PostgreSQL via `sequelize.authenticate()`, and starts the HTTP server on `PORT` (default 3000). Exports `app`.
3. **`api/index.js`**: Thin Vercel serverless function entrypoint. Requires `../server/src/app` and exports `module.exports = app;`.
4. **`server/index.js`**: CommonJS forwarder module exporting `module.exports = require('./src/app');`.

---

## 2. Prerequisites

Ensure your local development workstation meets the following requirements:

- **Node.js**: `v18.x` or `v20.x LTS`
- **npm**: `v9.x` or `v10.x`
- **PostgreSQL**: `v14+` (Local PostgreSQL installation or Neon Serverless Postgres instance)
- **Git**: `v2.x`

---

## 3. Local Setup & Installation

Follow these steps to set up and run ELESENE locally:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Pritam-Pattanaik/ELESENE.git
cd ELESENE
```

### Step 2: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### Step 3: Configure Environment Variables
Copy the `.env.example` templates to `.env` in root, `server/`, and `client/`:
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Update `server/.env` with your PostgreSQL database credentials and secret keys.

### Step 4: Run Database Migrations & Seed Super Admin
```bash
cd server
npm run db:migrate
node src/scripts/seed-admin.js
cd ..
```

### Step 5: Start Development Servers
Start both backend and frontend servers in separate terminal windows:
```bash
# Terminal 1: Backend Server (http://localhost:3000)
cd server
npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

---

## 4. Database Migrations (`sequelize-cli`)

ELESENE uses **Sequelize CLI** for database schema versioning and migrations. All migration scripts are located in `server/src/migrations/`.

### Migration Commands
Run all migration commands from the `server/` directory:

- **Run Pending Migrations**:
  ```bash
  npm run db:migrate
  ```
  Applies all unexecuted schema migrations against the configured PostgreSQL database.

- **Rollback Latest Migration**:
  ```bash
  npm run db:migrate:undo
  ```
  Reverts the most recent migration batch.

- **Check Migration Status**:
  ```bash
  npm run db:migrate:status
  ```
  Displays the list of applied and pending migrations.

---

## 5. Environment Variables Reference Table

### Server Environment Variables (`server/.env`)

| Variable Name | Required | Description | Default / Example |
|---|---|---|---|
| `PORT` | No | HTTP server port | `3000` |
| `NODE_ENV` | Yes | Application environment mode | `development` / `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/elesene` |
| `USE_NEON` | No | Enable SSL connection mode for Neon DB | `false` / `true` |
| `DB_HOST` | Fallback | PostgreSQL host (used if DATABASE_URL absent) | `localhost` |
| `DB_PORT` | Fallback | PostgreSQL port | `5432` |
| `DB_NAME` | Fallback | PostgreSQL database name | `elesene` |
| `DB_USER` | Fallback | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | Fallback | PostgreSQL password | `password` |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens | `elesene_dev_secret_key_2026` |
| `SUPABASE_URL` | Optional | Supabase project URL | `https://<id>.supabase.co` |
| `SUPABASE_ANON_KEY` | Optional | Supabase public anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role secret key | `eyJ...` |
| `SUPABASE_JWT_SECRET` | Optional | Supabase JWT Secret | `secret` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID for payments | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay API Secret | `secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay Webhook signature secret | `secret` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `CLIENT_URL` | Yes | Frontend application URL for email links | `http://localhost:5173` |
| `ADMIN_EMAIL` | Yes | Initial email for seeding Super Admin | `admin@elesene.com` |
| `ADMIN_PASSWORD` | Yes | Initial password for seeding Super Admin | `Elesene@2026` |

### Client Environment Variables (`client/.env`)

| Variable Name | Required | Description | Default / Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL for backend REST API | `http://localhost:3000/api` |
| `VITE_SUPABASE_URL` | Optional | Public Supabase URL | `https://<id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Optional | Public Supabase Anon key | `eyJ...` |
| `VITE_RAZORPAY_KEY_ID` | Optional | Public Razorpay Key ID for Checkout | `rzp_test_...` |

---

## 6. Data Architecture & Model Schemas

ELESENE uses Sequelize ORM to model relational data.

### Core Models & Relationships

1. **`User`**: Account management supporting roles (`customer`, `admin`, `super_admin`).
   - *Has many*: `Address`, `Order`, `Review`, `Wishlist`, `Cart`.
2. **`Product`**: Base luxury catalog item (`title`, `slug`, `price`, `compareAtPrice`, `description`, `details`, `isFeatured`, `status`).
   - *Belongs to*: `Category`.
   - *Has many*: `ProductImage`, `ProductVariant`, `Review`, `Wishlist`, `CartItem`, `OrderItem`.
3. **`ProductImage`**: High-resolution gallery images (`imageUrl`, `isPrimary`, `sortOrder`).
   - *Belongs to*: `Product`.
4. **`ProductVariant`**: Color and size matrix items (`sku`, `color`, `size`, `stock`, `priceOverride`).
   - *Belongs to*: `Product`.
   - *Has many*: `CartItem`, `OrderItem`.
5. **`Category`**: Catalog category tree (`name`, `slug`, `image`, `description`, `isActive`).
   - *Has many*: `Product`.
6. **`Cart` & `CartItem`**: Persistent shopping carts for guest session IDs or authenticated user IDs.
   - *`Cart` belongs to*: `User` (optional).
   - *`CartItem` belongs to*: `Cart`, `Product`, `ProductVariant`.
7. **`Order` & `OrderItem`**: Purchase records tracking total, status, shipping address, Razorpay order/payment IDs, tracking numbers.
   - *`Order` belongs to*: `User`, `Address`.
   - *`OrderItem` belongs to*: `Order`, `Product`, `ProductVariant`.
8. **`Address`**: Saved customer shipping/billing addresses (`street`, `city`, `state`, `postalCode`, `country`, `isDefault`).
   - *Belongs to*: `User`.
9. **`Coupon`**: Promotional discounts (`code`, `discountType`, `discountValue`, `minOrderValue`, `expiresAt`, `isActive`).
10. **`Review`**: Customer ratings (`rating`, `comment`, `status`).
    - *Belongs to*: `User`, `Product`.
11. **`Wishlist`**: Saved items per user account.
    - *Belongs to*: `User`, `Product`.

---

## 7. Complete API Endpoints Catalog (67 Endpoints)

### 7.1 Health & System Endpoints
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/` | Root server status check | Public |
| `GET` | `/api` | API health check endpoint | Public |

### 7.2 Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer account | Public (Rate Limited) |
| `POST` | `/api/auth/login` | Customer login | Public (Rate Limited) |
| `POST` | `/api/auth/admin-login` | Admin & Super Admin login | Public (Rate Limited) |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public (Rate Limited) |
| `POST` | `/api/auth/reset-password` | Reset password using token | Public (Rate Limited) |
| `POST` | `/api/auth/change-password` | Change current user password | Protected |
| `POST` | `/api/auth/logout` | Logout user session | Protected |
| `POST` | `/api/auth/verify-email` | Verify email address | Public |
| `POST` | `/api/auth/send-verification-email` | Resend verification email | Protected |
| `GET` | `/api/auth/profile` | Retrieve logged-in user profile | Protected |

### 7.3 Product Catalog Routes (`/api/products`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/products` | Query products (search, filter, paginate) | Public |
| `GET` | `/api/products/trending` | Fetch trending & featured products | Public |
| `GET` | `/api/products/:slug` | Fetch product details by URL slug | Public |
| `POST` | `/api/products/:id/reviews` | Submit product review & rating | Protected |

### 7.4 Category Routes (`/api/categories`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/categories` | List active categories | Public |

### 7.5 Cart Routes (`/api/cart`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/cart` | Retrieve user/guest cart | Optional Auth |
| `POST` | `/api/cart/items` | Add product variant to cart | Optional Auth |
| `PUT` | `/api/cart/items/:id` | Update cart item quantity | Optional Auth |
| `DELETE` | `/api/cart/items/:id` | Remove item from cart | Optional Auth |

### 7.6 Order & Checkout Routes (`/api/orders`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `POST` | `/api/orders/webhook` | Razorpay payment webhook endpoint | Public (Webhook Signature) |
| `POST` | `/api/orders/initiate` | Initiate checkout & create order | Protected |
| `POST` | `/api/orders/verify-payment` | Verify Razorpay payment signature | Protected |
| `POST` | `/api/orders/apply-coupon` | Validate & apply promotional coupon | Protected |
| `GET` | `/api/orders` | Retrieve authenticated user orders | Protected |
| `POST` | `/api/orders/:id/cancel` | Request order cancellation | Protected |
| `PUT` | `/api/orders/:id/cancel` | Request order cancellation (alternative) | Protected |

### 7.7 User Profile & Account Routes (`/api/user`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/user/profile` | Retrieve customer profile | Protected |
| `PUT` | `/api/user/profile` | Update customer profile details | Protected |
| `GET` | `/api/user/addresses` | List saved shipping addresses | Protected |
| `POST` | `/api/user/addresses` | Add new shipping address | Protected |
| `PUT` | `/api/user/addresses/:id` | Update existing address | Protected |
| `DELETE` | `/api/user/addresses/:id` | Delete address | Protected |
| `GET` | `/api/user/wishlist` | Retrieve wishlist items | Protected |
| `POST` | `/api/user/wishlist` | Add product to wishlist | Protected |
| `DELETE` | `/api/user/wishlist/:id` | Remove product from wishlist | Protected |

### 7.8 Payment Webhook Routes (`/api/payments`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `POST` | `/api/payments/webhook` | Standard payment gateway webhook | Public (Rate Limited) |

### 7.9 Admin & Moderation Routes (`/api/admin`)
| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin analytics & metrics | Admin / Super Admin |
| `GET` | `/api/admin/products` | List catalog products for management | Admin / Super Admin |
| `POST` | `/api/admin/products` | Create new product | Admin / Super Admin |
| `GET` | `/api/admin/products/:id` | Fetch product details for editing | Admin / Super Admin |
| `PUT` | `/api/admin/products/:id` | Update product details | Admin / Super Admin |
| `DELETE` | `/api/admin/products/:id` | Delete product | Admin / Super Admin |
| `POST` | `/api/admin/products/:id/images` | Upload gallery images | Admin / Super Admin |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Delete gallery image | Admin / Super Admin |
| `POST` | `/api/admin/products/:id/variants` | Add variant to product | Admin / Super Admin |
| `PUT` | `/api/admin/products/:id/variants/:variantId` | Update product variant | Admin / Super Admin |
| `DELETE` | `/api/admin/products/:id/variants/:variantId` | Delete product variant | Admin / Super Admin |
| `GET` | `/api/admin/categories` | List categories for administration | Admin / Super Admin |
| `POST` | `/api/admin/categories` | Create category | Admin / Super Admin |
| `PUT` | `/api/admin/categories/:id` | Update category details | Admin / Super Admin |
| `DELETE` | `/api/admin/categories/:id` | Delete category | Admin / Super Admin |
| `GET` | `/api/admin/orders` | List customer orders | Admin / Super Admin |
| `GET` | `/api/admin/orders/:id` | Get order details | Admin / Super Admin |
| `PUT` | `/api/admin/orders/:id/status` | Update fulfillment/payment status | Admin / Super Admin |
| `PUT` | `/api/admin/orders/:id/tracking` | Update shipment tracking details | Admin / Super Admin |
| `GET` | `/api/admin/users` | List registered user accounts | Super Admin |
| `GET` | `/api/admin/users/:id` | Get user details | Super Admin |
| `PUT` | `/api/admin/users/:id/role` | Modify user role (`customer`, `admin`) | Super Admin |
| `GET` | `/api/admin/coupons` | List discount coupons | Super Admin |
| `POST` | `/api/admin/coupons` | Create promotional coupon | Super Admin |
| `PUT` | `/api/admin/coupons/:id` | Update coupon parameters | Super Admin |
| `DELETE` | `/api/admin/coupons/:id` | Deactivate/Delete coupon | Super Admin |
| `GET` | `/api/admin/reviews` | List customer reviews for moderation | Admin / Super Admin |
| `PUT` | `/api/admin/reviews/:id` | Approve/Moderate customer review | Admin / Super Admin |
| `DELETE` | `/api/admin/reviews/:id` | Delete review | Admin / Super Admin |

---

## 8. Code Quality & Linting (`npm run lint`)

ELESENE enforces high code quality standards across client and server.

### Running Client Linting
To check the React client for syntax or lint violations:
```bash
cd client
npm run lint
```

To automatically fix lint errors:
```bash
cd client
npm run lint -- --fix
```

### Server Syntax Verification
To verify backend entry points for valid Node.js syntax:
```bash
node -c server/src/app.js server/src/index.js api/index.js
```

---

## 9. Production Deployment Notes (Vercel + Neon/Supabase)

### Vercel Serverless Setup
1. ELESENE is configured with `vercel.json` to handle single-page application routing and API function rewrites automatically:
   - Requests matching `/api/*` are routed to the `api/index.js` serverless function.
   - All other routes serve the static React frontend from `client/dist`.
2. Configure Environment Variables in the Vercel Dashboard under **Project Settings > Environment Variables**:
   - Set `DATABASE_URL` to your Neon/Supabase PostgreSQL connection URI.
   - Set `USE_NEON=true` to enable SSL connection parameters.
   - Set `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
   - Set client variables `VITE_API_URL=/api`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`.

### Database SSL Connection (Neon Postgres)
When using Neon or Supabase in production:
- Ensure `USE_NEON=true` is set in the environment variables.
- Sequelize database configuration (`server/src/config/db.js`) will enable `ssl: { require: true, rejectUnauthorized: false }` mode required for cloud serverless Postgres services.
