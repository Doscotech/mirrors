# Onboarding System Explanation

**Date**: October 4, 2025  
**Purpose**: User onboarding flow after trial/subscription activation

---

## Overview

The onboarding system is a **post-subscription guided tour** that helps new users (who just activated a trial or paid subscription) set up their AI workforce. It's a multi-step wizard that appears automatically when specific conditions are met.

### When You See This Log

```
Onboarding Provider - Checking trigger conditions: 
Object { 
  trialStarted: false, 
  subscriptionSuccess: false, 
  subscription: {…}, 
  shouldTrigger: false 
}
```

This means the `OnboardingProvider` is evaluating whether to show the onboarding wizard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Onboarding Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Action (Trial/Subscribe)                              │
│           ↓                                                  │
│  Redirect with URL params: ?trial=started or               │
│                            ?subscription=success            │
│           ↓                                                  │
│  OnboardingProvider (in layout-content.tsx)                │
│  ├─ Checks URL params                                       │
│  ├─ Checks subscription status                             │
│  ├─ Calls shouldTriggerOnboarding()                        │
│  └─ Decides: Show wizard or not                            │
│           ↓                                                  │
│  IF shouldTrigger = true:                                   │
│  └─ Opens NewOnboardingPage modal                          │
│      ├─ Step 1: CEO Intro                                  │
│      ├─ Step 2: User Type (Individual/Company)             │
│      ├─ Step 3: Workforce Selection                        │
│      ├─ Step 4: Agent Configuration                        │
│      └─ Step 5: Completion                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. OnboardingProvider (`onboarding-provider.tsx`)

**Purpose**: Wrapper component that monitors subscription status and triggers onboarding

**Location**: Wraps the entire dashboard layout in `layout-content.tsx`

**Key Logic**:
```tsx
useEffect(() => {
  if (!subscription || !user) return;

  const trialStarted = searchParams?.get('trial') === 'started';
  const subscriptionSuccess = searchParams?.get('subscription') === 'success';
  
  // Check if onboarding should trigger
  if ((trialStarted || subscriptionSuccess) && shouldTriggerOnboarding(subscription)) {
    triggerPostSubscriptionOnboarding();
    startOnboarding(onboardingSteps);
  }
}, [subscription, user, searchParams]);
```

**What it does**:
1. ✅ Listens for URL parameters (`?trial=started` or `?subscription=success`)
2. ✅ Checks subscription data from API
3. ✅ Evaluates trigger conditions
4. ✅ Opens onboarding modal if conditions met
5. ✅ Cleans up URL params after completion

---

### 2. Trigger Conditions (`shouldTriggerOnboarding`)

**File**: `hooks/use-onboarding.ts` (lines 154-172)

**Logic**:
```typescript
shouldTriggerOnboarding(subscriptionData) {
  // 1️⃣ Don't trigger if already completed
  if (hasCompletedOnboarding || hasTriggeredPostSubscription) {
    return false;
  }
  
  // 2️⃣ Check for active subscription
  const hasActiveSubscription = 
    subscription?.status === 'active' &&
    !subscription.cancel_at_period_end;
  
  // 3️⃣ Check for active trial
  const hasActiveTrial = trial_status === 'active';
  
  // 4️⃣ Check for paid tier (not free/none)
  const hasActiveTier = 
    tier?.name !== 'none' && 
    tier?.name !== 'free';
  
  // 5️⃣ Trigger if: (paid subscription + tier) OR (trial + tier)
  return (hasActiveSubscription && hasActiveTier) || 
         (hasActiveTrial && hasActiveTier);
}
```

---

## Your Current State Analysis

### The Log Output

```javascript
{
  trialStarted: false,        // URL doesn't have ?trial=started
  subscriptionSuccess: false, // URL doesn't have ?subscription=success
  subscription: {…},          // Subscription data loaded from API
  shouldTrigger: false        // Onboarding won't show
}
```

### Why `shouldTrigger: false`?

There are **5 possible reasons**:

#### ❌ Reason 1: No URL Parameter
```
trialStarted: false
subscriptionSuccess: false
```
**Meaning**: You didn't just complete a trial signup or subscription purchase. The URL doesn't have the trigger query param.

**Expected URL after trial**: `http://localhost:3000/dashboard?trial=started`  
**Expected URL after subscribe**: `http://localhost:3000/dashboard?subscription=success`

---

