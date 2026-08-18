# Premika Standalone Node.js Backend

Standalone REST API backend for the Premika Ecommerce Platform built with Node.js, Express, TypeScript, and Drizzle ORM.

---

## 1. Architecture Overview

```text
               ┌────────────────────────┐
               │ Next.js Web Frontend   │ (Port 3000)
               └───────────┬────────────┘
                           │
                           │ HTTP / REST APIs
                           ▼
               ┌────────────────────────┐
               │  Node.js Express API   │ (Port 5001)
               └───────────┬────────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Database      Razorpay     Delhivery
         (PostgreSQL)   (Payments)   (Logistics)
                           │
                        Nodemailer
                        (Email)
```

- **Independent API Server**: Runs on `http://localhost:5001` (configurable via `PORT`).
- **Database Owner**: Direct connection pool to PostgreSQL (Supabase) via Drizzle ORM.
- **Mobile-Ready**: Serves JSON REST APIs accessible by web clients, curl, and future mobile clients (React Native / Expo).

---

## 2. Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server listening port | `5001` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma separated) | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_SESSION_SECRET` | Secret key for signing admin session token cookies | `min_32_random_string` |
| `RAZORPAY_KEY_ID` | Razorpay public key ID | `rzp_test_xxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay private secret key | `xxxxxxxxxxxx` |
| `DELHIVERY_API_URL` | Delhivery API base endpoint | `https://track.delhivery.com` |
| `DELHIVERY_API_TOKEN` | Delhivery logistics API token | `your_token_here` |
| `DELHIVERY_WEBHOOK_SECRET` | Delhivery webhook verification secret | `your_webhook_secret` |
| `GMAIL_USER` | SMTP email sender username | `contact@premika.shop` |
| `GMAIL_APP_PASSWORD` | SMTP email app password | `xxxx-xxxx-xxxx-xxxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin service role key | `ey...` |

---

## 3. Server Management & Scripts

```bash
# Install dependencies
npm install

# Run backend in development mode (hot reloading)
npm run dev

# Build TypeScript to JavaScript (/dist)
npm run build

# Start production server from /dist
npm start

# Run database migrations
npm run db:push
```

---

## 4. API Surface Summary

### System & Health
- `GET /health` — Returns JSON status (`{"status":"ok","database":"connected"}`)

### Storefront APIs (`/api/*`)
- `GET /api/products` — List products with search, category filter, sorting & pagination
- `GET /api/products/:slug` — Get single product details by slug or ID
- `GET /api/categories` — List active storefront categories
- `GET /api/categories/:slug` — Get single category details
- `POST /api/coupons/validate` — Validate promo coupon code
- `POST /api/createOrder` — Create Razorpay order
- `POST /api/verifyOrder` — Verify Razorpay payment signature & confirm order
- `POST /api/orders/track` — Track customer order by order number & phone
- `GET /api/orders/:orderNumber/invoice` — Download order PDF invoice
- `GET /api/maintenance` — Get store maintenance status
- `POST /api/webhooks/delhivery` — Webhook handler for shipping updates

### Admin Console APIs (`/api/admin/*`)
- `POST /api/admin/auth/login` — Admin login & cookie issue
- `POST /api/admin/auth/logout` — Admin logout & cookie clear
- `GET /api/admin/auth/me` — Verify admin session token
- `GET /api/admin/dashboard/stats` — Summary metrics
- `GET /api/admin/products` — List admin product records
- `POST /api/admin/products` — Create product
- `GET /api/admin/products/:id` — Get product detail
- `PUT /api/admin/products/:id` — Update product
- `DELETE /api/admin/products/:id` — Delete product
- `PATCH /api/admin/products/:id/toggle` — Toggle active status
- `GET /api/admin/categories` — List categories
- `POST /api/admin/categories` — Create category
- `PUT /api/admin/categories/:id` — Update category
- `DELETE /api/admin/categories/:id` — Delete category
- `GET /api/admin/orders` — List admin orders
- `GET /api/admin/orders/:id` — Get order details
- `PATCH /api/admin/orders/:id/status` — Update order status
- `POST /api/admin/orders/:id/shipment/create` — Create Delhivery shipment
- `POST /api/admin/orders/:id/shipment/sync` — Sync Delhivery tracking
- `GET /api/admin/orders/:id/shipment/label` — Fetch shipping label
- `GET /api/admin/coupons` — List coupons
- `POST /api/admin/coupons` — Create coupon
- `PUT /api/admin/coupons/:id` — Update coupon
- `DELETE /api/admin/coupons/:id` — Delete coupon
- `GET /api/admin/customers` — List customer profiles
- `GET /api/admin/customers/:id` — Get customer profile
- `GET /api/admin/reviews` — List reviews
- `PATCH /api/admin/reviews/:id` — Moderate review
- `GET /api/admin/settings/*` — Store, SEO, Social, Contact, Delhivery settings
- `GET /api/admin/system` — System diagnostics
