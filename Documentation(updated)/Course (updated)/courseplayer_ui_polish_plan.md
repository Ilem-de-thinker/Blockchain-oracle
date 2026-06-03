# CoursePlayer UI/UX Polish Plan

## Overview

This plan outlines improvements for the `PDFViewer`, `VideoPlayer`, and general text rendering within the `CoursePlayer` to ensure high readability, theme consistency, and a professional "white-label" feel for video content.

---

## 1. High-Readability Text Rendering

### Current Issues
- `TiptapRenderer` and `VideoPlayer` transcript use hardcoded colors or generic prose classes that don't always provide optimal contrast in custom themes (Dark, Ocean).
- Font sizes and line heights are inconsistent across different material types.
- Padding on mobile can feel cramped, or too wide on desktop.

### Target Improvements
- **Theme-Aware Prose**: Update all `article.prose` blocks to strictly use `--color-text` and `--color-text-secondary`.
- **Dynamic Inversion**: Ensure that when a dark theme is active, the typography scales properly with `prose-invert` or custom theme-aware overrides.
- **Enhanced Typography**: 
  - Standardize line-height (`leading-relaxed`) and font-weight (`font-medium` for body text).
  - **Mobile-First Sizing**: Ensure body text remains at a minimum of `16px` (`text-base`) on mobile to prevent zooming and maintain high legibility.
- **Adaptive Layout**:
  - Implement responsive container padding (e.g., `px-4` on mobile, `px-10` on desktop).
  - Maximize content readability with a constrained `max-w-4xl` width for long-form text.

---

## 2. Professional PDF Utility

### Current Issues
- Hardcoded `slate` colors clash with the new dashboard themes.
- No zoom controls make it difficult to read complex diagrams or small text.
- Navigation is functional but lacks visual polish.
- Text is non-selectable (canvas-only), breaking accessibility and research workflows.

### Target Improvements
- **Full Theme Integration**: Replace all `bg-slate-100`, `text-slate-600`, etc., with `bg-bg-secondary`, `text-text`, and `border-border`.
- **High-Fidelity Rendering**:
  - **Text Selection Layer**: Overlay a transparent `TextLayer` on top of the canvas to enable native text selection, copying, and screen-reader accessibility.
  - **DPI Scaling**: Use `window.devicePixelRatio` to ensure razor-sharp text on high-res displays.
  - **Dynamic Zoom**: Implement two-step scaling (CSS transforms for instant feedback + debounced high-res re-render).
- **Advanced Navigation**:
  - Unified, theme-aware top toolbar with zoom percentage display.
  - Polished floating navigation with `primary` color accents and `backdrop-blur`.

---

## 3. Mobile-Native PDF Experience

### Target Improvements
- **Natural Gestures**:
  - **Pinch-to-Zoom**: Multi-touch support for intuitive zooming on tablets and phones.
  - **Swipe Navigation**: Horizontal swiping to change pages with smooth "spring" physics.
  - **Double-Tap**: Smart-zoom to content or reset zoom state on double-tap.
- **Immersive Mobile UI**:
  - **Auto-Hide Toolbars**: Hide navigation/toolbars during active scrolling to maximize reading area.
  - **Touch-Optimized Targets**: Ensure all buttons meet 44x44px minimum hit area for mobile.
  - **Snap-to-Page**: Precision snapping when swiping between pages to maintain focus.

---

## 4. "White-Label" Video Experience

### Current Issues
- YouTube branding (logo, title, "Watch on YouTube") is prominent, making the course feel less premium.
- User can interact with YouTube-specific actions (sharing, related videos) that lead them away from the course.

### Target Improvements
- **YouTube Masking**: 
  - Implement a **Custom Overlay Layer** that sits on top of the iframe.
  - This overlay will catch "accidental" clicks that would normally trigger YouTube's branding.
  - Use `pointer-events-none` on the iframe for everything except the play/pause area, or wrap it in a container that obscures the top and bottom branding strips.
- **Custom Playback Controls**: 
  - Build a custom control bar (Play/Pause, Progress, Volume, Speed) that communicates with the YouTube API.
  - This allows us to hide YouTube's native controls entirely (`controls=0` in embed parameters).
- **Branding Protection**: Use `modestbranding=1` and `showinfo=0` (where still supported) and `rel=0` to prevent distracting related content.

---

## 5. Proposed File Changes

| File | Changes |
|------|---------|
| `components/ui/PDFViewer.tsx` | Theme variables, Zoom state, `TextLayer` implementation, Gesture support, `devicePixelRatio` scaling. |
| `components/ui/VideoPlayer.tsx` | Custom control bar, YouTube API integration, branding masking overlays. |
| `components/ui/TiptapRenderer.tsx` | Strict theme-aware prose classes, standardized line-height/font-weight for all themes. |

---

## 6. Implementation Strategy

1.  **Phase 1: Typography & Theme**: Update CSS variables and prose classes across all components for immediate readability gains.
2.  **Phase 2: High-Fidelity PDF**:
    *   Implement zoom and theme integration.
    *   Add the **Text Layer** for selection and accessibility.
    *   Optimize canvas for DPI scaling.
3.  **Phase 3: Mobile-Native Gestures**:
    *   Add touch event listeners for pinch-to-zoom and swiping in `PDFViewer`.
    *   Implement immersive UI (auto-hiding bars).
4.  **Phase 4: White-Label Video**: Refactor `VideoPlayer` to hide native YouTube controls and branding using an overlay and custom API-driven controls.

---

## 7. Success Criteria
- [ ] Text is equally readable in Light, Dark, and Ocean themes.
- [ ] PDF text is **selectable and searchable** using native browser tools.
- [ ] PDF zoom feels smooth and remains sharp on high-res mobile displays.
- [ ] Users can navigate PDF pages via swipe and zoom via pinch on mobile.
- [ ] YouTube logo and "Watch on YouTube" links are obscured or hidden.
- [ ] No external "Related Videos" appear at the end of a lesson.