#### ❌ Reason 2: Already Completed Onboarding
```typescript
hasCompletedOnboarding: true  // Stored in localStorage
```
**Meaning**: You've already gone through onboarding once. It won't show again.

**Check**: Open DevTools → Application → Local Storage → Look for key `onboarding-storage-v1`

---

#### ❌ Reason 3: Already Triggered Once
```typescript
hasTriggeredPostSubscription: true  // Stored in localStorage
```
**Meaning**: Onboarding was already triggered for this subscription. It only shows once per subscription event.

---

#### ❌ Reason 4: No Active Subscription/Trial
```typescript
subscription: {
  subscription: { status: 'canceled' },  // Not 'active'
  trial_status: 'expired',               // Not 'active'
}
```
**Meaning**: Your subscription is inactive or trial has ended.

---

#### ❌ Reason 5: Free/None Tier
```typescript
subscription: {
  tier: { name: 'none' }  // Or 'free'
}
```
**Meaning**: You're on the free tier. Onboarding only triggers for paid users.

---

## Onboarding Steps Configuration

**File**: `components/onboarding/onboarding-config.tsx`

### The Journey (5 Steps)

```tsx
1. CEO Intro
   ├─ Title: "Welcome"
   ├─ Can Skip: No
   ├─ Component: <CEOIntroStep />
   └─ Action: "Get Started"

2. User Type Selection
   ├─ Title: "Getting Started"
   ├─ Can Skip: No
   ├─ Component: <UserTypeStep />
   ├─ Choice: Individual or Company
   └─ Action: "Continue"

3. Workforce Selection
   ├─ Title: "Choose Agents"
   ├─ Can Skip: Yes ✅
   ├─ Component: <WorkforceSelectionStep />
   ├─ Purpose: Pick pre-built AI agents
   └─ Action: "Configure Agents"

4. Agent Configuration
   ├─ Title: "Configure Agents"
   ├─ Can Skip: Yes ✅
   ├─ Component: <MultiAgentConfigurationStep />
   ├─ Purpose: Customize selected agents
   └─ Action: "Continue Setup"

5. Completion
   ├─ Title: "Complete"
   ├─ Can Skip: No
   ├─ Component: <CompletionStep />
   ├─ Purpose: Celebrate & finish
   └─ Action: "Start Working"
```

---

## State Management (Zustand)

**File**: `hooks/use-onboarding.ts`

### Persisted State (localStorage)

```typescript
{
  hasCompletedOnboarding: boolean,        // User finished onboarding
  hasTriggeredPostSubscription: boolean,  // Triggered once for subscription
  userTypeData: {                         // User's choice from step 2
    userType?: 'individual' | 'company',
    role?: string,
    selectedAt?: number
  }
}
```

### Transient State (memory only)

```typescript
{
  isOpen: boolean,           // Modal open/closed
  currentStep: number,       // Current step index (0-4)
  steps: OnboardingStep[]   // Array of step configurations
}
```

---

## How to Manually Trigger Onboarding

### Method 1: Add URL Parameter
```bash
# Navigate to:
http://localhost:3000/dashboard?trial=started

# Or:
http://localhost:3000/dashboard?subscription=success
```

### Method 2: Clear localStorage
```javascript
// In browser DevTools Console:
localStorage.removeItem('onboarding-storage-v1');
location.reload();
```

Then visit the URL with the param.

### Method 3: Use the Hook Directly
```typescript
// In any React component:
import { useOnboarding } from '@/hooks/use-onboarding';
import { onboardingSteps } from '@/components/onboarding/onboarding-config';

function MyComponent() {
  const { startOnboarding } = useOnboarding();
  
  const handleClick = () => {
    startOnboarding(onboardingSteps);
  };
  
  return <button onClick={handleClick}>Start Onboarding</button>;
}
```

---

## Debugging Your Current State

### Step 1: Check URL
```bash
# Open DevTools → Network → Look at current URL
# Should see: ?trial=started or ?subscription=success
```

### Step 2: Check localStorage
```javascript
// DevTools → Console
JSON.parse(localStorage.getItem('onboarding-storage-v1'))

// Output should be:
{
  state: {
    hasCompletedOnboarding: false,      // Should be false to trigger
    hasTriggeredPostSubscription: false, // Should be false to trigger
    userTypeData: {}
  },
  version: 0
}
```

### Step 3: Check Subscription API Response
```javascript
// Look in DevTools → Network → Find GET /api/billing/subscription
// Response should have:
{
  subscription: { status: "active", ... },
  trial_status: "active",
  tier: { name: "tier_2_20", ... }  // Not "none" or "free"
}
```

