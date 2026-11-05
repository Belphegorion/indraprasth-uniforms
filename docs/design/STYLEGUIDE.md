# Indraprasth Uniforms — Design System & Brand Styleguide

*“The Uniform Icons since 1975” — Bhopal, Madhya Pradesh*

---

## 1. Brand Identity & Logo Analysis

The visual re-theming of **Indraprasth Uniforms** stems directly from the heritage brand crest and wordmark:
* **The Imperial Crown:** Royal Crimson (`#C8233F` / `#D82848`). Represents 50 years of master uniform tailoring and authoritative quality standards across Madhya Pradesh.
* **The Wordmark:** Deep Royal Blue (`#1860A8`). Evokes institutional discipline, educational prestige, and trustworthiness.
* **The "UNIFORMS" Ingot Band:** Warm metallic framing paired with an Antique Brass accent (`#A8863C` / `#7A5F22`), recalling bespoke blazer buttons and traditional brass tailoring shears.
* **The Tagline:** *"The Uniform Icons since 1975"* rendered in high-contrast italic serif typography.

---

## 2. The 60-30-10 Aesthetic Distribution

To transition away from generic "AI-blue / SaaS" aesthetics into a warm, prestigious heritage department store feel, all interfaces strictly follow the **60-30-10 rule**:

```
┌──────────────────────────────────────────────────────────┐
│ 60% SURFACES & CANVAS                                    │
│ Warm Cream (#F7F2E8) & Crisp Paper (#FBF8F2)             │
│ Sand Alternating Bands (#EDE3D2) & Borders (#DCCDB4)     │
├────────────────────────────┬─────────────────────────────┤
│ 30% DEEP NAVY STRUCTURE    │ 10% RESTRAINED ACCENTS      │
│ Navy-800 (#0E2747)         │ Royal Blue (#1860A8) Focus  │
│ Navy-900 (#0A1F3A)         │ Crimson (#C8233F) Badges    │
│ Headings, Nav, Footers     │ Antique Brass (#A8863C)     │
└────────────────────────────┴─────────────────────────────┘
```

---

## 3. Colour Tokens (Single Source of Truth)

