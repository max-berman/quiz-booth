import { useRef, useCallback, useEffect, useState } from 'react'

interface SwipeOptions {
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  onSwipeStart?: () => void
  onSwipeMove?: (progress: number, direction: 'left' | 'right' | null) => void
  onSwipeEnd?: () => void
  threshold?: number // minimum distance in pixels
  preventDefault?: boolean
}

interface SwipeState {
  startX: number
  startY: number
  isSwiping: boolean
  currentX: number
  currentY: number
}

export interface SwipeProgress {
  isSwiping: boolean
  progress: number // 0-100
  direction: 'left' | 'right' | null
  distance: number
}

/**
 * Custom hook for detecting swipe gestures on mobile devices with real-time progress tracking
 * @param ref - React ref to the element to attach swipe listeners to
 * @param options - Configuration options for swipe detection
 */
export function useSwipeGesture(
  ref: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
): SwipeProgress {
  const {
    onSwipeRight,
    onSwipeLeft,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    threshold = 50,
    preventDefault = true,
  } = options

  const [swipeProgress, setSwipeProgress] = useState<SwipeProgress>({
    isSwiping: false,
    progress: 0,
    direction: null,
    distance: 0,
  })

  const swipeState = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    isSwiping: false,
    currentX: 0,
    currentY: 0,
  })

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: true,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }

    setSwipeProgress({
      isSwiping: true,
      progress: 0,
      direction: null,
      distance: 0,
    })

    if (onSwipeStart) {
      onSwipeStart()
    }

    if (preventDefault) {
      event.preventDefault()
    }
  }, [onSwipeStart, preventDefault])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!swipeState.current.isSwiping) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - swipeState.current.startX
    const deltaY = touch.clientY - swipeState.current.startY

    // Only consider horizontal swipes (ignore vertical swipes)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const distance = Math.abs(deltaX)
      const progress = Math.min((distance / threshold) * 100, 100)
      const direction: 'left' | 'right' = deltaX > 0 ? 'right' : 'left'

      swipeState.current.currentX = touch.clientX
      swipeState.current.currentY = touch.clientY

      setSwipeProgress({
        isSwiping: true,
        progress,
        direction,
        distance,
      })

      if (onSwipeMove) {
        onSwipeMove(progress, direction)
      }
    }

    if (preventDefault) {
      event.preventDefault()
    }
  }, [threshold, onSwipeMove, preventDefault])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!swipeState.current.isSwiping) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - swipeState.current.startX
    const deltaY = touch.clientY - swipeState.current.startY

    // Only consider horizontal swipes (ignore vertical swipes)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Check if swipe distance meets threshold
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          // Swipe right detected
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          // Swipe left detected
          onSwipeLeft()
        }
      }
    }

    // Reset swipe state
    setSwipeProgress({
      isSwiping: false,
      progress: 0,
      direction: null,
      distance: 0,
    })

    if (onSwipeEnd) {
      onSwipeEnd()
    }

    swipeState.current.isSwiping = false

    if (preventDefault) {
      event.preventDefault()
    }
  }, [onSwipeRight, onSwipeLeft, onSwipeEnd, threshold, preventDefault])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })

    return () => {
      // Clean up event listeners
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault])

  return swipeProgress
}