### Step 4: Force Trigger (Dev Mode)
```javascript
// DevTools → Console
localStorage.removeItem('onboarding-storage-v1');
window.location.href = '/dashboard?trial=started';
```

---

## Expected Flow After Trial Activation

### Normal User Journey

```
1. User visits /pricing page
   ↓
2. Clicks "Start 7-Day Free Trial"
   ↓
3. POST /api/billing/trial/start-without-payment
   ↓
4. Backend creates trial subscription
   ↓
5. Frontend redirects to: /dashboard?trial=started
   ↓
6. OnboardingProvider detects:
   - trialStarted = true ✅
   - subscription.trial_status = "active" ✅
   - subscription.tier.name = "tier_2_20" ✅
   - hasCompletedOnboarding = false ✅
   - shouldTrigger = TRUE ✅
   ↓
7. Onboarding modal opens automatically
   ↓
8. User completes 5 steps
   ↓
9. OnboardingProvider sets:
   - hasCompletedOnboarding = true
   - hasTriggeredPostSubscription = true
   ↓
10. URL cleaned: /dashboard (params removed)
```

---

## Common Issues

### Issue 1: Onboarding Not Showing After Trial

**Symptoms**: 
- `trialStarted: true` but `shouldTrigger: false`

**Causes**:
1. ✅ localStorage already has `hasCompletedOnboarding: true`
2. ✅ Subscription API returning `tier.name: "none"`
3. ✅ Trial not actually active (`trial_status !== "active"`)

**Fix**:
```javascript
// Clear state and retry
localStorage.removeItem('onboarding-storage-v1');
location.reload();
```

---

### Issue 2: Onboarding Showing Every Page Load

**Symptoms**:
- Modal keeps appearing even after completion

**Cause**: State not being persisted (Zustand persist middleware failing)

**Fix**:
```javascript
// Check if state is saving:
const state = JSON.parse(localStorage.getItem('onboarding-storage-v1'));
console.log('Persisted state:', state);

// Should update after completing onboarding
```

---

### Issue 3: Can't Skip Steps That Should Be Skippable

**Symptoms**:
- Skip button not showing on steps 3-4

**Cause**: `canSkip` property in config is false

**Fix**: Check `onboarding-config.tsx`:
```tsx
{
  id: 'workforce-selection',
  canSkip: true,  // ✅ Should be true
  ...
}
```

---

## Integration Points

### 1. Trial Activation Endpoint
**File**: `backend/billing/trial_service.py`
```python
# After successful trial creation, frontend redirects:
return redirect('/dashboard?trial=started')
```

### 2. Subscription Success Handler
**File**: `frontend/src/app/(dashboard)/settings/billing/page.tsx`
```typescript
// After Stripe checkout success:
router.push('/dashboard?subscription=success');
```

### 3. Layout Integration
**File**: `frontend/src/components/dashboard/layout-content.tsx`
```tsx
<OnboardingProvider>
  {/* All dashboard content */}
  <DashboardContent />
</OnboardingProvider>
```

---

## Summary of Your Log

Your log shows:
```
trialStarted: false        → No ?trial=started in URL
subscriptionSuccess: false → No ?subscription=success in URL
shouldTrigger: false       → Onboarding won't show
```

**This is NORMAL if you**:
- Navigated directly to `/dashboard` (not from trial/subscription flow)
- Already completed onboarding previously
- Are on a free tier account

**This is UNEXPECTED if you**:
- Just clicked "Start Free Trial" and were redirected
- Just completed a subscription payment
- Expected to see the onboarding wizard

---

## Next Steps

To test the onboarding system:

1. **Clear Previous State**:
   ```javascript
   localStorage.removeItem('onboarding-storage-v1');
   ```

2. **Navigate with Trigger Param**:
   ```
   http://localhost:3000/dashboard?trial=started
   ```

3. **Verify Subscription Data**:
   - Check Network tab: `/api/billing/subscription`
   - Should have `trial_status: "active"` and `tier.name: "tier_2_20"`

4. **Watch Console**:
   - Should see: `✅ Triggering post-subscription onboarding`
   - Should see: `🎯 Starting onboarding with default steps`

5. **Modal Should Appear**:
   - Full-screen onboarding wizard
   - Step 1: CEO Welcome message

---

**Status**: Onboarding system is working as designed. Currently not triggering because conditions aren't met (no URL param + possibly already completed).

