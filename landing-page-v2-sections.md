Design a complete Tailwind CSS landing page with the following sections and features. Use exact color values specified below. Make it modern, animated (framer-motion style scroll reveals), and fully responsive.

## Brand Identity
- Logo text: "Blo|<ChainOracle" (with thin "O")
- Tagline: Africa's leading Blockchain & Web3 education and enterprise platform
- Primary color: `#7C3AED` (purple-600)
- Secondary purple: `#8B5CF6` (purple-500), `#A78BFA` (purple-400), `#C4B5FD` (purple-300), `#E9D5FF` (purple-200), `#F3E8FF` (purple-100)
- Text: headings `#111827` (gray-900), body `#6B7280` (gray-500)
- Page bg: `#FAF8FF`, section bg: white `#FFFFFF`, alt section bg: `#F9FAFB` (gray-50)
- Gradients: `from-purple-600 to-purple-500` (primary button), `from-purple-600 to-purple-400` (gradient text)
- CTA bg: `from-purple-600 via-purple-500 to-purple-700`

## Sections to Build

### 1. Navbar
Fixed top nav, transparent → white on scroll, scroll-aware. Links: Home, About, Courses, Events, Enterprise. Desktop right-side: "Sign In" outlined + "Get Started" filled purple button. Mobile: hamburger → full menu overlay.

### 2. Hero Section (full-screen)
Full-screen Swiper carousel with fade effect, 4 slides cycling every 5s. Each slide:
- Full-bleed background image with gradient overlay (`from-white via-white/80 to-transparent`)
- Headline (large, bold, tracking-tight), subtext, two CTAs: "Start Learning" (purple filled) + "Free Account" (outlined)
- 40 floating purple particles animating randomly behind content
- Floating card on right: logo + brand name + description + "Explore Services" button + 4 avatar circles + "Active Learners" pulse indicator
- Bouncing "explore" arrow button at bottom that scrolls to About section

### 3. Trusted By (auto-scrolling partner logos)
Full-width logo strip with infinite horizontal scroll. 8 crypto logos (Binance, Ethereum, Polygon, Solana, Chainlink, Cardano, Polkadot, Avalanche) in grayscale that turn full-color on hover. Auto-scroll, pause on mouse hover.

### 4. About Preview (two-column)
"About Us" badge pill → "Blockchain & Web3 **Mastery** for Africa" heading → descriptive paragraph → 3 checkmark bullet points ("Structured courses", "Education + real-world practice", "Enterprise advisory") → "Explore Courses" button.
Left column: image with gradient overlay + play icon overlay, floating glow behind it.

### 5. Platform Features (6-card grid)
Badge: "Features" with pulsing dot. Heading: "Powerful **Platform** Features". Subtitle.
6 cards (2-col tablet, 3-col desktop): Structured Learning, Real-World Practice, Progress Tracking, Certified Programs, Community Hub, African-Focused Content.
Each: gradient icon box (12 colors alternating), title, description, hover lift + border glow + "Learn more →" reveal on hover.

### 6. Featured Courses (4 cards, dynamic)
Badge: "Courses". Heading: "Featured **Courses**". "View All Courses →" link top-right.
4 cards: thumbnail image (or gradient fallback with first letter), level badge, title, description (2-line clamp), price ("FREE" or "₦amount"), arrow icon button. Skeleton loading while fetching.

### 7. Learning Paths (3 cards)
Badge: "LEARNING PATHS". Heading: "Choose Your **Path**".
3 cards: Blockchain Foundations (5 steps: Basics, Cryptography, Consensus, Architecture, Use Cases), Web3 Developer (Web3 Basics, Smart Contracts, DApps, DeFi, Security), Crypto Literacy (Market Basics, Risk Management, Technical Analysis, Fundamental Analysis, Security).
Each: icon, title, 5 numbered steps (01, 02 etc.), hover lift + shadow.

### 8. Enterprise Services (sticky sidebar + 5 cards)
Badge: "Enterprise". Heading: "Enterprise **Services**". Description paragraph. Sticky left column (2 of 5 grid).
Right column: 5 cards—Staffing & Recruitment, Tokenomics Design, Business Development, Launch-to-Market Strategy, Enterprise Platform Development. Each: icon + title + description, hover slide-right + glow border effect.

### 9. Events (empty state)
Badge: "EVENTS". Heading: "Upcoming **Events**". Dashed border box with large calendar SVG icon + "Exciting updates dropping soon. Stay tuned!" — to be replaced with event cards later.

### 10. Testimonials (dynamic)
Badge: "Testimonials". Heading: "What Our **Students** Say".
If ≤5 testimonials: 3-column grid. If >5: 3-column vertical infinite-scroll carousel (CSS animation, alternating up/down direction, pause on hover).
Each card: 5 gold stars, quote text in quotes, user avatar + name + role.

### 11. Blog Preview (3 cards)
Badge: "BLOG". Heading: "Latest **Insights**".
3 blog cards (16:9 thumbnail, category label (Technology / Finance / Innovation), title, date). Hover lift + image zoom.

### 12. CTA Section (full-width purple)
"Ready to Build the **Future?**" heading → description paragraph → 2 CTAs: "Start Learning Today" (white filled) + "Create Free Account" (outlined white). Animated pulsing glow circle behind text.

### 13. Scroll Progress Bar
Thin fixed top bar that fills from 0% to 100% as user scrolls, purple gradient.

### 14. Google Sign-In Modal
Auto-appears after 3s for unauthenticated users (not dismissed in last 24h). Logo + Google sign-in button + dismiss option.

## Design Notes
- All cards should have hover lift (`y: -4`), subtle shadows, and transition animations
- Section headings should enter with fade-up on scroll into view
- Purple gradient text effect on key words using `bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-400`
- Use `rounded-2xl` for cards, `rounded-xl` for buttons, `rounded-full` for badges
- All badges: small pill with purple-100 bg, purple-700 text, uppercase, tracking-widest
- Page is `overflow-x-hidden` with white background
- Use framer-motion `AnimatePresence`, `useScroll`, `useSpring`, `whileInView`, `initial/animate/exit` patterns
