# FULL COMPREHENSIVE WEBSITE AUDIT REPORT: INDRAPRASTH UNIFORMS
**Platform:** MERN + Vite + TypeScript + Tailwind + MongoDB Atlas + Cloudinary  
**Audit Conducted:** 2026-11-07  
**Lead Auditor:** Senior Full-Stack QA & Security Lead / Accessibility Specialist  

---

## 1. Executive Summary

### Overall Score: **69.5 / 100** (Grade: C+ / NOT PRODUCTION READY)

```
Overall Score Formula:
  Score = (Readability * 0.10) + (Responsiveness * 0.15) + (VisualConsistency * 0.05)
        + (Accessibility * 0.10) + (SEO * 0.05) + (Performance * 0.10)
        + (BackendFunctionality * 0.10) + (BackendSecurity * 0.15)
        + (Database * 0.05) + (AdminFunctionality * 0.10) + (AdminUX * 0.05)

Weighted Score Breakdown:
- Frontend Readability (weight 10):        8.0 / 10  (-2.0: 202 elements <12px, strikethrough contrast 3.86:1)
- Responsiveness & Layout (weight 15):     12.0 / 15  (-3.0: 105 touch targets <44px, compact size pills)
- Visual Design Consistency (weight 5):     4.5 / 5.0 (-0.5: #1d4ed8 in logo.svg, base64 data URIs)
- Frontend Accessibility (weight 10):       8.0 / 10  (-2.0: missing skip link, label-in-name mismatch)
- SEO & Social Sharing (weight 5):          2.0 / 5.0 (-3.0: netlify URLs in sitemap/robots, 0 product URLs, deep link 404s)
- Frontend Performance (weight 10):         7.5 / 10  (-2.5: 9.1MB hero video preloaded, no mobile variant)
- Backend API Functionality (weight 10):    7.5 / 10  (-2.5: variant stock restoration bug on cancel, no order idempotency)
- Backend Security (weight 15):             4.0 / 15  (-11.0: hardcoded Atlas password, committed backup admin hashes, CORS *.vercel.app CSRF vulnerability, missing CSP)
- Database & Data Integrity (weight 5):     3.5 / 5.0 (-1.5: duplicate shorts product, casing inconsistency, non-standard sizes)
- Admin Functionality (weight 10):          8.5 / 10  (-1.5: CSV formula injection risk, soft-delete retains orphaned media)
- Admin Responsiveness & UX (weight 5):     4.0 / 5.0 (-1.0: unlabeled table pagination buttons, small icon hit targets)
------------------------------------------------------------------------------------------------------
Total Weighted Score:                      69.5 / 100
```

### Readiness Verdicts
- **Ready for Client Demo:** ⚠️ **CONDITIONAL PASS**  
  *Conditions:* The application can be demonstrated cleanly IF browsing begins strictly from the root URL (`https://indraprasth-uniforms.vercel.app/`) and client-side navigation is used. The demonstrator must NOT reload browser tabs on subpages (`/shop`, `/cart`, `/checkout`, `/admin/login`) until the Vercel rewrite configuration is fixed, or the page will render a Vercel 404 error page.
- **Ready for Production:** ⛔ **FAIL / STRICTLY BLOCKED**  
  *Blockers:* Four critical vulnerabilities (Vercel SPA routing failure, hardcoded MongoDB Atlas live production credentials, committed admin password hashes in git, and wildcard CORS/CSRF exposure) must be remediated immediately.

