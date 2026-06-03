# Module Locking Based on Payment — Implementation Guide

## 1. Overview

This document describes how to implement module-level locking based on a user's payment status (installment plan, balance remaining, etc.) across the frontend application.

The system supports:
- **Installment plans**: 20% (NYSC), 40%, 60%, FULL
- **Progressive module release**: Modules are locked/unlocked based on `% paid`
- **Balance payment**: Paying the remaining balance unlocks all modules
- **Academic progression**: Quiz pass (≥60%) required to unlock next module

---

## 2. Backend API (Already Implemented)

### 2.1 Module Access Status

**Endpoint**: `GET /api/enrollments/{enrollmentId}/module-access/`

Returns per-module lock status based on payment percentage.

**Response**:
```json
{
  "enrollment_id": 13,
  "total_paid_percentage": 40,
  "total_amount": "10000.00",
  "amount_paid": "4000.00",
  "balance_remaining": "6000.00",
  "modules": [
    { "id": 1, "title": "Module 1", "is_locked": false, "access_threshold": 0 },
    { "id": 2, "title": "Module 2", "is_locked": false, "access_threshold": 40 },
    { "id": 3, "title": "Module 3", "is_locked": true, "access_threshold": 60 },
    { "id": 4, "title": "Module 4", "is_locked": true, "access_threshold": 100 }
  ]
}
```

**Frontend API wrapper** (already exists in `src/api/courses.ts:756`):
```typescript
coursesApi.getModuleAccessStatus(enrollmentId: number)
```

### 2.2 Module Listing (Backend-Enforced)

**Endpoint**: `GET /api/courses/{courseId}/modules/`

The backend already enforces payment-based filtering:
- If user is on a partial installment plan (e.g. 40%), **only that percentage of modules are returned**
- Subsequent modules are only returned if the previous module's quiz was passed (≥60%)
- This means `accessibleModules` returned by this API already respects payment status

### 2.3 Enrollments List

**Endpoint**: `GET /api/enrollments/`

Returns enrollment data including:
- `installment_plan`: `"FULL" | "20" | "40" | "60"`
- `amount_paid`: Amount paid so far
- `balance_remaining`: Outstanding balance
- `is_completed`: Payment completion status
- `is_course_completed`: Academic completion status
- `progress_percentage`: Overall academic progress

---

## 3. Current Frontend State

### 3.1 Where Module Locking IS Working

| Page | File | Locking |
|------|------|---------|
| Enrollment Detail Page | `EnrollmentDetailPage.tsx` | ✅ Properly uses `moduleAccess` to show locked/unlocked modules with payment threshold message |
| Course Cards | `CoursesPage.tsx` | ✅ Shows balance remaining with Pay button, or "Fully Paid" badge |

### 3.2 Where Module Locking IS NOT Working

| Page | File | Issue |
|------|------|-------|
| Course Player Page | `CoursePlayerPage.tsx` | ❌ Does NOT fetch `moduleAccessStatus`. Uses only `coursesApi.getModules()` which backend already filters, but no UI indication of which modules are payment-locked |
| Syllabus Sidebar | `SyllabusSidebar.tsx` | ❌ Shows `Lock` icon on ALL incomplete materials, not distinguishing payment-locked vs progress-locked. No `moduleAccess` prop accepted |
| All Courses Page | `AllCoursesPage.tsx` | ❌ Shows course cards but lacks enrollment/payment status display when user is already enrolled |

---

## 4. Implementation Plan

### Step 1: Add `moduleAccess` support to SyllabusSidebar

**File**: `components/dashboard/SyllabusSidebar.tsx`

**Changes**:
1. Add new prop `moduleAccess` (array of `{ module_id: number; is_locked: boolean }`)
2. Add new prop `userEnrollment` (optional enrollment data)
3. When rendering module materials, check `moduleAccess` to determine if the module is payment-locked
4. Show a payment-locked badge/message for modules that are locked due to payment (vs academic progression)
5. Disable clicking on materials within payment-locked modules

