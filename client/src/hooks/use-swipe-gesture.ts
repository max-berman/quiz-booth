import { useRef, useCallback, useEffect } from 'react'

interface SwipeOptions {
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  threshold?: number // minimum distance in pixels
  preventDefault?: boolean
}

interface SwipeState {
  startX: number
  startY: number
  isSwiping: boolean
}

/**
 * Custom hook for detecting swipe gestures on mobile devices
 * @param ref - React ref to the element to attach swipe listeners to
 * @param options - Configuration options for swipe detection
 */
export function useSwipeGesture(
  ref: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
) {
  const {
    onSwipeRight,
    onSwipeLeft,
    threshold = 50,
    preventDefault = true,
  } = options

  const swipeState = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    isSwiping: false,
  })

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: true,
    }

    if (preventDefault) {
      event.preventDefault()
    }
  }, [preventDefault])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!swipeState.current.isSwiping) return

    if (preventDefault) {
      event.preventDefault()
    }
  }, [preventDefault])

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

    swipeState.current.isSwiping = false

    if (preventDefault) {
      event.preventDefault()
    }
  }, [onSwipeRight, onSwipeLeft, threshold, preventDefault])

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
}