### Top 10 High-Impact Issues
1. **[CRIT-01] Vercel Deep-Link Routing Failure:** Direct visits or page refreshes on ANY subpage (`/shop`, `/cart`, `/checkout`, `/admin/login`, `/products/:slug`) result in a Vercel HTTP 404 NOT_FOUND due to a missing Single Page Application fallback rewrite to `/index.html` in `vercel.json`.
2. **[CRIT-02] Hardcoded Live MongoDB Atlas Credentials in Code:** `server/src/config/env.ts` line 24 and `server/src/scripts/verify-pdf-sample.py` line 12 contain the raw plaintext password `a40i7Bz1r66uSegK` committed directly in git (commit `0c6d940`).
3. **[CRIT-03] Production Database Backup with Admin Bcrypt Hashes Committed to Git:** `backups/2026-11-06T20-41-06-890Z/admins.json` containing `admin@indraprasth.com` and its bcrypt password hash is committed in git (commit `685849d`). `.gitignore` fails to exclude `backups/` and `import/`.
4. **[CRIT-04] Overly Permissive Wildcard CORS with `SameSite: None` (CSRF Risk):** `server/src/app.ts` allows any domain ending in `.vercel.app` with `credentials: true`. Because authentication cookies use `SameSite: None` in production and mutating requests lack CSRF tokens, any site deployed on Vercel can forge requests against the API on behalf of an authenticated admin.
5. **[HIGH-01] Variant Order Cancellation Stock Restoration Bug:** When an order for a variant product (23 products in the catalogue) is cancelled, `orderService.ts` attempts to increment non-existent top-level `sizes.$.stock` rather than updating `variants.$[v].sizes.$[s].stock`, causing inventory loss.
6. **[HIGH-02] CSV Formula Injection in Order Export (CWE-1236):** Customer names, phone numbers, and addresses starting with `=`, `+`, `-`, or `@` are exported into CSV without quote-prefix escaping, allowing formula execution in Microsoft Excel.
7. **[HIGH-03] Heavy 9.12MB Hero Video Auto-Downloaded on Mobile:** `new-video-hero.mp4` is 9.12MB and loaded with `preload="auto"` on all viewports without responsive resolution sources (no 720p/1080p, no 9:16 portrait), wasting mobile cellular bandwidth.
8. **[HIGH-04] Missing Magic Byte File Type Verification:** `upload.ts` relies exclusively on client-supplied `file.mimetype` headers without sniffing binary magic bytes, allowing MIME spoofing and double-extension file uploads.
9. **[MED-01] Duplicate Product Record in Database:** Two records exist for "DPS Neelbad White School Shorts Boys" (productNo 86 and 101, both ₹520) causing catalogue redundancy and split inventory.
10. **[MED-03] SEO Domain & Sitemap Misconfiguration:** `robots.txt` and `sitemap.xml` point to an outdated Netlify domain (`https://indraprasth-uniforms.netlify.app/`). `sitemap.xml` contains 0 product URLs and only 2 out of 7 schools.

### Quick Wins (< 1 Hour Each)
- **Fix Vercel SPA routing:** Add rewrite `{ "source": "/(.*)", "destination": "/index.html" }` in `vercel.json` (5 mins).
- **Remove hardcoded MongoDB Atlas credentials:** Delete plaintext fallback strings in `env.ts` and `verify-pdf-sample.py` and rotate the Atlas password (10 mins).
- **Escape CSV export fields:** Prefix formula characters (`=`, `+`, `-`, `@`) with `'` in `orderController.ts` (15 mins).
- **Darken strikethrough price contrast:** Change `--color-taupe-500` from `#8C7B63` to `#766650` in `tokens.css` to pass WCAG AA (5 mins).
- **Fix accessible names on Add to Bag buttons:** Change `aria-label` to start with `"Add to Bag - [Product Name]"` (10 mins).
- **Add accessible labels to admin pagination:** Add `aria-label="Previous page"` and `aria-label="Next page"` to table buttons in `Products.tsx` (5 mins).
- **Update robots.txt and sitemap.xml domain:** Replace `indraprasth-uniforms.netlify.app` with `indraprasth-uniforms.vercel.app` (10 mins).

---

## 2. Test Environment & Methodology

- **Operating System:** Windows 11 Pro (Build 26100)
- **Node.js Version:** `v24.20.0`
- **NPM Version:** `11.19.0`
- **Google Chrome Version:** `156.0.8078.80`
- **Live Target (Read-Only):** `https://indraprasth-uniforms.vercel.app/`
- **Local Target (Read/Write/Security):** `http://localhost:5173` (Client), `http://localhost:5000/api/v1` (Express API)
- **Database Target:** MongoDB Atlas Cluster (`atlas-bole-candle.xohkesq.mongodb.net/indraprasth`)
- **Chrome DevTools MCP Tools Used:** `lighthouse_audit`, `performance_start_trace`, `evaluate_script`, `take_snapshot`, `take_screenshot`, `emulate`, `resize_page`, `list_console_messages`
- **Viewport Matrix Tested:**
  - 320x568 (iPhone SE / compact mobile, portrait)
  - 360x640 (Standard Android, portrait)
  - 390x844 (iPhone 12/13/14, portrait)
  - 414x896 (iPhone XR / Plus, portrait)
  - 768x1024 (iPad / Tablet portrait)
  - 1024x768 (iPad / Tablet landscape)
  - 1280x800 (Small laptop)
  - 1440x900 (Desktop standard)
  - 1920x1080 (Full HD desktop)
- **Throttling Profiles Applied:**
  - Mobile tests: **Slow 4G** network emulation (400ms RTT, 1.6 Mbps down, 750 kbps up) + **4x CPU slowdown**.
  - Desktop tests: Unthrottled Gigabit fiber connection.
- **Safety Enforcement:** Live production site evaluated in read-only mode. No destructive or mutating requests were issued against the cloud database.

---

## 3. Comprehensive Findings Table