**New interface**:
```typescript
interface ModuleAccessItem {
  module_id: number;
  is_locked: boolean;
  access_threshold?: number;
}

interface SyllabusSidebarProps {
  modules: CourseModule[];
  currentMaterialId: number;
  completedMaterialIds: number[];
  onMaterialSelect: (material: CourseMaterial) => void;
  isOpen: boolean;
  onClose?: () => void;
  quizResults?: QuizResult[];
  // NEW:
  moduleAccess?: ModuleAccessItem[];
  enrollment?: {
    installment_plan: string;
    amount_paid: string;
    balance_remaining: string;
  } | null;
}
```

**Material click guard**:
```typescript
const isModuleLocked = (moduleId: number): boolean => {
  if (!moduleAccess) return false;
  const access = moduleAccess.find(m => m.module_id === moduleId);
  return access?.is_locked ?? false;
};
```

**UI for payment-locked modules**:
```typescript
{isModuleLocked(module.id) ? (
  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50">
    <div className="flex items-center gap-2 text-amber-700">
      <Lock size={14} />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        Payment Required — Pay balance to unlock
      </span>
    </div>
  </div>
) : (
  // existing material items
)}
```

### Step 2: Fetch `moduleAccessStatus` in CoursePlayerPage

**File**: `pages/dashboard/pages/CoursePlayerPage.tsx`

**Changes**:
1. Add state: `const [moduleAccess, setModuleAccess] = useState<any>(null);`
2. In `checkEnrollment()` or `refreshEnrolledState()`, after confirming user is enrolled, fetch module access:

```typescript
// In checkEnrollment(), after setting enrollment:
if (userEnrollment) {
  setIsEnrolled(true);
  setEnrollment(userEnrollment as EnrollmentListItem);
  
  // Fetch module access status for payment-based locking
  try {
    const accessData = await coursesApi.getModuleAccessStatus(userEnrollment.id);
    setModuleAccess(accessData);
  } catch (e) {
    console.error('Failed to fetch module access:', e);
  }
  
  await refreshEnrolledState();
}
```

3. Pass moduleAccess to SyllabusSidebar:

```typescript
<SyllabusSidebar
  modules={isEnrolled ? accessibleModules : (course.modules || [])}
  currentMaterialId={currentMaterial?.id ?? 0}
  completedMaterialIds={completedLessons}
  onMaterialSelect={handleMaterialSelect}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  quizResults={quizResults}
  // NEW:
  moduleAccess={moduleAccess?.modules}
  enrollment={enrollment}
/>
```

4. Show payment banner when user has balance remaining:

```typescript
// In the enrolled view area, above the ContentStage/SyllabusSidebar:
{enrollment && Number(enrollment.balance_remaining || 0) > 0 && (
  <div className="mb-4 mx-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
          Outstanding Balance
        </p>
        <p className="text-sm font-bold text-amber-800">
          {formatNaira(enrollment.balance_remaining)}
        </p>
      </div>
      <Button
        size="sm"
        onClick={handlePayBalance}
        className="bg-amber-600 hover:bg-amber-700 text-white"
      >
        Pay Now
      </Button>
    </div>
  </div>
)}
```

### Step 3: Prevent navigation to locked materials

**File**: `pages/dashboard/pages/CoursePlayerPage.tsx`

In `handleMaterialSelect`:

```typescript
const handleMaterialSelect = (material: CourseMaterial) => {
  // Check if the parent module is payment-locked
  const parentModule = accessibleModules.find(m =>
    m.materials?.some(mat => mat.id === material.id)
  );
  
  if (parentModule && moduleAccess) {
    const access = moduleAccess.modules.find(
      (m: any) => m.id === parentModule.id
    );
    if (access?.is_locked) {
      toast.warning(
        'This module requires additional payment. Please clear your balance.'
      );
      return;
    }
  }
  
  const index = materials.findIndex(m => m.id === material.id);
  if (index !== -1) {
    setActiveMaterialIndex(index);
  }
  // ...
};
```

### Step 4: Add enrollment status to AllCoursesPage

**File**: `pages/dashboard/pages/AllCoursesPage.tsx`

If a user is already enrolled, show:
- "Enrolled" badge with installment plan info
- Balance remaining
- "Continue" button instead of "Enroll"

