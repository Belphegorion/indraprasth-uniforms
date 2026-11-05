# Indraprasth Uniforms — Full-Stack E-Commerce & Admin System

> *"The Uniform Icons since 1975"* — Complete production-ready e-commerce platform and staff administration panel for Bhopal's premier school, college, hospital, and corporate uniform retailer.

---

## 1. Quick Start (Setup in 5 Steps)

### Prerequisites
- **Node.js**: v20 or v24+
- **MongoDB**: Local MongoDB instance (or Docker Compose container) or MongoDB Atlas URI

### Step 1: Clone and Install Dependencies
```bash
git clone <repository_url>
cd indrapresth
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```
*(Default values in `.env.example` work out-of-the-box for local development with MongoDB at `mongodb://localhost:27017/indraprasth`)*

### Step 3: Start Local Database (Optional if using Docker)
```bash
docker compose up -d
```

### Step 4: Seed Database
Populates the 8 scraped products with working Cloudinary URLs, Partner Schools (DPS, DPS Kolar, etc.), Categories, the 4 Bhopal retail branches, and the store owner admin:
```bash
npm run seed
```

### Step 5: Start Development Servers
Runs both the Express TypeScript API server and the Vite React client concurrently:
```bash
npm run dev
```
- **Storefront Web App**: [http://localhost:5173](http://localhost:5173)
- **Admin Management Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Backend API Base**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

**Default Admin Credentials:**
- Email: `admin@indraprasth.com`
- Password: `Admin@123456`

---

## 2. Project Architecture & Monorepo Structure

```
indraprasth-uniforms/
├── shared/                       # Shared Zod validation schemas & TypeScript interfaces
│   ├── src/
│   │   ├── schemas.ts            # Order, Product, School, Setting validation
│   │   ├── types.ts              # Domain model interfaces & API envelopes
│   │   └── index.ts
│   └── package.json
├── server/                       # Express + TypeScript REST API
│   ├── src/
│   │   ├── config/               # env.ts, db.ts, cloudinary.ts
│   │   ├── models/               # Admin, Product, School, Category, Order, Inquiry, Setting, Counter
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # auth.ts, validate.ts, rateLimit.ts, upload.ts, error.ts
│   │   ├── services/             # orderService.ts (atomic stock decrement), cloudinaryService.ts, statsService.ts
│   │   ├── routes/               # publicRoutes.ts, adminRoutes.ts
│   │   ├── scripts/              # seed.ts, createAdmin.ts
│   │   ├── data/products.json    # Scraped catalog data with typo fixes
│   │   └── tests/                # Supertest + mongodb-memory-server suite
│   └── package.json
├── client/                       # React 18 + Vite + TypeScript Storefront & Admin
│   ├── src/
│   │   ├── api/                  # Axios client & TanStack Query hooks
│   │   ├── store/                # Zustand cart (persisted) & auth stores
│   │   ├── components/           # UI components, layout, cart drawer, product cards, size guide
│   │   ├── pages/public/         # Home, Shop, ProductDetail, SchoolPage, Cart, Checkout, TrackOrder, About, Contact, BulkInquiry
│   │   ├── pages/admin/          # Login, Dashboard, Products, ProductForm, Schools, Categories, Orders, OrderDetail, Inquiries, Settings
│   │   └── test/                 # Vitest client unit tests
│   └── package.json
└── docker-compose.yml            # Local MongoDB 7.0 container
```

---

## 3. Scraped Seed Products

All 8 client scrape products are seeded with their existing Cloudinary images (folder `indraprasth/products/`):

| Product Name | Price (₹) | School Code | School Name | Category | Primary Cloudinary Image URL |
|---|---|---|---|---|---|
| **Dps Winter Tie** | ₹100 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791370845/indraprasth/products/ngfiqedvngrgzvuc12td.png` |
| **Dps Winter Socks** | ₹90 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791370637/indraprasth/products/zrq27ztm2hqbjgthuxpo.jpg` |
| **Dps Winter Divider** | ₹760 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791370417/indraprasth/products/bkj9xtu61hsf4jrm1oyi.jpg` |
| **Dps Winter Pant** | ₹600 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791369881/indraprasth/products/qd10kjcmtfu1v2vhlxzk.jpg` |
| **Dps Winter Full Shirt** | ₹690 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1792342081/indraprasth/products/kmvum0fv0ruijkwgbhug.png` |
| **Dps Kolar Upper** | ₹945 | DPS KOLAR | Delhi Public School Kolar Road | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791288458/indraprasth/products/q7nybi9zslivjwujnetr.png` |
| **Dps Kolar Blazer** *(typo fixed from Blazzer)* | ₹1,650 | DPS KOLAR | Delhi Public School Kolar Road | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791284736/indraprasth/products/lhr4qpes6dxelbgo77vo.jpg` |
| **Dps Bhopal Blazer** *(typo fixed from Blazzer)* | ₹1,650 | DPS | Delhi Public School Bhopal | Winter-ware | `https://res.cloudinary.com/dvaynkflu/image/upload/v1791284239/indraprasth/products/y3sgf8q8kydtlarcydnb.jpg` |

---

## 4. REST API Specification (`/api/v1`)

All responses adhere to the standard envelope format: `{ success: boolean, data?: T, error?: string, message?: string }`.

### Public Endpoints
| Method | Endpoint | Query / Body | Description |
|---|---|---|---|
| `GET` | `/products` | `q, school, category, gender, sort, page, limit` | Paginated product listing with filters |
| `GET` | `/products/:slug` | — | Product detail by slug with related products from same school |
| `GET` | `/products/featured` | — | Top 8 featured uniforms for homepage |
| `GET` | `/schools` | — | Active partner schools with active item count |
| `GET` | `/categories` | — | Active uniform categories |
| `GET` | `/settings/public` | — | Public contact info, branches, delivery thresholds |
| `POST` | `/orders` | `{ customer, items, paymentMethod, fulfilment, pickupBranch }` | Places guest order; verifies stock and recalculates price server-side; decrements stock atomically |
| `GET` | `/orders/track` | `orderNumber=&phone=` | Live order tracking with status history timeline |
| `POST` | `/inquiries` | `{ type, name, phone, email, organisation, message, quantityEstimate }` | Submits general contact or bulk quote request |

### Admin Endpoints (Protected by JWT `httpOnly` Cookie / Bearer)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/auth/login` | Staff / Owner login (Rate limited to 5 attempts / 15 min) |
| `POST` | `/admin/auth/logout` | Clears auth session cookie |
| `GET` | `/admin/auth/me` | Fetches current logged-in admin profile |
| `POST` | `/admin/auth/change-password` | Updates admin password (bcrypt 12 cost) |
| `GET` | `/admin/stats` | KPI summary (Today, 7D, 30D revenue & orders, low-stock, 30-day velocity chart data) |
| `GET, POST` | `/admin/products` | Paginated product inventory list / Create product |
| `GET, PUT, DELETE`| `/admin/products/:id` | Get / Update / Soft-delete product |
| `POST` | `/admin/products/import` | Upload CSV and upsert products by slug/SKU with row error report |
| `GET, POST` | `/admin/schools` | List schools / Create partner school |
| `PUT, DELETE` | `/admin/schools/:id` | Update / Deactivate school (Blocks deactivation if active products exist) |
| `GET, POST` | `/admin/categories` | List categories / Create category |
| `PUT, DELETE` | `/admin/categories/:id` | Update / Deactivate category (Blocks deactivation if active products exist) |
| `POST` | `/admin/uploads/image` | Upload image to Cloudinary folder `indraprasth/products` (JPEG/PNG/WebP, max 5MB) |
| `DELETE` | `/admin/uploads/:publicId` | Delete image from Cloudinary |
| `GET` | `/admin/orders` | List customer orders with search and status filters |
| `GET` | `/admin/orders/export.csv` | Stream all order history as CSV |
| `GET` | `/admin/orders/:id` | Order details with customer information and items |
| `PATCH` | `/admin/orders/:id/status` | Update status (Pending → Confirmed → Packed → Out for Delivery → Completed); restores stock if cancelled |
| `GET, PATCH` | `/admin/inquiries` | Review inquiries / Update status (`new`, `contacted`, `closed`) |
| `GET, PUT` | `/admin/settings` | Store configuration & Bhopal branches manager (Owner role required for updates) |

---

## 5. Security & Stock Integrity Design

1. **Atomic Stock Decrement & Compensation**:
   - Every order placement verifies that requested quantities exist in real-time.
   - Stock decrements use atomic MongoDB operations:
     `Product.findOneAndUpdate({ _id, "sizes.label": size, "sizes.stock": { $gte: qty } }, { $inc: { "sizes.$.stock": -qty } })`
   - If an order with multiple items encounters a sold-out item halfway through, previously decremented items are compensated/rolled back automatically.
   - When an order transitions to `cancelled`, inventory is automatically restored.
2. **Server-Side Price Authority**:
   - The frontend never dictates prices or delivery fees. All line prices, sub-totals, delivery charges, and grand totals are calculated server-side from database records.
3. **Session & Password Security**:
   - Admin passwords hashed with `bcryptjs` (salt cost 12).
   - JWT tokens stored in `httpOnly`, `sameSite`, `secure` (production) cookies with an 8-hour expiration.
   - Central error middleware strips database stack traces in production.
   - `express-mongo-sanitize` prevents NoSQL query injection payloads (`$gt`, `$where`).

---

## 6. Assumptions & Configurable Settings

In accordance with Section 0 of the specification:
1. **Logo File**: A crisp SVG monogram (`IU` royal blue emblem) has been provided at `client/public/logo.svg`. The client can update this from the Admin Settings page or replace the file.
2. **Payment Gateways**:
   - Standard supported methods: **Cash on Delivery (COD)** and **Pay at Store (Counter Trial)**.
   - Online payment method is wired up with an extensible gateway stub (ready for Razorpay/Cashfree key injection in `server/.env`).
3. **Bhopal Branches**:
   - Seeded with the 4 known locations: Jawahar Chowk (HQ), Kolar Road, Piplani/BHEL, and Karond.
   - Addresses, operating hours, phone numbers, and Google Map URLs can be edited anytime in `Admin > Settings`.
4. **Delivery Thresholds**:
   - Default delivery fee: ₹60 for Bhopal local deliveries.
   - Free delivery threshold: Orders above ₹1,500 enjoy free local delivery (configurable in Admin Settings).

---

## 7. How to Add a New School or Product

### Adding a Partner School:
1. Open Admin Portal: [http://localhost:5173/admin/schools](http://localhost:5173/admin/schools)
2. Click **"+ Add School"**.
3. Enter Name (e.g. *St. Joseph's Co-Ed School*), Code (e.g. *STJ*), Campus (e.g. *Arera Colony*), and Save.

### Adding a Uniform Product:
1. Open Admin Portal: [http://localhost:5173/admin/products/new](http://localhost:5173/admin/products/new)
2. Fill Product Name, Select School & Category, and Price.
3. Upload product photography (or paste existing Cloudinary URL).
4. Configure Sizes & Available Stock (use quick presets like `+ Numeric (26-38)` or `+ Alpha (XS-XXL)`).
5. Click **"Publish Product"**. It is immediately live on the public storefront.

---

## 8. Deployment Guide

### Frontend Deployment (Netlify)
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: `VITE_API_URL=https://your-backend.railway.app/api/v1`
- **SPA Fallback**: Handled automatically via `client/public/_redirects` (`/* /index.html 200`).

### Backend Deployment (Render / Railway)
- **Root Directory**: `server`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/indraprasth?retryWrites=true&w=majority
  JWT_SECRET=<strong-random-32-character-secret>
  CLIENT_URL=https://indraprasth-uniforms.netlify.app
  COOKIE_DOMAIN=.indraprasth-uniforms.netlify.app
  CLOUDINARY_CLOUD_NAME=dvaynkflu
  CLOUDINARY_API_KEY=<your_api_key>
  CLOUDINARY_API_SECRET=<your_api_secret>
  ADMIN_EMAIL=admin@indraprasth.com
  ADMIN_PASSWORD=<secure_password>
  ```

---

## 9. Available NPM Scripts

From workspace root:
- `npm run dev` — Concurrently runs server (tsx watch) and client (Vite)
- `npm run dev:server` — Runs backend server only
- `npm run dev:client` — Runs frontend client only
- `npm run build` — Typechecks and builds shared, server, and client packages
- `npm run test` — Executes both backend API integration tests and frontend unit tests
- `npm run test:server` — Executes backend Supertest test suite with in-memory MongoDB
- `npm run test:client` — Executes frontend Vitest suite (cart store and checkout validations)
- `npm run seed` — Idempotently syncs schools, categories, 8 products, settings, and owner admin