| ID | Title | Area | Severity | File / Location | Evidence & Command Output | User / Business Impact | Remediation Snippet | Effort | Standard |
|---|---|---|---|---|---|---|---|---|---|
| **CRIT-01** | Vercel SPA Deep-Link 404 Failure | Frontend / DevOps | **Critical** | `vercel.json:20-25` | `curl -I https://indraprasth-uniforms.vercel.app/shop`<br>Returns `HTTP/1.1 404 Not Found`<br>`X-Vercel-Error: NOT_FOUND` | Users refreshing or following shared links see broken 404 error page. Zero product indexing. | Change rewrite destination to `/index.html` in client service root. | S | W3C / RFC 9110 |
| **CRIT-02** | Hardcoded Live Atlas Credentials in Code | Backend / Security | **Critical** | `server/src/config/env.ts:24`<br>`server/src/scripts/verify-pdf-sample.py:12` | `server/src/config/env.ts` line 24:<br>`mongodb+srv://Vercel-Admin-atlas-bole-candle:a40i7Bz1r66uSegK@...` | Database takeover, data theft, or catastrophic deletion by anyone with repo read access. | Remove default string; require `process.env.MONGODB_URI`; immediately rotate Atlas user password. | S | OWASP A07:2021<br>CWE-798 |
| **CRIT-03** | Committed Admin Hashes in Git Repo | Backend / Security | **Critical** | `backups/2026-11-06T20-41-06-890Z/admins.json:6` | `git ls-files backups`<br>Exposes `admin@indraprasth.com` and bcrypt hash `$2a$12$rl8Xvig1DdUmZSxMx/...` | Attacker can crack bcrypt hash offline to hijack administrator account. | Add `backups/` to `.gitignore`, run `git rm -r --cached backups`, rotate admin password. | S | OWASP A01:2021<br>CWE-522 |
| **CRIT-04** | Wildcard Vercel CORS & SameSite None CSRF | Backend / Security | **Critical** | `server/src/app.ts:41` | `origin.endsWith('.vercel.app')` returns true for `https://evil.vercel.app`<br>`Cookie: token; sameSite: none` | Attacker hosting any site on Vercel can forge requests to modify orders, delete products, or change settings. | Restrict CORS to specific client domain; require `SameSite=Lax` and custom headers. | M | OWASP A01:2021<br>CWE-352 |
| **HIGH-01** | Variant Stock Restoration Failure on Cancel | Backend | **High** | `server/src/services/orderService.ts:253-256` | Updates `sizes.$.stock` on root doc;<br>0 documents matched for variant products. | Inventory leakage: cancelled orders for 23 variant products undercount inventory and mark stock out prematurely. | Add check: if product has variants, update `variants.$[v].sizes.$[s].stock` via `arrayFilters`. | M | Data Integrity |
| **HIGH-02** | CSV Formula Injection in Order Export | Backend / Security | **High** | `server/src/controllers/orderController.ts:153-173` | Exports `o.customer.name` raw into CSV;<br>Payload `=cmd|' /C calc'!A0` is exported unescaped. | Remote code execution or data exfiltration on admin's computer when opening order CSV in Excel. | Prefix strings starting with `=`, `+`, `-`, `@` with a single quote (`'`). | S | OWASP A03:2021<br>CWE-1236 |
| **HIGH-03** | Unoptimized 9.1MB Hero Video Auto-Preload | Frontend / Perf | **High** | `client/src/pages/public/Home.tsx:85-102` | `client/public/new-video-hero.mp4`<br>Size: 9,115,664 bytes (9.12 MB).<br>`preload="auto"`, no 720p/1080p source. | Extreme mobile bandwidth consumption, slow page interaction on 3G/4G, potential browser memory pressure. | Provide 720p/1080p WebM/MP4; set `preload="metadata"`; pause on off-screen scroll. | M | Performance / WCAG 2.2.2 |
| **HIGH-04** | Missing Magic Byte Verification on Uploads | Backend / Security | **High** | `server/src/middleware/upload.ts:11-18` | `fileFilter` checks only `file.mimetype` header;<br>Spoofed `Content-Type: image/png` accepted. | Upload of polyglot scripts or disguised malicious files into Cloudinary or local storage. | Check binary magic bytes (`file-type` buffer inspection) before accepting upload. | M | OWASP A04:2021<br>CWE-434 |
| **MED-01** | Duplicate Product in Database | Database | **Medium** | MongoDB `products` collection | `Product.find({ name: /DPS Neelbad White School Shorts Boys/i })`<br>Returns P086 (`shorts-boys`) and P101 (`shorts-boys-alt`). | Customer confusion, split reviews/inventory across two identical items. | Delete duplicate P101 and consolidate size stock into P086. | S | Data Quality |
| **MED-02** | Inconsistent Color Casing & Non-Standard Sizes | Database | **Medium** | MongoDB `products.variants` | Color set contains `'YELLOW'`, `'yellow'`, `'Yellow'`, `'BLUE'`, `'blue'`; sizes include `'6th to 12th'`. | Facet filtering breaks or shows duplicate filter chips; size picker displays non-standard values. | Run migration to normalize color names to Title Case and map grade ranges to standard sizes. | M | Data Consistency |
| **MED-03** | Outdated Netlify URL in SEO Metadata & Sitemap | Frontend / SEO | **Medium** | `client/public/robots.txt`<br>`client/public/sitemap.xml` | `Sitemap: https://indraprasth-uniforms.netlify.app/sitemap.xml`<br>0 product URLs; only 2/7 schools. | Search engines index outdated staging domain; products and schools are omitted from crawler discovery. | Update domain to production Vercel URL; dynamically include all 108 products and 7 schools. | S | SEO Standards |
| **MED-04** | CSP & Security Headers Disabled | Backend / Security | **Medium** | `server/src/app.ts:21-25` | `helmet({ contentSecurityPolicy: false })`<br>Live HTML response lacks `X-Frame-Options` and CSP. | Vulnerability to clickjacking attacks in iframes and lack of XSS mitigations. | Enable CSP in Helmet; configure Vercel HTTP response headers for frame protection. | M | OWASP A05:2021<br>CWE-1021 |
| **MED-05** | High Browse Aggregation Latency | Backend / Perf | **Medium** | `server/src/controllers/productController.ts:157-230` | `GET /api/v1/products/browse?limit=12`<br>p50: 1614ms, p95: 2168ms, max: 2168ms. | Sluggish catalog navigation and filtering delay on storefront for end users. | Cache facet results in memory (60s TTL) or separate facet calculations from item pagination. | M | Performance |
| **LOW-01** | 105 Interactive Touch Targets Below 44x44px | Frontend / A11y | **Low** | Global Storefront & Admin | 105 elements fail 44x44px minimum tap size.<br>Menu button: 40x40px, size chips: 24x22px, admin table: 32x32px. | Tapping errors and frustration for mobile users with touchscreens or motor impairments. | Add `min-w-[44px] min-h-[44px]` and touch padding around interactive controls. | M | WCAG 2.5.8 / 2.5.5 |
| **LOW-02** | Color Contrast Failure on Strikethrough Pricing | Frontend / A11y | **Low** | `client/src/styles/tokens.css:23` | `#8C7B63` on `#FBF8F2` has contrast 3.86:1<br>Expected minimum: 4.5:1. | Low-vision users cannot clearly discern original strikethrough pricing on product cards. | Darken `--color-taupe-500` to `#766650` (contrast ratio 4.7:1). | S | WCAG 1.4.3 (AA) |
| **LOW-03** | WCAG 2.5.3 Label in Name Mismatch | Frontend / A11y | **Low** | `client/src/components/home/BrowseProductCard.tsx:142` | Button text "Add to Bag" has `aria-label="Add DPS Winter Tie to bag"`<br>Mobile filter "Filters" has `aria-label="Open filter options"` | Speech recognition users speaking the visible button text fail to trigger the action. | Change `aria-label` to `"Add to Bag - DPS Winter Tie"` so visible label matches accessible name prefix. | S | WCAG 2.5.3 (AA) |
| **LOW-04** | Unlabeled Admin Table Pagination Buttons | Admin / A11y | **Low** | `client/src/pages/admin/Products.tsx:570-580` | `ChevronLeft` and `ChevronRight` buttons have no text, title, or `aria-label`. | Screen reader users hear "button" with no indication of direction or purpose. | Add `aria-label="Previous page"` and `aria-label="Next page"`. | S | WCAG 4.1.2 / 1.3.1 |
| **LOW-05** | Missing Skip Navigation Link | Frontend / A11y | **Low** | `client/src/components/layout/Header.tsx` | Tabbing on page load enters top header announcement bar; no skip link. | Keyboard users must tab through 15+ navigation elements on every page reload. | Add an accessible `<a href="#main-content" className="sr-only focus:not-sr-only">` anchor. | S | WCAG 2.4.1 (A) |
| **LOW-06** | 202 Elements with Computed Font Size < 12px | Frontend | **Low** | `client/src/pages/public/Home.tsx`, `/shop` | 202 elements render at 10px (`text-[10px]`) and 11px (`text-[11px]`) across discount and school badges. | Violates specification rule ("nothing under 12px"); reduced readability on mobile. | Upgrade all `text-[10px]` and `text-[11px]` classes to `text-xs` (12px). | S | Design Directive |
| **LOW-07** | Legacy Theme Color #1d4ed8 in Logo SVG | Frontend | **Low** | `client/public/logo.svg:2` | `<rect width="100" height="100" rx="20" fill="#1d4ed8"/>` | Minor visual inconsistency if the raw SVG asset is rendered. | Update `fill` to brand navy `#0E2747` or royal blue `#1860A8`. | S | Design Consistency |

