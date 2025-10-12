# QuizBooth Code Style Guide

## Overview

This document defines the coding standards and conventions for the QuizBooth project - an AI-powered trivia platform built with React, TypeScript, and Firebase.

## Table of Contents

- [TypeScript & JavaScript](#typescript--javascript)
- [React Components](#react-components)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Styling & Tailwind CSS](#styling--tailwind-css)
- [Imports & Exports](#imports--exports)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Documentation](#documentation)

## TypeScript & JavaScript

### TypeScript Configuration

- Use strict TypeScript mode (`"strict": true`)
- Enable ES modules (`"module": "ESNext"`)
- Use path aliases: `@/*` for client/src, `@shared/*` for shared

### Type Definitions

```typescript
// Use interfaces for object shapes
interface GamePlayCardProps {
	currentQuestion: Question | undefined
	currentQuestionIndex: number
	questions: Question[]
	selectedAnswer: number | null
	isAnswered: boolean
	showExplanation: boolean
	onAnswerSelect: (answerIndex: number) => void
	onNextQuestion: () => void
}

// Use type aliases for unions and complex types
type GameStatus = 'active' | 'completed' | 'archived'
```

### Function Declarations

```typescript
// Use arrow functions for components and callbacks
export const GamePlayCard = ({
	currentQuestion,
	onAnswerSelect,
}: GamePlayCardProps) => {
	// Component logic
}

// Use function declarations for utilities and helpers
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
```

### Variables and Constants

```typescript
// Use const for immutable values
const MAX_QUESTIONS = 10

// Use let for mutable values (rarely needed)
let temporaryState = ''

// Use descriptive names
const isMobile = useIsMobile()
const gameCardRef = useRef<HTMLDivElement>(null)
```

## React Components

### Component Structure

```typescript
import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Question } from '@shared/firebase-types'

interface ComponentProps {
  // Props definition
}

export function ComponentName({
  prop1,
  prop2,
}: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState('')
  const ref = useRef(null)

  // Helper functions
  const handleAction = () => {
    // Implementation
  }

  // Render logic
  return (
    // JSX
  )
}
```

### Hooks Usage

- Keep hooks at the top of components
- Use custom hooks for reusable logic
- Follow React hooks rules

### Event Handlers

```typescript
// Use descriptive names
const handleAnswerSelect = (answerIndex: number) => {
  onAnswerSelect(answerIndex)
}

// Use inline for simple handlers
<button onClick={() => setOpen(true)}>
```

## File Organization

### Directory Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   ├── contexts/      # React contexts
│   └── config/        # Configuration files
```

### File Naming

- Use PascalCase for components: `GamePlayCard.tsx`
- Use camelCase for utilities: `game-utils.ts`
- Use kebab-case for pages: `game-customization.tsx`

## Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const currentQuestionIndex = 0
const getButtonClasses = () => {}

// PascalCase for components and types
interface GamePlayCardProps {}
export function GamePlayCard() {}

// UPPER_CASE for constants
const API_ENDPOINT = '/api/games'
```

### Boolean Variables

```typescript
// Use prefixes: is, has, should, can
const isAnswered = true
const hasQuestions = false
const shouldShowHeader = true
const canEdit = false
```

## Styling & Tailwind CSS

### Tailwind Classes Organization

```typescript
// Group related classes and use logical ordering
className =
	'w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200'

// Layout -> Spacing -> Typography -> Colors -> Effects
className =
	'flex items-center gap-4 p-4 text-lg font-medium text-primary bg-background rounded-lg shadow-md'
```

### Responsive Design

```typescript
// Mobile-first approach with responsive modifiers
className = 'p-4 md:p-6 lg:p-8'
className = 'text-base md:text-lg lg:text-xl'
className = 'rounded-none md:rounded-2xl'
```

### Custom Utilities

```typescript
// Use the cn utility for conditional classes
className={cn(
  'base-classes',
  condition && 'conditional-class',
  isActive ? 'active-class' : 'inactive-class'
)}
```

## Imports & Exports

### Import Order

```typescript
// 1. External dependencies
import { useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// 2. Internal dependencies
import { useSwipeGesture } from '@/hooks/use-swipe-gesture'
import { useIsMobile } from '@/hooks/use-mobile'

// 3. Type imports
import type { Question } from '@shared/firebase-types'

// 4. Style imports (if any)
```

### Export Patterns

```typescript
// Named exports for components and utilities
export function GamePlayCard() {}
export const cn = () => {}

// Default exports for pages
export default GamePage

// Barrel exports for directories
// components/index.ts
export { GamePlayCard } from './game-play-card'
export { GameNavigationBar } from './game-navigation-bar'
```

## Error Handling

### React Error Boundaries

```typescript
// Use error boundaries for component-level errors
class ErrorBoundary extends Component {
	// Implementation
}
```

### Async Operations

```typescript
// Use try/catch for async operations
const fetchGameData = async (gameId: string) => {
	try {
		const response = await getGame(gameId)
		return response.data
	} catch (error) {
		console.error('Failed to fetch game:', error)
		throw new Error('Game not found')
	}
}
```

## Testing

### Test File Structure

```
__tests__/
├── components/
│   └── game-play-card.test.tsx
├── hooks/
│   └── use-game-session.test.ts
└── utils/
    └── game-utils.test.ts
```

### Test Naming

```typescript
describe('GamePlayCard', () => {
	it('should display question text', () => {
		// Test implementation
	})

	it('should call onAnswerSelect when answer is clicked', () => {
		// Test implementation
	})
})
```

## Documentation

### Component Documentation

```typescript
/**
 * GamePlayCard component displays a single quiz question with answer options
 *
 * @param currentQuestion - The current question object
 * @param currentQuestionIndex - Index of the current question
 * @param onAnswerSelect - Callback when user selects an answer
 * @param onNextQuestion - Callback to proceed to next question
 */
export function GamePlayCard({
	currentQuestion,
	currentQuestionIndex,
	onAnswerSelect,
	onNextQuestion,
}: GamePlayCardProps) {
	// Implementation
}
```

### Function Documentation

```typescript
/**
 * Combines class names using clsx and tailwind-merge
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}
```

## Code Formatting

### General Rules

- Use 2-space indentation
- Use single quotes for strings
- Use semicolons
- Maximum line length: 100 characters
- Trailing commas in multi-line objects and arrays

### JSX Formatting

```typescript
// Multi-line JSX with proper indentation
return (
	<Card
		ref={gameCardRef}
		className='game-card !my-8 bg-card animate-slide-up rounded-none md:rounded-2xl shadow-md border-0 md:border-1'
	>
		<CardContent className='p-0 pb-4 md:p-6'>{/* Content */}</CardContent>
	</Card>
)
```

## Best Practices

### Performance

- Use React.memo for expensive components
- Use useCallback for stable function references
- Use useMemo for expensive calculations
- Implement proper dependency arrays

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Support screen readers

### Security

- Validate user inputs
- Sanitize data before rendering
- Use HTTPS in production
- Implement proper authentication

---

_This style guide will be refined as the project evolves. Always prioritize consistency and readability._
