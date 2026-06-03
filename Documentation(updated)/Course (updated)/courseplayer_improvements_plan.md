# CoursePlayerPage — Required Improvements

## Overview

Two major problems exist in the current CoursePlayer:

1. **No sequential material locking** — Materials within a module can be clicked in any order. The `Lock` icon in the sidebar is purely cosmetic. A user can skip to Material 5 without ever viewing Material 1.

2. **Fake progress metrics** — The completion area in `ContentStage` uses artificial "attention span" (a timer that counts to 5 minutes regardless of what the user does) and scroll percentage to gate the "Mark as Complete" button. These are not tied to actual course progress from the API and provide no real value.

---

## 1. Sequential Material Access

### Current Behavior

- `SyllabusSidebar` renders all materials in a module with a `Lock` icon when they are not active and not completed — but they are still clickable.
- `handleMaterialSelect` in `CoursePlayerPage` only checks for **module-level payment locks** (`moduleAccess`). There is no check for whether the **previous material in sequence** has been completed.
- Within a module, materials are ordered by `material.order`, but the UI does not enforce progression.

### Target Behavior

- A material can only be accessed if either:
  - It is the **first material in the course**, OR
  - The **immediately preceding material** (by `flattenMaterials` order) is `is_completed`.
- If a user clicks a locked material, show a toast: `"Complete the previous lesson first"`.
- The sidebar should visually distinguish **payment-locked** vs **prerequisite-locked** vs **completed** vs **active**.

### Implementation — `CoursePlayerPage.tsx`

#### 1a. Compute prerequisite completion map

Add a helper to determine if a material is unlocked by prerequisite:

```typescript
// In CoursePlayerPage component body
const isMaterialAccessible = useCallback((materialId: number): boolean => {
  const idx = materials.findIndex(m => m.id === materialId);
  if (idx <= 0) return true; // first material or not found — always accessible
  const prevMaterial = materials[idx - 1];
  return completedLessons.includes(prevMaterial.id) || !!prevMaterial.is_completed;
}, [materials, completedLessons]);
```

#### 1b. Update `handleMaterialSelect`

Add prerequisite check before the existing payment-lock check:

```typescript
const handleMaterialSelect = (material: CourseMaterial) => {
  // 1. Prerequisite check — previous material must be completed
  if (!isMaterialAccessible(material.id)) {
    toast.warning('Complete the previous lesson first.');
    return;
  }

  // 2. Payment-lock check (existing)
  const parentModule = accessibleModules.find(m =>
    m.materials?.some(mat => mat.id === material.id)
  );
  if (parentModule && moduleAccess) {
    const access = moduleAccess.modules?.find((m: any) => m.id === parentModule.id);
    if (access?.is_locked) {
      toast.warning('This module requires additional payment. Please clear your balance.');
      return;
    }
  }

  // 3. Navigate to material
  const index = materials.findIndex(m => m.id === material.id);
  if (index !== -1) {
    setActiveMaterialIndex(index);
  }
  if (window.innerWidth < 1024) {
    setSidebarOpen(false);
  }
};
```

#### 1c. Update keyboard shortcut navigation

The `n`/`ArrowRight` and `p`/`ArrowLeft` keyboard shortcuts should respect the prerequisite lock:

```typescript
case 'n':
case 'arrowright':
  e.preventDefault();
  if (activeMaterialIndex < materials.length - 1) {
    const nextIndex = activeMaterialIndex + 1;
    const nextMaterial = materials[nextIndex];
    if (isMaterialAccessible(nextMaterial.id)) {
      setActiveMaterialIndex(nextIndex);
    } else {
      toast.warning('Complete the current lesson first.');
    }
  }
  break;

case 'p':
case 'arrowleft':
  e.preventDefault();
  if (activeMaterialIndex > 0) {
    setActiveMaterialIndex(prev => prev - 1);
  }
  break;
```

Note: Going backward (`p`/`ArrowLeft`) should always be allowed — the user can revisit completed materials freely.

### Implementation — `SyllabusSidebar.tsx`

#### 1d. Differentiate lock states visually

Change the icon logic to distinguish prerequisite-locked from payment-locked:

```typescript
// In the material button rendering
const isPaymentLocked = isModuleLocked(module.id);
const isPrereqLocked = !isPaymentLocked && !isCompleted && !isActive && !isMaterialAccessible(material.id);
const showLock = isPaymentLocked || isPrereqLocked;

// Icon rendering:
{isCompleted ? (
  // Green check circle (existing)
) : isActive ? (
  // Blue play circle (existing)
) : isPaymentLocked ? (
  // Lock with amber "payment required" treatment
) : isPrereqLocked ? (
  // Lock with muted "locked" treatment
) : (
  // Default (available but not started)
)}
```

You'll need to pass `isMaterialAccessible` as a prop to `SyllabusSidebar`, or derive it from `materials` + `completedMaterialIds`:

```typescript
interface SyllabusSidebarProps {
  // ... existing props
  materials: CourseMaterial[]; // flattened, ordered materials
  completedMaterialIds: number[];
}
```

Then inside the sidebar:
```typescript
const isPrereqLocked = (materialId: number): boolean => {
  const idx = materials.findIndex(m => m.id === materialId);
  if (idx <= 0) return false;
  const prev = materials[idx - 1];
  return !completedMaterialIds.includes(prev.id);
};
```

Disable clicking on prereq-locked materials:
```typescript
const handleMaterialClick = (material: CourseMaterial, moduleId: number) => {
  if (isModuleLocked(moduleId)) return;
  if (isPrereqLocked(material.id)) return; // NEW
  onMaterialSelect(material);
};
```

---

## 2. Replace Fake Progress / Attention Span with Actual Progress

### Current Behavior

`ContentStage.tsx` has:

| Feature | Implementation | Problem |
|---------|---------------|---------|
| **Attention Span** | `timeSpent` state; a `setInterval` increments it every 1s up to `REQUIRED_TIME = 300` (5 min). Gating: `timeSpent >= 300` | Completely fake — counts time regardless of interaction. If a user reads the material in 30 seconds they still wait 4:30. |
| **Reading Progress** | Based on scroll position within the content container. Gating: `scrollProgress >= 90%` | Semi-useful but shouldn't gate completion. Short content auto-satisfies this. |
| **Mark as Complete** | Only enabled when BOTH `timeSpent >= 300` AND `scrollProgress >= 90` (for non-video) | Forces users to wait 5 minutes and scroll to the bottom before they can mark complete. |

For video materials, `isReadyToComplete` is set to `true` immediately when `VideoPlayer.onReady` fires — no meaningful video watch tracking at all.

### Target Behavior

1. **Remove the "Attention Span" timer entirely.** It provides no real value and frustrates users.

2. **Keep "Reading Progress" as a visual indicator only** — show scroll progress so the user knows how far they've read, but **do not gate completion on it**.