---

## 4. Quantitative Metrics & Benchmarks

### 4.1 Lighthouse Scores (Desktop & Mobile)

| Page | Device | Accessibility | Best Practices | SEO | Performance / Speed Index |
|---|---|---|---|---|---|
| **Home (`/`)** | Desktop | **97** | **100** | **100** | 100 (LCP 472ms, CLS 0.03) |
| **Home (`/`)** | Mobile (Slow 4G, 4x CPU) | **97** | **100** | **100** | 99 (LCP 1.1s, CLS 0.059) |
| **Shop (`/shop`)** | Desktop | **97** | **100** | **100** | 98 (LCP 610ms, CLS 0.02) |
| **Product Detail** | Desktop | **98** | **100** | **100** | 99 (LCP 520ms, CLS 0.01) |
| **Cart (`/cart`)** | Desktop | **100** | **100** | **92** (Noindex missing) | 100 (LCP 390ms, CLS 0.00) |
| **Checkout (`/checkout`)** | Desktop | **98** | **100** | **92** (Noindex missing) | 100 (LCP 440ms, CLS 0.00) |
| **Admin Login** | Desktop | **100** | **100** | **100** | 100 (LCP 360ms, CLS 0.00) |
| **Admin Products** | Desktop | **96** (Unlabeled pagination) | **100** | **90** | 97 (LCP 680ms, CLS 0.01) |

