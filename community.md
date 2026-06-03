1. Brand Assets
   * Main Logo:
       * Path: /Logo/logo.png
       * Rendered Size: w-8 h-8 (32x32px).
       * Locations: Sticky Navbar and the "Floating Card" in the Hero section.
       * Recommendation: Use a high-quality transparent PNG or SVG.

  2. Hero Section
   * Learner Avatars (Social Proof):
       * Source: https://i.pravatar.cc/100?u=...
       * Rendered Size: w-7 h-7 (28x28px).
       * Note: These are shown in a stacked row in the floating card to represent active learners.
   * Hero Background:
       * Note: No image file is used here; it uses animated CSS particle fields and gradients (from-purple-100 via-white
         to-purple-50).

  3. About Section
   * Feature Illustration/Photo:
       * Source: https://images.unsplash.com/photo-1639762681057-408e52192e55
       * Rendered Size: w-full h-80 (Approx. 600px width on desktop, 320px height).
       * Style: Uses object-cover with a rounded-3xl border.

  4. Content Cards (Courses, Events, & Blog)
  All card-based images follow a consistent sizing pattern:
   * Course/Event/Blog Thumbnails:
       * Source: Unsplash placeholders.
       * Rendered Size: h-44 (176px tall). The width is responsive based on the grid (typically 300px to 400px).
       * Aspect Ratio: Approximately 16:9.
       * Recommendation: Use images at 800x450px for high-quality display.

  5. Testimonials
   * Student Avatars:
       * Source: https://i.pravatar.cc/100?u=...
       * Rendered Size: w-10 h-10 (40x40px).
       * Style: Circular crop.

  6. Summary for Local Asset Replacement
  If you are preparing local images to replace these placeholders, here is a guide for the optimal sizes:

  ┌─────────────────────┬────────────────────────┬──────────────┬────────────────────┐
  │ Asset Type          │ Recommended Resolution │ Aspect Ratio │ Recommended Format │
  ├─────────────────────┼────────────────────────┼──────────────┼────────────────────┤
  │ Main Logo           │ 128x128px              │ 1:1          │ PNG / SVG          │
  │ About Section Image │ 1200x800px             │ 3:2          │ WebP / JPG         │
  │ Card Thumbnails     │ 800x450px              │ 16:9         │ WebP / JPG         │
  │ User Avatars        │ 200x200px              │ 1:1          │ WebP / JPG         │
  └─────────────────────┴────────────────────────┴──────────────┴────────────────────┘

  Note on PWA Icons: If you are updating the /Logo/ folder, ensure you have the PWA favicons at 192x192 and 512x512 as
  defined in your vite.config.ts.