3. **Simplify the completion flow**:
   - For **all material types**: the user can click "Mark as Complete" at any time.
   - When clicked, it calls `progressApi.markMaterialComplete(materialId)` (existing).
   - Confetti plays on click (keep this — it's good UX).
   - The button should show "Completed" (disabled) after success.
   - No artificial waiting. No fake timer.

4. **Tie displayed progress to actual API data**:
   - The `progressPercentage` already exists in `CoursePlayerPage` and is passed to `CoursePlayerShell`.
   - The `completedLessons` / `materials` ratio is already accurate.
   - Remove all fake progress displays from `ContentStage`'s completion area.

### Implementation — `ContentStage.tsx`

#### 2a. Remove state and effects for `timeSpent`

Delete:
- `const [timeSpent, setTimeSpent] = useState(0);`
- `const REQUIRED_TIME = 300;`
- `setTimeSpent(0)` in the `useEffect` that resets on material change
- The entire `setInterval` timer `useEffect` (lines 128-137)
- The `useEffect` that gates `isReadyToComplete` on time+scroll (lines 120-126)

#### 2b. Simplify `isReadyToComplete`

After removing the time/scroll gating, materials should be completable immediately (the user chooses when). The simplest approach:

```typescript
// Remove isReadyToComplete state entirely, or always set it true
// When the user views a material, they can mark it complete whenever they want
```

Keep `scrollProgress` and its `useEffect` — it's useful as a visual reading progress indicator. But don't use it to gate completion.

#### 2c. Update the completion-area UI

Replace the current bottom section (lines 412-488) with:

```tsx
{activeTab === 'content' && (
  <div className="mt-auto py-10 flex flex-col items-center gap-4 border-t border-border">
    <div className="flex flex-col items-center gap-3 mb-4 w-full max-w-xs">
      {material.type !== 'video' && (
        <>
          <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-text-muted">
            <span>Reading Progress</span>
            <span>{Math.round(scrollProgress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
        </>
      )}
    </div>

    <motion.button
      whileHover={!isCompleted ? { translateY: -2, scale: 1.02 } : {}}
      whileTap={!isCompleted ? { translateY: 0, scale: 0.98 } : {}}
      onClick={handleCompleteClick}
      disabled={isCompleted}
      className={`
        px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3
        ${isCompleted
          ? 'bg-emerald-100 text-emerald-600 cursor-default border border-emerald-200'
          : 'bg-emerald-500 text-white shadow-[0_4px_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none'
        }
      `}
    >
      {isCompleted ? (
        <>
          <CheckCircle2 size={18} strokeWidth={3} />
          Completed
        </>
      ) : (
        'Mark as Complete'
      )}
    </motion.button>
  </div>
)}
```

Key changes:
- Removed "Attention Span" label, bar, and percentage
- Removed the scrolling/attention helper text (`"Scroll to the bottom to continue"`, `"Stay a bit longer to finish"`)
- Reading Progress is kept purely as information (no gating)
- The button is always clickable (not disabled unless already completed)
- No artificial waiting for `isReadyToComplete`

#### 2d. Update `handleCompleteClick`

Keep as-is — it already works:
```typescript
const handleCompleteClick = () => {
  if (isCompleted) return;
  confetti({ ... });
  onComplete();
};
```

No changes needed here.

#### 2e. Update material reset `useEffect`

Remove `isReadyToComplete` and `setTimeSpent` from the reset effect:

```typescript
useEffect(() => {
  if (!material) return;
  setScrollProgress(0);
  setActiveTab('content');
  setIsTabsExpanded(false);
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo(0, 0);
  }
}, [material?.id]);
```

---

## 3. Consistency: Use `courseProgress` from API

### Current Behavior

The header progress bar in `CoursePlayerShell` receives `progressPercentage` which is computed in `CoursePlayerPage` from the API:

```typescript
const progressPercentage = useMemo(() => {
  if (courseProgress?.progress_percentage !== undefined) {
    return Math.round(courseProgress.progress_percentage);
  }
  if (materials.length > 0) {
    return Math.round((completedLessons.length / materials.length) * 100);
  }
  return 0;
}, [completedLessons.length, courseProgress?.progress_percentage, materials.length]);
```

This is already correct — it prefers the API value and falls back to a local calculation. No changes needed, but ensure this is the ONLY source of truth for progress display.

### What NOT to do

- Do NOT add any new local-only progress calculations.
- Do NOT add any timer-based or scroll-based progress estimation.
- Any progress shown to the user should come from `completedLessons` (which syncs with the API via `refreshEnrolledState`) or `courseProgress.progress_percentage`.

---

## 4. Files to Modify

| File | Changes |
|------|---------|
| `src/apps/dashboard/pages/CoursePlayerPage.tsx` | Add `isMaterialAccessible`, update `handleMaterialSelect`, update keyboard shortcuts |
| `src/apps/dashboard/components/SyllabusSidebar.tsx` | Accept `materials` + `completedMaterialIds` props, compute `isPrereqLocked`, disable clicks, differentiate lock icons |
| `src/apps/dashboard/components/ContentStage.tsx` | Remove `timeSpent`, `REQUIRED_TIME`, timer effect, gating logic; simplify completion UI; keep scroll-progress as visual only |
| `src/apps/dashboard/components/CoursePlayerShell.tsx` | No changes needed (already receives correct `progress`) |

---

## 5. Prerequisite vs Payment Lock — Visual Distinction

| State | Icon | Color | Click Behavior |
|-------|------|-------|---------------|
| Completed | `CheckCircle2` | Green | Navigate (review) |
| Active | `Circle` (filled) | Indigo | — |
| Available (not started) | *none* (or unlocked icon) | Default | Navigate |
| Payment-locked | `TriangleAlert` or `Lock` | Amber | Blocked — "Payment Required" toast |
| Prerequisite-locked | `Lock` | Slate/Muted | Blocked — "Complete previous lesson" toast |

---

## 6. Edge Cases

1. **First material in course** — Always accessible (no prerequisite).
2. **First material in a module** — The prerequisite is the last material of the previous module (because `flattenMaterials` produces one flat ordered list). This is intentional — modules should be completed sequentially too.
3. **Free course / fully paid** — Payment lock does not apply. Prerequisite lock still applies.
4. **Re-visiting completed material** — Always allowed (going backward).
5. **Quiz materials** — Quizzes are gated by the module's materials. The quiz button in the sidebar should only appear after all module materials are completed.
6. **Refreshing the page** — Progress is persisted server-side. On reload, `refreshEnrolledState()` fetches up-to-date `completedLessons` and `courseProgress`.
7. **Video materials** — No video watch-time tracking exists yet. The "Mark as Complete" button is available immediately (user decision). Video watch-time enforcement can be added later when the backend supports it.

---

## 7. Testing Checklist

- [ ] Open a course with 3+ materials. Only the first material is clickable in the sidebar.
- [ ] After marking the first material as complete, the second material becomes clickable.
- [ ] Attempting to click a locked material shows toast: "Complete the previous lesson first."
- [ ] Payment-locked modules still show the amber warning and block access.
- [ ] The "Attention Span" timer and bar are completely gone.
- [ ] The "Mark as Complete" button is always clickable (not disabled waiting for fake timers).
- [ ] Clicking "Mark as Complete" triggers confetti and API call.
- [ ] After completion, the button shows "Completed" (disabled) with green styling.
- [ ] The header progress bar accurately reflects completed/total materials.
- [ ] Reading Progress bar still shows scroll percentage but does not block completion.
- [ ] Keyboard shortcuts (`n`, `p`, arrows) respect prerequisite locks.
- [ ] Refreshing the page restores correct state from API.