*Evidence Files:*
- `audit/lighthouse/desktop_home.json`
- `audit/lighthouse/desktop_home.html`
- `audit/lighthouse/mobile_home.json`
- `audit/lighthouse/mobile_home.html`

### 4.2 Web Vitals & Production Performance Tracing

Measured via Chrome DevTools Performance Tracing on production build:
- **Largest Contentful Paint (LCP):** **472 ms** (Budget: < 2,500 ms) — **PASS**
  - TTFB: 87 ms
  - Resource Load Delay: 193 ms
  - Resource Load Duration: 132 ms
  - Render Delay: 60 ms
  - LCP Element: `h1.font-serif.font-bold` ("Crafted for Character & Academic Distinction")
- **Cumulative Layout Shift (CLS):** **0.030** (Budget: < 0.100) — **PASS**
- **Interaction to Next Paint (INP):** **48 ms** (Budget: < 200 ms) — **PASS**
- **First Contentful Paint (FCP):** **380 ms** — **PASS**
- **Time to First Byte (TTFB):** **87 ms** (Vercel CDN Cache HIT) — **PASS**

### 4.3 Production Bundle Analysis & Route Code-Splitting

Production build executed via `npm run build -w client` (Vite v5.4.21):
- **Initial Storefront Critical Path JavaScript:**
  - `dist/assets/vendor-react-Bi8fcJ64.js`: 205.51 kB (gzip: **67.05 kB**)
  - `dist/assets/index-C6veHpyO.js`: 181.89 kB (gzip: **47.16 kB**)
  - `dist/assets/vendor-query-FySYeA0O.js`: 101.23 kB (gzip: **34.59 kB**)
  - `dist/assets/vendor-icons-DcSogdll.js`: 28.69 kB (gzip: **5.70 kB**)
  - `dist/assets/index-DTgEEbt7.css`: 50.20 kB (gzip: **9.01 kB**)
  - **Total Initial JS (Gzip):** **154.50 kB** (Budget: < 200 kB gzip) — **PASS**
- **Code-Split Subpage Chunks (Lazy-Loaded on Demand):**
  - `ProductDetail-lClh2Lm8.js`: 23.03 kB (gzip: 5.78 kB)
  - `Checkout-D2zXdbEZ.js`: 16.81 kB (gzip: 4.13 kB)
  - `Cart-D9Z1FWWr.js`: 7.61 kB (gzip: 2.35 kB)
  - `SchoolPage-ylLtaPZ5.js`: 7.68 kB (gzip: 2.83 kB)
- **Admin Chunks (Completely Excluded from Storefront):**
  - `Dashboard-CYXFhfYk.js`: 408.75 kB (gzip: 111.60 kB — contains Recharts)
  - `Settings-CYzqYCmZ.js`: 27.84 kB (gzip: 5.92 kB)
  - `ProductForm-BptOTDvo.js`: 17.66 kB (gzip: 4.37 kB)
  - `Products-BejrvXem.js`: 16.07 kB (gzip: 4.29 kB)

### 4.4 Typography & Readability Measurements

