# Preethika — Premium E-Commerce Platform

Preethika is a full-stack e-commerce web application built with **Next.js (App Router)**, **MongoDB/Mongoose**, and **Razorpay** for payments. It includes a complete customer-facing storefront and a full admin dashboard for managing the store, all in a single Next.js codebase.

> This repo also contains a `legacy-express/` folder — an earlier version of the project built with Express + EJS. It is kept for reference only and is not part of the active application.

## Features

### Storefront (customer-facing)
- Browse products by category with search and filtering (`app/products`)
- Product detail pages with image gallery, reviews, and ratings (`app/products/[id]`, `ProductDetailsClient.tsx`)
- Cart management (`app/cart`, `app/api/cart`)
- Wishlist (`app/wishlist`, `app/api/wishlist`)
- Multi-step checkout with saved addresses, coupon codes, and optional "green shipping" (`app/checkout`, `app/api/checkout`)
- Payments via **Razorpay** (card/UPI/etc.) with server-side HMAC signature verification, or via **wallet balance**, or **Cash on Delivery**
- Wallet system with 2% cashback on every order (`app/wallet`, `app/api/wallet`)
- Order history, order tracking, and order cancellation requests (`app/orders`, `app/api/orders`)
- User profile and address book management (`app/profile`, `app/api/profile/address`)
- Auth: register, login, logout, forgot/reset password via email OTP (`app/login`, `app/register`, `app/forgot-password`, `app/reset-password`, `app/api/auth/*`)
- Floating AI assistant widget (`components/AiAssistant.tsx`) — currently a rule-based demo chatbot, not connected to a live AI backend
- Contact form (`app/contact`)
- SEO: dynamic `sitemap.ts` and `robots.ts`

### Admin dashboard (`/admin`)
Protected by JWT-based auth (`isadmin` flag) enforced in `middleware.ts`. Server-rendered in `app/admin/page.tsx` with data fetched directly from MongoDB, and includes:
- Product management (create/edit/delete, stock, pricing, images)
- Category management
- Coupon management (percentage discount, min/max value rules)
- Banner/promotions management
- Order management and status updates
- Customer management (block/unblock users)
- Review moderation (delete reviews)
- Sales reports exportable as **PDF** and **Excel (XLSX)**
- Admin registration gated by an authorization key (`ADMIN_SECRET_KEY`)

## Tech Stack

| Layer            | Technology                                      |
|-------------------|--------------------------------------------------|
| Framework         | Next.js 16 (App Router, Turbopack)               |
| Language          | TypeScript                                       |
| UI                | React 19, Tailwind CSS v4, Framer Motion, Lucide icons |
| Database          | MongoDB via Mongoose                             |
| Auth              | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing |
| Payments          | Razorpay                                         |
| Email             | Nodemailer (SMTP)                                |
| Reports           | `pdfkit` (PDF), `exceljs` (XLSX)                 |
| Charts (admin)    | Recharts                                         |

## Project Structure

```
app/                    Next.js App Router pages and API routes
  admin/                Admin login, register, and dashboard entry
  api/                  All backend API routes (auth, cart, checkout, orders,
                         products, admin/*, razorpay, wallet, wishlist, etc.)
  (customer pages)/     products, cart, checkout, orders, profile, wallet,
                         wishlist, login, register, contact, etc.
components/             Shared and client-side React components
  AdminDashboard.tsx    Main admin panel UI
  AiAssistant.tsx       Floating chat widget (demo/rule-based)
  Navbar.tsx / Footer.tsx / HomeClient.tsx / ProductsClient.tsx / ...
lib/
  db.ts                 MongoDB connection (cached across hot reloads)
  jwt.ts                JWT sign/verify helpers
  email.ts              Transactional emails (welcome, order confirmation)
  rate-limit.ts          In-memory API rate limiting
  models/                Mongoose schemas: User, Product, Order, Category,
                          Coupon, Banner, OTP
  utils/                 Misc helpers (e.g. admin auth check)
middleware.ts           Route protection for /admin, user dashboard routes,
                         and API rate limiting
scripts/seed.js         Database seed script
legacy-express/         Older Express + EJS version of the app (reference only)
```

## Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# Database
MONGO_URL=mongodb://127.0.0.1:27017/Flybees

# Auth
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_registration_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP (transactional email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Notes:**
- If `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are not set, the app falls back to mock test keys — online payments won't work until real keys are configured.
- If `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are not set, emails are logged to the console instead of being sent (safe for local development).

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# (optional) Seed the database with sample data
node scripts/seed.js

# Build for production
npm run build
npm run start
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

## Known Limitations / Pending Work

- **AI Assistant** — `components/AiAssistant.tsx` is a hardcoded keyword-matching responder for demo purposes, not wired to a real AI/LLM backend.
- **Payment & email credentials** — Razorpay and SMTP integrations are fully implemented in code but require real credentials in `.env.local` before they'll work in production.
- `div_counts.txt` in the repo root is a leftover debugging artifact from JSX formatting checks and can be safely removed.