```typescript
// After fetching courses, fetch enrollments:
const enrollments = await coursesApi.getEnrollments();
const enrollmentMap = new Map(
  enrollments.results.map((e: any) => {
    const courseId = typeof e.course === 'number' ? e.course : e.course?.id;
    return [courseId, e];
  })
);

// In the course card rendering:
{enrollmentMap.has(course.id) ? (
  <div>
    <Badge variant="success">Enrolled</Badge>
    {Number(enrollmentMap.get(course.id).balance_remaining || 0) > 0 && (
      <p className="text-[10px] text-amber-600 font-bold">
        {formatNaira(enrollmentMap.get(course.id).balance_remaining)} remaining
      </p>
    )}
    <Button asChild size="sm">
      <Link to={`/dashboard/course/${course.id}`}>Continue</Link>
    </Button>
  </div>
) : (
  <Button onClick={() => handleEnroll(course.id)}>Enroll</Button>
)}
```

### Step 5: Installment selection UI at enrollment time (Optional Enhancement)

**File**: `pages/dashboard/pages/CoursePlayerPage.tsx` (UnenrolledView)

If the course has `allow_installments: true` and `total_amount > 0`, show installment plan options:

```typescript
{Number(course.total_amount || 0) > 0 && (
  <div className="space-y-2">
    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
      Payment Plan
    </p>
    <div className="flex gap-2">
      {[{ value: 'FULL', label: 'Full Payment', desc: '100% access' },
        { value: '60', label: '60%', desc: '60% modules unlocked' },
        { value: '40', label: '40%', desc: '40% modules unlocked' },
      ].map((plan) => (
        <button
          key={plan.value}
          onClick={() => setInstallmentPlan(plan.value)}
          className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
            installmentPlan === plan.value
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-text-muted border-border hover:border-primary/30'
          }`}
        >
          {plan.label}
        </button>
      ))}
    </div>
  </div>
)}
```

---

## 5. API Dependency Summary

| Endpoint | Required | Already on Frontend |
|----------|----------|-------------------|
| `GET /api/enrollments/{id}/module-access/` | ✅ For lock UI | `coursesApi.getModuleAccessStatus()` exists at `src/api/courses.ts:756` |
| `GET /api/enrollments/{id}/payment-breakdown/` | ✅ For payment details | `coursesApi.getPaymentBreakdown()` exists at `src/api/courses.ts:776` |
| `POST /api/enrollments/{id}/pay-balance/` | ✅ For paying balance | `coursesApi.payBalance()` exists at `src/api/courses.ts:689` |
| `GET /api/enrollments/` | ✅ For enrollment list | `coursesApi.getEnrollments()` exists at `src/api/courses.ts:625` |
| `POST /api/enroll/` | ✅ For enrollment with installment | `coursesApi.enroll()` exists at `src/api/courses.ts:663` |
| `GET /api/courses/{id}/modules/` | ✅ Backend-enforced filtering | `coursesApi.getModules()` exists |
| `GET /api/courses/{id}/progress/` | ✅ For completion progress | `coursesApi.getCourseProgress()` exists |

**All required API endpoints are already implemented on the backend and frontend.** The frontend only needs UI integration.

---

## 6. Locking Rules Summary

| Scenario | Behavior |
|----------|----------|
| Free course (`total_amount = 0`) | All modules unlocked immediately |
| Full payment | All modules unlocked immediately |
| Installment 60% | First 60% of modules unlocked, rest locked |
| Installment 40% | First 40% of modules unlocked, rest locked |
| Installment 20% (NYSC) | First 20% of modules unlocked, rest locked |
| Balance paid later | Remaining modules unlocked progressively |
| Module quiz not passed (score < 60%) | Next module locked (academic progression) |
| Module quiz passed (score ≥ 60%) | Next module unlocked (academic progression) |

The backend enforces the **payment % based on module count** (e.g., 4 modules × 40% = unlocks first 2 modules) and also enforces the **quiz progression lock** on the modules endpoint.

---

## 7. Implementation Priority Order

1. **SyllabusSidebar** — Accept `moduleAccess` prop, show payment-locked state with proper message, disable click on locked materials
2. **CoursePlayerPage** — Fetch `moduleAccessStatus` on enrollment check, pass to sidebar, add payment banner
3. **AllCoursesPage** — Show enrollment status with balance remaining per course card
4. **Installment selector** — Optional enhancement for enrollment UX