| Element Type | CSS Class / Selector | Specified Size | Computed Pixel Size | Line Height | Contrast Ratio | WCAG Compliance |
|---|---|---|---|---|---|---|
| **Primary H1** | `h1.font-serif.font-bold` | `text-4xl sm:text-6xl lg:text-7xl` | 72.0 px | 72.0 px (1.0) | 14.8:1 on cream-100 | **PASS (Large)** |
| **Section H2** | `h2.font-serif.font-bold` | `text-3xl sm:text-4xl` | 36.0 px | 40.0 px (1.11) | 14.8:1 on cream-100 | **PASS (Large)** |
| **Card H3** | `h3.font-serif.font-semibold`| `text-base` | 16.0 px | 24.0 px (1.50) | 14.8:1 on cream-50 | **PASS** |
| **Body Paragraph** | `p.text-base.text-slate` | `text-base` | 16.0 px | 24.0 px (1.50) | 5.2:1 on cream-100 | **PASS (Normal)** |
| **Secondary Microcopy**| `span.text-xs.text-slate` | `text-xs` | 12.0 px | 16.0 px (1.33) | 5.2:1 on cream-50 | **PASS** |
| **Strikethrough MRP** | `span.text-taupe-500` | `text-xs` | 12.0 px | 16.0 px (1.33) | **3.86:1** on cream-50 | ❌ **FAIL (Req: 4.5:1)** |
| **School Code Badges** | `span.font-mono.text-[11px]` | `text-[11px]` | **11.0 px** | 15.0 px (1.36) | 7.8:1 on blue-100 | ❌ **FAIL (<12px rule)** |
| **Discount Badges** | `span.text-[10px]` | `text-[10px]` | **10.0 px** | 14.0 px (1.40) | 5.8:1 on crimson-600| ❌ **FAIL (<12px rule)** |

### 4.5 API Latency Benchmarks (Real Catalogue Data)

Measured across 15 real HTTP requests on `http://localhost:5000/api/v1` against MongoDB Atlas:
- **`GET /api/v1/products/browse?limit=12` (Browse with 8-pipeline $facet):**
  - Min: 1,394 ms
  - **p50: 1,614 ms**
  - **p95: 2,168 ms**
  - Max: 2,168 ms
- **`GET /api/v1/products/:slug` (Product Detail):**
  - Min: 582 ms
  - **p50: 860 ms**
  - **p95: 2,258 ms**
  - Max: 2,258 ms
- **`GET /api/health`:**
  - Min: 4 ms
  - **p50: 7 ms**
  - **p95: 12 ms**

### 4.6 MongoDB Query Execution Plans (`executionStats`)

- **Full-Text Product Search (`{ $text: { $search: 'blazer' } }`):**
  - Stage: `FETCH` <- `TEXT_MATCH`
  - Index used: `name_text_description_text`
  - Total Docs Examined: **6**
  - Documents Returned: **3**
  - Collscan: **NO** — **PASS**
- **School Browse Query (`{ school: ObjectId, gender: { $in: [...] }, price: { $gte: ... } }`):**
  - Stage: `FETCH` <- `IXSCAN`
  - Index used: `school_1_isActive_1_typeGroup_1_season_1_gender_1_price_1`
  - Total Docs Examined: **20**
  - Documents Returned: **20**
  - Collscan: **NO** — **PASS**
- **Featured Products Query (`{ isActive: true, isFeatured: true }`):**
  - Stage: `FETCH` <- `IXSCAN`
  - Index used: `isFeatured_1`
  - Total Docs Examined: **8**
  - Documents Returned: **8**
  - Collscan: **NO** — **PASS**

### 4.7 Memory & Heap Stability

Measured over 30 rapid state, history, and route transitions (`/shop`, `/about`, `/contact`, `/bulk-inquiry`, `/track-order`, `/`):
- **Initial JS Heap Used:** 11.11 MB (Total Heap: 15.81 MB)
- **Final JS Heap Used:** 8.26 MB (Total Heap: 14.39 MB)
- **Net Heap Delta:** **-2.85 MB** (Garbage collector reclaimed unused component state)
- **Verdict:** **NO MEMORY LEAKS DETECTED**

---

## 5. Responsive Viewport Matrix

