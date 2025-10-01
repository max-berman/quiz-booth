# Timer Logic Review - Game Page

## Current Implementation Analysis

### ✅ Working Correctly:

1. **Timer starts at 30 seconds** for each new question
2. **Interval-based saving** at 25, 20, 15, 10, and 5 seconds is implemented
3. **Timer state clearing** when moving to next question works
4. **Local storage persistence** is properly implemented

### ❌ Identified Discrepancies:

## Issue 1: Resume Logic Race Condition

**Problem**: The timer resume logic has a race condition between:

- `useEffect` that loads saved timer state when session is loaded
- `useEffect` that resets timer for new questions

**Current Code**:

```typescript
// Load saved timer state when session is loaded
useEffect(() => {
	if (isSessionLoaded && sessionState?.currentQuestionTimeLeft !== undefined) {
		setTimeLeft(sessionState.currentQuestionTimeLeft)
	}
}, [isSessionLoaded, sessionState?.currentQuestionTimeLeft])

// Reset timer for new question
useEffect(() => {
	if (isInitialLoad) {
		setIsInitialLoad(false)
		return
	}
	setTimeLeft(QUESTION_TIMER_DURATION) // This overrides the loaded state!
}, [currentQuestionIndex, isInitialLoad, QUESTION_TIMER_DURATION])
```

**Impact**: The "reset timer" effect runs after the "load saved state" effect, overriding the loaded timer value.

## Issue 2: Missing Initial Load Logic

**Problem**: The `isInitialLoad` state logic is incomplete. It only prevents the timer reset on initial load but doesn't ensure the saved timer state is properly loaded.

## Issue 3: Timer State Not Saved on Page Refresh

**Problem**: The timer continues counting down but the current time is not immediately saved when the page refreshes. Only the interval-based saves (25, 20, 15, 10, 5) are captured.

## Recommended Fixes

### Fix 1: Restructure Timer Initialization

```typescript
// Replace current timer initialization logic with:
useEffect(() => {
	if (isSessionLoaded) {
		if (sessionState?.currentQuestionTimeLeft !== undefined) {
			// Resume from saved state
			setTimeLeft(sessionState.currentQuestionTimeLeft)
		} else {
			// Start new question with full timer
			setTimeLeft(QUESTION_TIMER_DURATION)
		}
	}
}, [
	isSessionLoaded,
	sessionState?.currentQuestionTimeLeft,
	QUESTION_TIMER_DURATION,
])
```

### Fix 2: Remove Conflicting Reset Logic

Remove or modify the conflicting timer reset effect that currently overrides the loaded state.

### Fix 3: Add Immediate Save on Page Unload

```typescript
// Save current timer state when page is about to unload
useEffect(() => {
	const handleBeforeUnload = () => {
		if (!isAnswered && timeLeft > 0) {
			updateSessionState({
				currentQuestionTimeLeft: timeLeft,
			})
		}
	}

	window.addEventListener('beforeunload', handleBeforeUnload)
	return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [timeLeft, isAnswered, updateSessionState])
```

### Fix 4: Improve Interval Saving Logic

Consider adding more frequent saves or using a debounced approach to ensure timer state is captured more reliably.

## Expected Behavior After Fixes

1. **Page Refresh**: Timer resumes from exact saved time (not just interval points)
2. **New Questions**: Timer starts fresh at 30 seconds
3. **Interval Saving**: Continues to save at 25, 20, 15, 10, 5 seconds
4. **State Clearing**: Properly clears when moving to next question
