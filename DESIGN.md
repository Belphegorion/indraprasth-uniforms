# DESIGN.md — Indraprasth Uniforms

> *"The Uniform Icons since 1975"* — Design Engineering Specification & Aesthetic System
> Authored under `/impeccable`, `/taste-skill`, and `/emil-design-eng` directives.

---

## 1. Executive Design Read & Aesthetic Philosophy

### Design Read
- **Entity**: Indraprasth Uniforms, Bhopal's leading academic, collegiate, healthcare, and corporate uniform tailor founded in 1975.
- **Audience**: Discerning parents of students at premier schools (Delhi Public School, St. Joseph's Co-Ed, Sagar Public School), institutional procurement boards, hospital administrators, and retail store shoppers across 4 Bhopal branches.
- **Aesthetic Family**: **Heritage Academic Editorial & Bespoke Tailoring Atelier**. 
- **Core Mood**: Prestigious, authoritative, archival, and deeply trustworthy. Replaces generic sterile e-commerce templates with the warmth of high-end tailoring paper, tactile linen beige surfaces, deep bespoke midnight navy, and burnished antique brass accents.
- **Anti-Default Discipline**:
  - NO generic AI-purple gradients, NO cold neon cyberpunk meshes, NO unstyled dark slate-900 templates.
  - NO repetitive uniform 3-card boxes without visual rhythm or typographic hierarchy.
  - Replaces sterile pure `#000000` on `#ffffff` with warm editorial ink (`#1A1816`) on natural unbleached linen parchment (`#FAF8F5`).

---

## 2. The Three Dials Configuration

| Dial | Calibration | Rationale |
|---|---|---|
| **`DESIGN_VARIANCE`** | **7 / 10** | Balanced asymmetry: structured e-commerce data density paired with grand editorial hero showcases, heraldic badges, and staggered product features. |
| **`MOTION_INTENSITY`** | **5 / 10** | Restrained, physical, and purposeful: snappy 200ms `ease-out` feedback, `:active` button compressions (`scale(0.98)`), smooth cart drawer entries, zero distracting loops. |
| **`VISUAL_DENSITY`** | **4 / 10** | Generous breathing room, clear plinth separation, generous line-heights, and crisp product card borders that mimic luxury swatch lookbooks. |

---

## 3. Typographic System: Editorial Serifs & Precision Sans

Typography forms the emotional spine of the brand. We pair a stately, high-contrast serif with classic italic cuts for heritage storytelling alongside a modern geometric sans engineered for optical screen legibility.

### Font Families
1. **Editorial Display Serif**: `Playfair Display` (Weights: 400, 600, 700; Italic: 400i, 600i, 700i)
   - Used for: Hero display headlines, section titles, quote markers, institutional mottoes, and italicized callouts (*"The Uniform Icons since 1975"*).
   - Character: High stroke contrast, elegant teardrop terminals, lyrical italics that convey academic pedigree and 50 years of bespoke tailoring.
2. **Modern Ergonomic Sans**: `Plus Jakarta Sans` (Weights: 400, 500, 600, 700, 800)
   - Used for: Body copy, navigation links, filters, size selectors, buttons, input fields, and pricing.
   - Character: Crisp open apertures, tall x-height, and flawless legibility on mobile screens down to 360px.
3. **Monospaced Academic Codes**: `JetBrains Mono` / `font-mono`
   - Used for: School codes (`DPS`, `STJ`), SKU numbers, order identifiers (`IU-20261104-0001`), and stock counters.

### Typographic Scale & Hierarchy
| Level | Font & Weight | Size / Line-Height | Tracking | Usage |
|---|---|---|---|---|
| **Display 1** | `Playfair Display` 700 / Italic | `text-4xl sm:text-6xl` (2.5rem – 3.75rem / 1.1) | `-0.02em` | Homepage Hero Title |
| **Display 2** | `Playfair Display` 600 | `text-3xl sm:text-4xl` (1.875rem – 2.25rem / 1.2) | `-0.015em` | Page Headings, Catalog Sections |
| **Display 3** | `Playfair Display` 600 / Italic | `text-2xl sm:text-3xl` (1.5rem – 1.875rem / 1.25) | `-0.01em` | Product Detail Titles, School Page Banners |
| **Subheading** | `Plus Jakarta Sans` 500 / Italic | `text-base sm:text-lg` (1rem – 1.125rem / 1.5) | `0em` | Editorial subtitles, value propositions |
| **Section Tag** | `Plus Jakarta Sans` 700 | `text-xs uppercase` (0.75rem / 1.2) | `+0.12em` | Heritage badges, school code tags, branch tags |
| **Body Large** | `Plus Jakarta Sans` 400 | `text-base sm:text-lg` (1rem – 1.125rem / 1.6) | `-0.005em` | Intro paragraphs, story narratives |
| **Body Standard** | `Plus Jakarta Sans` 400 / 500 | `text-sm sm:text-base` (0.875rem – 1rem / 1.5) | `0em` | Product descriptions, form labels, card copy |
| **Caption / Mono** | `Plus Jakarta Sans` 600 / `font-mono` | `text-xs` (0.75rem / 1.4) | `+0.05em` | Stock availability pills, delivery badges |

---

## 4. Sophisticated Color Palette: Beige, Bespoke Navy & Antique Gold

The color system replaces cold digital grays with warm, tactile architectural neutrals, deep academic navy, and warm burnished accents.

```
┌────────────────────────────────────────────────────────────────────────┐
│  LINEN CANVAS       PALE ALABASTER      BESPOKE NAVY      ANTIQUE GOLD │
│     #FAF7F2            #FFFFFF             #0E1726           #C5A880   │
│  Natural Swatch    Elevated Plinth     Authoritative Ink   Craft Accent│
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Linen & Sand Canvas (Warm Beige Foundations)
- **`linen-50` (`#FAF7F2`)**: The universal canvas background. Soft on the eyes, reminiscent of premium cotton cardstock and archival ledgers.
- **`linen-100` (`#F4EFE6`)**: Secondary surface for section contrasts, filter rails, table headers, and breadcrumb tracks.
- **`linen-200` (`#EBE4D5`)**: Card plinths, subtle dropdowns, input backgrounds, and size badge states.
- **`linen-300` (`#DDD4C2`)**: Crisp dividing borders, swatch outlines, and structural separation lines.
- **`linen-400` (`#C4B8A2`)**: High-contrast borders for hover states and active form controls.

### 2. Bespoke Navy (Authority & Brand Primary)
- **`navy-950` (`#0A111E`)**: Deepest midnight obsidian. Used for primary headlines, hero backgrounds, and dark contrast sections.
- **`navy-900` (`#0E1726`)**: Primary brand ink, footer canvas, and formal buttons.
- **`navy-800` (`#16243C`)**: Active button hovers, dropdown hover items, and badge backgrounds.
- **`navy-700` (`#1E3A60`)**: Academic blazer blue, school header gradients, and interactive links.
- **`navy-600` (`#1D4ED8`)**: Signature Indraprasth electric blue accent for active indicators and cart counts.

### 3. Antique Brass & Muted Gold (Heritage Accents)
- **`gold-50` (`#FBF8F1`)**: Soft golden tint for alert banners and trust badges.
- **`gold-100` (`#F6EEDC`)**: Light gold surface for "Since 1975" badges and rating stars.
- **`gold-300` (`#DFC79A`)**: Soft golden borders for partner school cards and premium blazers.
- **`gold-500` (`#C5A880`)**: Primary champagne brass accent. Used for decorative rules, stars, and bespoke monograms.
- **`gold-600` (`#B38E5D`)**: Deep burnished gold for hover states and button outlines.

### 4. High-Contrast Charcoal Ink
- **`charcoal-900` (`#1A1816`)**: Rich espresso ink for body copy. Yields a 14.2:1 contrast ratio against `#FAF7F2` (far exceeding WCAG AAA standard).
- **`charcoal-700` (`#3C3730`)**: Secondary metadata, price notes, and branch addresses.
- **`charcoal-500` (`#736B60`)**: Timestamps, breadcrumb dividers, and inactive icons.

---

## 5. Emil Kowalski Micro-Interactions & Motion Choreography

All interactive elements are engineered according to Emil Kowalski's core tenets:

1. **Hardware-Accelerated Transitions**:
   - Strictly prohibit `transition: all`.
   - Specify discrete properties: `transition-[transform,opacity,background-color,border-color] duration-200 ease-out`.
2. **Tactile Button Press (`:active`)**:
   - Every primary and secondary interactive button depresses physically: `active:scale-[0.98]`.
   - Touch targets maintain a minimum 44×44px hit-box with generous padding.
3. **Plinth Hover Elevation**:
   - Product cards and school tiles subtly lift upon hover: `hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(26,24,22,0.1)]`.
4. **Natural Spatial Direction**:
   - Slide-over Cart Drawer slides in from the right with a clean 300ms cubic bezier curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Dialog modals scale gently from `scale(0.97)` to `scale(1)` with concurrent opacity fade.
5. **No Visual Noise**:
   - No looping pulses, no infinite marquee spinners, no bouncing buttons. Motion serves only to confirm state changes and maintain spatial orientation.

---

## 6. Component Design Specifications

### A. The Header & Announcement Bar
- **Announcement Bar**: Rich navy `#0E1726` with warm gold `#C5A880` text. Subtle italic tag: *"Bhopal's Trusted Uniform Specialists Since 1975 • 4 Retail Branches Across the City"*.
- **Main Nav Surface**: Alabaster `#FFFFFF` with soft 1px border in `linen-300` (`#DDD4C2`).
- **Logo Presentation**: Deep navy monogram with gold trim; serif title *"Indraprasth"* with italic subtitle *"Uniforms • Est. 1975"*.
- **School Quick Switcher**: Warm beige pill with dropdown menu grouped by campus code.

### B. The Editorial Hero
- **Split Layout**: Left editorial column featuring an italicized historical badge (*"The Uniform Icons since 1975"*), towering Playfair Display headline (*"Precision tailoring for academic and professional distinction"*), and warm brass CTA buttons.
- **Right Visual Plinth**: Layered editorial composite showcasing the flagship DPS Blazer with school crest badge, tailoring swatch details, and certified cloth warranty.

### C. Product Cards (Swatch Lookbook Aesthetic)
- **Container**: Elevated white plinth surrounded by a 1px `linen-300` border, `rounded-xl`.
- **Image Frame**: Dedicated warm-sand plinth (`bg-[#F7F4EE]`) with generous padding to prevent product images from touching outer bounds.
- **Badges**:
  - School Code Badge: Navy background with crisp white mono text (`DPS`, `DPS KOLAR`).
  - Category Badge: Warm linen pill with charcoal serif text.
- **Typography**: Product title in crisp serif/sans hybrid, with Indian Rupee price highlighted in bold charcoal alongside subtle crossed MRP.
- **Action**: Direct "Add to Bag" button with tactile press feedback and quick size popup.

### D. School Dedicated Page (`/schools/:slug`)
- **Academic Heraldry Header**: Deep navy textured banner with golden filigree border, school code badge, full school name in Playfair Display, and address.
- **"Add Full Uniform Set" Bundle Bar**: Floating or pinned helper allowing parents to select sizes for Blazer, Shirt, Pant/Divider, Tie, and Socks and add the complete kit to the bag in a single click.

### E. Cart Drawer & Checkout
- **Paper Invoice Aesthetic**: Soft linen card plinths with perforated receipt border styling.
- **Reassurance Elements**: Clear free-delivery progress bar, verified Bhopal branch pickup selector, Cash on Delivery option with zero hidden fees.

---

## 7. Accessibility & Performance Invariants

- **Contrast Ratios**: All body text achieves at least **12:1** (WCAG AAA) on light surfaces, and **14:1** on dark surfaces. Accent gold buttons use deep navy text or deep bronze borders to ensure 5:1 minimum legibility.
- **Interactive Targets**: Minimum click/touch target of 44×44px across all buttons, counter toggles, and navigation links.
- **Reduced Motion Support**: `@media (prefers-reduced-motion: reduce)` disables scale transforms and transitions instantly.
- **Font Optimization**: Google Fonts loaded via `preconnect` with `font-display: swap` to prevent layout shifts.