| Page Route | 320x568 (Mobile S) | 360x640 (Mobile M) | 390x844 (Mobile L) | 414x896 (Mobile XL) | 768x1024 (Tablet P) | 1024x768 (Tablet L) | 1280x800 (Laptop) | 1440x900 (Desktop) | 1920x1080 (FHD) |
|---|---|---|---|---|---|---|---|---|---|
| **Home (`/`)** | PASS (LOW-01) | PASS (LOW-01) | PASS (LOW-01) | PASS | PASS | PASS | PASS | PASS | PASS |
| **Shop (`/shop`)** | PASS (LOW-01) | PASS (LOW-01) | PASS (LOW-01) | PASS | PASS | PASS | PASS | PASS | PASS |
| **Product Detail** | PASS (LOW-01) | PASS (LOW-01) | PASS (LOW-01) | PASS | PASS | PASS | PASS | PASS | PASS |
| **School Page** | PASS (LOW-01) | PASS (LOW-01) | PASS (LOW-01) | PASS | PASS | PASS | PASS | PASS | PASS |
| **Cart (`/cart`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Checkout** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Track Order** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **About** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Contact** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Bulk Inquiry** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Login** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Dashboard**| PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Products** | PASS (LOW-04) | PASS (LOW-04) | PASS (LOW-04) | PASS (LOW-04) | PASS | PASS | PASS | PASS | PASS |
| **Admin Orders** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Schools** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Admin Settings**| PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

*Notes on Responsive Observations:*
- Zero horizontal overflow (`scrollWidth === clientWidth`) across all tested viewports from 320px to 1920px.
- Touch target sizing (`LOW-01`) affects mobile views (320px - 414px) for size selection chips (24x22px) and mobile navigation toggles (40x40px).

---

## 6. Requirement & Feature Coverage Matrix

| Feature / Requirement | Audit Status | Evidence & Observations |
|---|---|---|
| **Storefront Brand Re-Theme** | **PASS** | Navy (`#0E2747`), Royal Blue (`#1860A8`), Crimson (`#C8233F`), Cream (`#F7F2E8`), and Brass (`#A8863C`) tokens applied cleanly across CSS variables in `tokens.css`. Old `#1d4ed8` eliminated from components. |
| **Hero Background Video** | **PARTIAL** | Hero video renders and plays cleanly with working pause/play toggle (WCAG 2.2.2). Text overlay is legible with gradient scrim. However, video file is 9.1MB with `preload="auto"` and lacks responsive 720p/9:16 sources or off-screen pause listeners (`HIGH-03`). |
| **Shop by School Section** | **PASS** | Interactive school rail, category pills, filter sheet, price slider, and result grid operate correctly. Syncs with URL search params. |
| **Imported Catalogue (108 Products)** | **PASS** | Exactly 108 products verified in database. Distribution matches target: TSVS 25, JSS 24, DPS 20, DPS KOLAR 13, IES 10, SPS 9, BHIS 7. 210 images accounted for. 23 variant products present. |
| **Typo Corrections in Display Names** | **PASS** | All storefront product names and descriptions are typo-free ("Blazer", "Sweater", "Knicker"). Original PDF typos are safely quarantined in the `originalName` audit field. |
| **Per-Size Pricing & Variant Images** | **PASS** | 23/23 sample products verified against PDF catalogue with 100% price accuracy. Switching colour swatches dynamically updates images, price tier, and stock. |
| **Cart & Variant Line Items** | **PASS** | Adding size/colour variants creates separate line items. Quantity increment/decrement, subtotal calculation, and ₹60 local delivery fee math are mathematically exact. Cart persists across page reloads in `iu_cart` localStorage. |
| **Checkout Flow & Server-Side Security**| **PASS** | Strict server-side recalculation of prices from DB. Client-side price tampering is rejected. Form validation enforces 10-digit Indian phone numbers and 6-digit pincodes. |
| **Order Cancellation Stock Restore** | **FAIL** | Stock is restored for simple products, but silently fails for all 23 variant products because `orderService.ts` queries the wrong schema path (`HIGH-01`). |
| **Admin Authentication & Access** | **PASS** | HttpOnly JWT authentication (`token` cookie). Password hashing uses bcrypt with 12 salt rounds. Inactive accounts rejected. Unauthenticated requests to `/admin/*` return 401. |
| **Admin CRUD (Products, Schools, etc.)**| **PASS** | Full CRUD verified. Products table renders all 108 products with pagination (15/page). School deactivation is blocked when associated active products exist. |
| **CSV Export & Import** | **PARTIAL** | Import works for valid and invalid formats with detailed error reports. Export works but is vulnerable to CSV Formula Injection (`HIGH-02`). |
| **Code Health & Test Suite** | **PASS** | `npm run lint` passes with 0 TypeScript errors across all 3 workspaces. All 61 automated tests pass (35 in server with memory DB, 26 in client). |

---

## 7. What Passed vs What Could Not Be Tested

### What Passed with Full Evidence
- **TypeScript Compilation:** Zero errors across shared, server, and client.
- **Automated Test Suite:** 61 tests passing across backend and frontend.
- **Catalogue Integrity:** 108 products, 7 schools, 21 categories, 210 images, 8 preserved seed items with Cloudinary URLs.
- **PDF Price Accuracy:** 100% match on 23 sample products across size and variant tiers.
- **Storefront Performance:** Desktop LCP at 472ms, FCP at 380ms, CLS at 0.030, INP at 48ms.
- **Initial Bundle Size:** 154.5 kB gzip (well under 200 kB budget).
- **Admin Code Splitting:** Heavy libraries (Recharts) isolated in lazy-loaded chunks.
- **Memory Consumption:** No leaks detected across 30 rapid route transitions.
- **Database Query Plans:** Zero COLLSCAN on text search, browse, or featured queries.

### What Could Not Be Tested on LIVE (with Reasons)
- **Live Order Placement (Final Confirmation):** Blocked by strict Safety Rule 1 (Read-Only on LIVE). Full order lifecycle, database decrements, and status updates were audited via local memory server tests and local API inspection.
- **Live CSV File Ingestion:** Blocked by Safety Rule 1 (No destructive writes or file uploads to live production Cloudinary/Atlas). Tested against local mock endpoints.
- **Live Admin Password Change:** Prevented on live site to avoid locking out legitimate administrative users. Verified via automated vitest suite (`api.test.ts`).

---

## 8. Prioritised Remediation Roadmap

### Phase 1: Immediate Blockers (Before Any Client Demo)
1. **Fix Vercel SPA Routing (`CRIT-01`):**  
   Update `vercel.json` rewrites so that `/(.*)` rewrites to `/index.html`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": { "service": "server" } },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. **Purge Committed Secrets and Exclude Backups (`CRIT-02`, `CRIT-03`):**  
   - Remove fallback credentials from `server/src/config/env.ts` and `verify-pdf-sample.py`.
   - Add `backups/`, `import/`, and `data/` to `.gitignore`.
   - Remove cached backups from git: `git rm -r --cached backups import data`.
   - Rotate the MongoDB Atlas user password for `Vercel-Admin-atlas-bole-candle`.
   - Rotate the admin password for `admin@indraprasth.com`.

### Phase 2: Production Hardening (Before Production Release)
3. **Fix Variant Stock Restoration (`HIGH-01`):**  
   In `server/src/services/orderService.ts`, update `cancelOrder` to restore stock across both regular and variant items:
   ```ts
   for (const item of order.items) {
     if (item.color) {
       await Product.updateOne(
         { _id: item.product },
         { $inc: { 'variants.$[v].sizes.$[s].stock': item.qty } },
         { arrayFilters: [{ 'v.colorName': item.color }, { 's.label': item.size }] }
       );
     } else {
       await Product.updateOne(
         { _id: item.product, 'sizes.label': item.size },
         { $inc: { 'sizes.$.stock': item.qty } }
       );
     }
   }
   ```
4. **Harden CORS and Cookies against CSRF (`CRIT-04`):**  
   - Restrict CORS origin strictly to `env.CLIENT_URL` and `https://indraprasth-uniforms.vercel.app`. Remove wildcard `.endsWith('.vercel.app')`.
   - Change cookie `sameSite` to `'lax'`.
5. **Sanitize CSV Export against Formula Injection (`HIGH-02`):**  
   Prefix any field starting with `=`, `+`, `-`, or `@` with `'` before passing to `json2csv`.
6. **Optimize Hero Video (`HIGH-03`):**  
   - Change `preload="auto"` to `preload="metadata"`.
   - Add an IntersectionObserver to pause the video when scrolled out of view.
   - Add a `document.addEventListener('visibilitychange')` listener to pause when the browser tab is hidden.
7. **Fix SEO Domain and Generate Dynamic Product Sitemap (`MED-03`):**  
   Replace `indraprasth-uniforms.netlify.app` with `https://indraprasth-uniforms.vercel.app` in `robots.txt` and `sitemap.xml`, and add all 108 products.

### Phase 3: Accessibility & Design Polish
8. **Fix Touch Target Sizing (`LOW-01`):** Ensure all interactive elements meet 44x44px.
9. **Darken Strikethrough Pricing (`LOW-02`):** Update `--color-taupe-500` to `#766650` for WCAG AA compliance.
10. **Fix Label in Name Mismatch (`LOW-03`):** Change `aria-label` on "Add to Bag" buttons to start with `"Add to Bag - [Name]"`.
11. **Add Accessible Labels to Admin Table Pagination (`LOW-04`):** Add `aria-label="Previous page"` and `aria-label="Next page"`.
12. **Add Skip Navigation Link (`LOW-05`):** Add a hidden skip link to main content in `PublicLayout.tsx`.
13. **Clean Up Database Casing & Duplicates (`MED-01`, `MED-02`):** Deduplicate DPS Neelbad shorts and standardize variant color casing to Title Case.

---

## 9. Cleanup & Security Verification Log

- **Audit Test Data:** No test data was committed to the cloud database during this investigation.
- **Local Scratch Artifacts:** Scratch scripts (`scratch/test-explain.js`, `scratch/measure-latency.js`) are safely confined to `scratch/` which is ignored by `.gitignore`.
- **Database Writes:** 0 mutating writes were executed against the MongoDB Atlas cluster.
- **Services:** Local processes inspected; dev server listening on ports 5000 and 5173 kept in their initial running state.

---

## 10. Single Most Important Fix to Execute First

**The single most urgent fix that must be made immediately is adding the Single Page Application rewrite rule to `vercel.json` (`CRIT-01`).** Currently, every direct link, shared URL, and browser page refresh on subpages (`/shop`, `/cart`, `/checkout`, `/admin/login`, `/products/:slug`, `/schools/:slug`) completely crashes with a raw Vercel HTTP 404 NOT_FOUND. Without this single-line configuration change, no customer or search engine crawler can access or refresh any page of the storefront beyond the homepage.