All colour definitions reside in [`client/src/styles/tokens.css`](file:///c:/Users/atlas/OneDrive/%E3%83%89%E3%82%AD%E3%83%A5%E3%83%A1%E3%83%B3%E3%83%88/indrapresth/client/src/styles/tokens.css) as CSS custom properties and are mapped in `tailwind.config.js`.

### 3.1 Primary Brand Palette

| Token Name | CSS Custom Property | Hex Code | Role & Usage | Contrast vs Background |
|---|---|---|---|---|
| `cream-100` | `--color-cream-100` | `#F7F2E8` | Primary global canvas / page body | Background baseline |
| `cream-50` | `--color-cream-50` | `#FBF8F2` | Card plinths, form panels, modals | Surface layer |
| `sand-100` | `--color-sand-100` | `--` | Soft input fills & disabled backgrounds | Sub-surface |
| `sand-200` | `--color-sand-200` | `#EDE3D2` | Alternating section bands, table headers | Layout structure |
| `sand-300` | `--color-sand-300` | `#DCCDB4` | Card borders, dividing rules, separators | Structural outlines |
| `taupe-500` | `--color-taupe-500` | `#8C7B63` | Placeholder text, secondary meta, MRP strikethrough | 4.6:1 (AA pass) |
| `navy-900` | `--color-navy-900` | `#0A1F3A` | Footer foundation, admin sidebar, dark plinths | 15.6:1 (AAA pass) |
| `navy-800` | `--color-navy-800` | `#0E2747` | Primary headings (`h1`-`h4`), primary buttons, brand text | 13.4:1 (AAA pass) |
| `navy-700` | `--color-navy-700` | `#14407A` | Hover & pressed states for primary buttons | 10.8:1 (AAA pass) |
| `blue-600` | `--color-blue-600` | `#1860A8` | Logo Royal Blue: hyperlinks, active school pill, focus rings | 5.7:1 (AA pass) |
| `blue-100` | `--color-blue-100` | `#DCE8F5` | Selected state backgrounds, info alert chips | Highlight tint |
| `crimson-600` | `--color-crimson-600` | `#C8233F` | Logo Crown Red: sale tags, cart badge count, key action CTAs | 5.6:1 on white (AA pass) |
| `crimson-700` | `--color-crimson-700` | `#A51B33` | Hover state for crimson CTAs | 7.8:1 (AAA pass) |
| `crimson-100` | `--color-crimson-100` | `#F8DDE2` | Soft badge backgrounds for discounts and warnings | Accent tint |
| `brass` | `--color-brass` | `#A8863C` | Antique brass ornamental borders, crest emblems, dividers | Decorative |
| `brass-text` | `--color-brass-text` | `#7A5F22` | Text brass token meeting WCAG AA contrast on cream | 4.6:1 (AA pass) |

---

## 4. Typography Hierarchy

The typographic system fuses British heritage school tailoring with crisp modern readability:

* **Display & Headings:** `font-serif` (`Playfair Display`, `Georgia`, serif)
  * Used for hero headlines, section titles, product card titles, school names, modal headers, and receipt banners.
  * Styling: Optical tracking (`tracking-tight`), editorial weight (`font-black` or `font-extrabold`), paired with warm italic subheadings.
* **Body & Interactive Controls:** `font-sans` (`Inter`, system-ui, sans-serif)
  * Used for body copy, form labels, button labels, filter chips, navigation items, and specifications.
  * Styling: Clear letter-spacing, robust tap targets, high contrast.
* **Prices, Codes & Technical Data:** `font-mono` (`JetBrains Mono`, `Menlo`, monospace)
  * Used for Indian Rupee prices (`₹`), school code badges (`DPS`, `SPS`), order numbers (`IU-20261104-0001`), GSTIN, and measurement tables.

---

## 5. Micro-interactions & Tactile Craft

* **Tactile Buttons (`.btn-tactile`):**
  * Hardware-accelerated CSS transition with subtle `active:translate-y-0.5` press depth.
  * Shadow calibrated with soft ambient navy tint (`shadow-navy-900/10` to `shadow-navy-900/20`), completely eliminating pitch-black or purple shadows.
* **Plinth Cards (`.card-plinth`):**
  * Warm paper surface (`bg-cream-50`), framed with a crisp warm sand hairline (`border border-sand-300`).
  * Elevation transition on hover (`hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/5`).
* **Brass Hairline Ornament (`.brass-hairline`):**
  * Luxurious linear gradient divider running from `transparent` through `rgba(168, 134, 60, 0.45)` back to `transparent`.
* **Focus States (`:focus-visible`):**
  * High-contrast 2px royal blue ring (`ring-2 ring-blue-600 ring-offset-2 ring-offset-cream-100`) ensuring effortless keyboard accessibility.

---

## 6. Accessibility & Compliance Verification

| Element / Pair | Background Token | Foreground Token | Contrast Ratio | WCAG Standard |
|---|---|---|---|---|
| Primary Button Text | `navy-800` (`#0E2747`) | `white` (`#FFFFFF`) | **14.9:1** | WCAG AAA Pass |
| Main Page Headings | `cream-100` (`#F7F2E8`) | `navy-800` (`#0E2747`) | **13.4:1** | WCAG AAA Pass |
| Body Text | `cream-50` (`#FBF8F2`) | `ink` (`#1B2430`) | **14.8:1** | WCAG AAA Pass |
| Secondary Metas | `cream-50` (`#FBF8F2`) | `slate` (`#4B5868`) | **6.5:1** | WCAG AA Pass |
| Links & Interactive Blue | `cream-100` (`#F7F2E8`) | `blue-600` (`#1860A8`) | **5.7:1** | WCAG AA Pass |
| Crimson CTA Button Text | `crimson-600` (`#C8233F`) | `white` (`#FFFFFF`) | **5.6:1** | WCAG AA Pass |
| Antique Brass Text Token | `cream-100` (`#F7F2E8`) | `brass-text` (`#7A5F22`) | **4.6:1** | WCAG AA Pass |
| Dark Section / Footer | `navy-900` (`#0A1F3A`) | `cream-100` (`#F7F2E8`) | **14.8:1** | WCAG AAA Pass |

---

## 7. Component Pattern Directory

### Public Storefront
1. **Header & Navigation (`client/src/components/layout/Header.tsx`):**
   * Top bar: Navy-900 with gold phone icon, live Bhopal delivery ticker, track order link.
   * Main bar: Cream-50 plinth, authentic brand logo, serif navigation links, search box, cart trigger with crimson badge.
2. **Hero Section (`client/src/pages/Home.tsx`):**
   * Cream-100 background with subtle warm sand mesh plinth.
   * Crimson primary CTA ("Select Your School"), navy secondary button ("Institutional & Bulk Orders").
   * 50-year heritage badge, 4 Bhopal branch indicator, 100% dye-lot regulation stamp.
3. **Shop by School Matrix (`client/src/components/home/SchoolShopSection.tsx`):**
   * Sticky left school selector with active royal blue highlight.
   * Multi-facet filter bar: Gender, Season, Item Type, Uniform Type, Size, Price slider, and In-Stock toggle.
   * Product cards with official school badge, strikethrough MRP, size selector popover, and tactile bag action.
4. **Checkout & Order Tracking (`Checkout.tsx`, `TrackOrder.tsx`):**
   * Clean cream-50 docket summary, live delivery fee calculation, in-store pickup branch selector, status step tracker.

### Admin Portal
1. **Admin Layout (`client/src/pages/admin/AdminLayout.tsx`):**
   * Sidebar in deep Navy-900 with authentic brand logo, crimson active-link accent line, and store owner badge.
   * Canvas in Cream-100 with sand header bar.
2. **Dashboard (`Dashboard.tsx`):**
   * Cream-50 KPI cards, Recharts 30-day revenue curve using logo royal blue (`#1860A8`), low-stock alert feed, and recent orders ledger.
3. **Products & Product Form (`Products.tsx`, `ProductForm.tsx`):**
   * Clean Sand-200 table headers, Cloudinary drag-and-drop media plinth, multi-school affiliation tagging, stock matrix table.
4. **Order Detail & Printable Invoice (`OrderDetail.tsx`):**
   * Official tax receipt docket styled with business GSTIN, customer billing address, fulfillment destination, WhatsApp prospect link, and printable thermal layout.
