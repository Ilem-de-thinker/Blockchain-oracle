# Daily Development Report — June 17, 2026

## Summary of Changes

Today's work covered four main areas: testimonials management, course player improvements, public/dashboard CSS isolation, and an interactive mouse tracker feature.

---

## 1. Testimonials Management

### Super Admin — View Testimonial Modal
- Added a **View button** (expand icon) on each testimonial card in the Super Admin Testimonials page
- Clicking the button opens a **full detail modal** showing the complete testimonial quote, user info (name, role, email, profile picture), status badges (approved/rejected/pending, public/private), and submission timestamps
- Previously, long testimonials were truncated in the card view with no way to see the full text

### Landing Page — Dynamic Testimonials from Database
- Replaced **6 hardcoded testimonials** with a live fetch from the API (`GET /api/testimonials/public/`)
- The "What Our Students Say" section now shows **only approved public testimonials** from the database
- **Smart display logic:**
  - 5 or fewer testimonials → displayed in a static responsive grid (no scrolling)
  - More than 5 testimonials → split into 3 columns with the existing vertical scrolling carousel
- Added **loading spinner** and **empty state** ("No testimonials yet") for better UX

### API Endpoint Updates
- Updated all testimonial API endpoints from the old path (`/api/core/testimonial/...`) to the new standardized path (`/api/testimonials/...`)

---

## 2. Course Player Page Improvements

### PDF Viewer — Page Progress Tracking
- The PDF viewer now reports **page-level progress** instead of generic scroll percentage
- The progress bar shows "Page Progress" with the current page number (e.g., "Page 3 of 12 — 25%")
- This gives learners accurate feedback on how far they've progressed through PDF materials

### Syllabus Sidebar — Certificate Download
- Added a **"Print Certificate" button** that appears at the bottom of a course section when all materials in that section are completed
- The button downloads the enrollment certificate via the certificates API
- Includes loading state ("Downloading...") and error handling with toast notifications

### Syllabus Sidebar — Module Lock Indicators
- Added a **lock icon** next to section headers when a module is locked (based on access threshold)
- Fixed module lock detection to work with both `id` and `module_id` field formats from the API

### Sidebar Mobile Layout Fix
- Fixed the syllabus sidebar on mobile devices — it no longer overlaps the bottom navigation bar (adjusted from `bottom-0` to `bottom-[5rem]`)

---

## 3. Public Page / Dashboard CSS Isolation

### Problem
When the dashboard theme was set to dark or ocean mode, the CSS color variables (set as inline styles on the HTML element by ThemeContext) bled through to the public-facing pages. This caused the footer background, text colors, and other elements on the landing page to appear with dashboard theme colors instead of the intended light theme.

### Root Cause
The ThemeContext sets CSS custom properties as **inline styles** on `<html>` and directly on `document.body`. Inline styles have the highest CSS specificity and override any attribute-based CSS selectors like `[data-theme="light"]`.

### Solution
- On mount, the public layout now **saves** all current CSS variable values, body inline styles, and the `data-theme` attribute
- It then **overrides** all 22+ CSS color variables with hardcoded light-theme values using `html.style.setProperty()`
- Clears the body's inline `backgroundColor` and `color` styles
- Sets `data-theme="light"` and `colorScheme="light"`
- On unmount (when navigating to the dashboard), all previous theme values are **fully restored**

This ensures the public pages are **completely isolated** from whatever theme the dashboard user has selected.

---

## 4. Interactive Mouse Tracker

### New Feature
- Created a new `MouseTracker` component that displays a **trail of cryptocurrency logo particles** following the cursor
- Uses the same 8 crypto logos from the TrustedBy partner carousel (Binance, Ethereum, Polygon, Solana, Chainlink, Cardano, Polkadot, Avalanche)
- All logos are **downloaded locally** (`/public/crypto-logos/`) for instant loading with no third-party lag

### Behavior
- As the mouse moves, crypto logos spawn at the cursor position and **drift upward while fading out**
- Creates a flowing trail effect behind the cursor
- Throttled to spawn a new particle every 50ms (responsive but not overwhelming)
- Capped at 20 concurrent particles to maintain performance
- Each particle lives for 900ms before being removed

### Deployment
- Active on **both** the dashboard (via SharedDashboardLayout) and all public pages (via PublicLayout)
- Removed the old purple glow cursor effect (`CursorGlow`) from the landing page, replaced by the new crypto logo trail

---

## Additional Changes
- Updated API backend URL configuration in `.env` and `.env.example`
- Fixed the Binance logo URL (was returning 404 from the third-party CDN, corrected to working URL, then moved to local file)
- Partner logos in the TrustedBy carousel now load from local files for reliability

---

**Files Modified:** 13 | **New Files:** 9 (MouseTracker component + 8 crypto logo SVGs)
