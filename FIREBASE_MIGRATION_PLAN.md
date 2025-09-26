# Quiz Booth Firebase Migration Plan

## Overview

Complete migration strategy to host the entire Quiz Booth application on Firebase platform, including backend, database, and hosting.

## Current Architecture Analysis

### Current Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Database**: Firebase (current) + PostgreSQL (new for usage tracking)
- **Authentication**: Firebase Auth
- **Hosting**: Multi-platform (needs consolidation)

### Target Firebase Architecture

- **Frontend**: Firebase Hosting
- **Backend**: Firebase Functions
- **Database**: Firestore (primary) + Firestore for usage tracking
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage

## Phase 1: Firebase Setup & Configuration

### 1.1 Firebase Project Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select services:
# - Hosting: Configure as single-page app
# - Functions: TypeScript, ESLint enabled
# - Firestore: Security rules setup
# - Storage: Security rules setup
```

### 1.2 Firebase Configuration Files

#### firebase.json

```json
{
	"hosting": {
		"public": "client/dist",
		"ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
		"rewrites": [
			{
				"source": "**",
				"destination": "/index.html"
			}
		],
		"headers": [
			{
				"source": "**",
				"headers": [
					{
						"key": "X-Frame-Options",
						"value": "DENY"
					},
					{
						"key": "X-Content-Type-Options",
						"value": "nosniff"
					}
				]
			}
		]
	},
	"functions": {
		"source": "firebase-functions",
		"runtime": "nodejs18"
	},
	"firestore": {
		"rules": "firestore.rules",
		"indexes": "firestore.indexes.json"
	}
}
```

#### .firebaserc

```json
{
	"projects": {
		"default": "quiz-booth-production"
	}
}
```

## Phase 2: Backend Migration to Firebase Functions

### 2.1 Functions Directory Structure

```
firebase-functions/
├── src/
│   ├── games/
│   │   ├── createGame.ts
│   │   ├── getGames.ts
│   │   ├── updateGame.ts
│   │   └── deleteGame.ts
│   ├── questions/
│   │   ├── generateQuestions.ts
│   │   ├── getQuestions.ts
│   │   └── updateQuestions.ts
│   ├── usage/
│   │   ├── trackUsage.ts
│   │   ├── getUsage.ts
│   │   └── resetUsage.ts
│   ├── auth/
│   │   └── userSetup.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 2.2 Express Route Conversion Examples

#### Current Express Route (server/routes.ts)

```typescript
// Game creation endpoint
app.post('/api/games', async (req, res) => {
	try {
		const { title, description, settings } = req.body
		const userId = req.user?.uid

		if (!userId) {
			return res.status(401).json({ error: 'Unauthorized' })
		}

		const game = await createGame(userId, { title, description, settings })
		res.json(game)
	} catch (error) {
		res.status(500).json({ error: error.message })
	}
})
```

#### Firebase Function Equivalent (firebase-functions/src/games/createGame.ts)

```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const createGame = functions.https.onCall(async (data, context) => {
	// Authentication check
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'User must be authenticated'
		)
	}

	const userId = context.auth.uid
	const { title, description, settings } = data

	try {
		// Usage tracking
		await trackUsage(userId, 'game_created')

		// Create game in Firestore
		const gameRef = await admin.firestore().collection('games').add({
			title,
			description,
			settings,
			userId,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			status: 'draft',
		})

		return {
			id: gameRef.id,
			title,
			description,
			settings,
			createdAt: new Date().toISOString(),
		}
	} catch (error) {
		throw new functions.https.HttpsError('internal', error.message)
	}
})
```

### 2.3 Usage Tracking Migration

#### Current PostgreSQL Usage Tracker (server/lib/usage-tracker.ts)

```typescript
// Convert to Firestore-based usage tracking
export class FirebaseUsageTracker {
	async recordEvent(
		userId: string,
		eventType: string,
		metadata?: any
	): Promise<void> {
		const db = admin.firestore()

		// Record event
		await db.collection('usageEvents').add({
			userId,
			eventType,
			metadata: metadata || {},
			timestamp: admin.firestore.FieldValue.serverTimestamp(),
			costUnits: 0, // For future billing
		})

		// Update counters
		const counterRef = db.collection('usageCounters').doc(userId)
		await counterRef.set(
			{
				[this.getCounterField(eventType)]:
					admin.firestore.FieldValue.increment(1),
				lastResetDate: new Date(),
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true }
		)

		// Check limits
		await this.checkBetaLimit(userId, eventType)
	}

	private getCounterField(eventType: string): string {
		const fieldMap: Record<string, string> = {
			game_created: 'currentPeriodGamesCreated',
			question_generated: 'currentPeriodQuestionsGenerated',
			ai_question_generated: 'currentPeriodAiQuestions',
			player_submission: 'currentPeriodPlayerSubmissions',
			analytics_viewed: 'currentPeriodAnalyticsViews',
			export_used: 'currentPeriodExports',
			custom_theme_applied: 'currentPeriodCustomThemes',
		}
		return fieldMap[eventType] || 'currentPeriodGamesCreated'
	}
}
```

## Phase 3: Database Schema Migration

### 3.1 Firestore Collections Structure

#### Games Collection

```typescript
// games/{gameId}
interface GameDocument {
	title: string
	description: string
	userId: string
	settings: {
		timerEnabled: boolean
		timerDuration: number
		shuffleQuestions: boolean
		showResults: boolean
	}
	status: 'draft' | 'published' | 'archived'
	createdAt: FirebaseFirestore.Timestamp
	updatedAt: FirebaseFirestore.Timestamp
	playCount: number
	isPublic: boolean
}
```

#### Questions Collection

```typescript
// questions/{questionId}
interface QuestionDocument {
	gameId: string
	question: string
	options: string[]
	correctAnswer: number
	explanation?: string
	order: number
	createdAt: FirebaseFirestore.Timestamp
}
```

#### Usage Tracking Collections

```typescript
// usageEvents/{eventId}
interface UsageEventDocument {
	userId: string
	eventType: string
	metadata: any
	timestamp: FirebaseFirestore.Timestamp
	costUnits: number
}

// usageCounters/{userId}
interface UsageCounterDocument {
	userId: string
	currentPeriodGamesCreated: number
	currentPeriodQuestionsGenerated: number
	currentPeriodAiQuestions: number
	currentPeriodPlayerSubmissions: number
	currentPeriodAnalyticsViews: number
	currentPeriodExports: number
	currentPeriodCustomThemes: number
	lastResetDate: FirebaseFirestore.Timestamp
	updatedAt: FirebaseFirestore.Timestamp
}

// userPlans/{userId}
interface UserPlanDocument {
	userId: string
	planType: 'free' | 'premium' | 'enterprise'
	status: 'active' | 'inactive' | 'beta'
	features: string[]
	limits: Record<string, number>
	billingId?: string
	createdAt: FirebaseFirestore.Timestamp
	updatedAt: FirebaseFirestore.Timestamp
}
```

### 3.2 Firestore Security Rules

#### firestore.rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Games: users can CRUD their own games, read public games
    match /games/{gameId} {
      allow read: if resource.data.isPublic == true ||
                   resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                     request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                             resource.data.userId == request.auth.uid;
    }

    // Questions: tied to games
    match /questions/{questionId} {
      allow read: if exists(/databases/$(database)/documents/games/$(resource.data.gameId)) &&
                   (resource.data.gameId.isPublic == true ||
                    resource.data.gameId.userId == request.auth.uid);
      allow create, update, delete: if request.auth != null &&
                                     exists(/databases/$(database)/documents/games/$(request.resource.data.gameId)) &&
                                     resource.data.gameId.userId == request.auth.uid;
    }

    // Usage tracking: users can only access their own data
    match /usageEvents/{eventId} {
      allow read, write: if request.auth != null &&
                           resource.data.userId == request.auth.uid;
    }

    match /usageCounters/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only backend can write
    }

    match /userPlans/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only backend can write
    }
  }
}
```

## Phase 4: Frontend Migration

### 4.1 API Client Updates

#### Current API Client (client/src/hooks/use-api.ts)

```typescript
// Update to use Firebase Functions
import { getFunctions, httpsCallable } from 'firebase/functions'

export const useApi = () => {
	const functions = getFunctions()

	const createGame = httpsCallable(functions, 'createGame')
	const getGames = httpsCallable(functions, 'getGames')
	const generateQuestions = httpsCallable(functions, 'generateQuestions')
	const trackUsage = httpsCallable(functions, 'trackUsage')

	return {
		createGame,
		getGames,
		generateQuestions,
		trackUsage,
	}
}
```

### 4.2 Environment Configuration

#### .env.production

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quiz-booth-production
VITE_FIREBASE_STORAGE_BUCKET=quiz-booth-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Phase 5: Deployment Configuration

### 5.1 Firebase Functions Package.json

#### firebase-functions/package.json

```json
{
	"name": "quiz-booth-functions",
	"scripts": {
		"build": "tsc",
		"serve": "npm run build && firebase emulators:start --only functions",
		"shell": "npm run build && firebase functions:shell",
		"start": "npm run shell",
		"deploy": "firebase deploy --only functions",
		"logs": "firebase functions:log"
	},
	"engines": {
		"node": "18"
	},
	"main": "lib/index.js",
	"dependencies": {
		"firebase-admin": "^11.11.0",
		"firebase-functions": "^4.5.0",
		"axios": "^1.6.0"
	},
	"devDependencies": {
		"@typescript-eslint/eslint-plugin": "^5.12.0",
		"@typescript-eslint/parser": "^5.12.0",
		"eslint": "^8.9.0",
		"eslint-plugin-import": "^2.25.4",
		"typescript": "^4.9.0"
	},
	"private": true
}
```

### 5.2 Deployment Scripts

#### package.json (root)

```json
{
	"scripts": {
		"build:client": "cd client && npm run build",
		"build:functions": "cd firebase-functions && npm run build",
		"deploy:hosting": "firebase deploy --only hosting",
		"deploy:functions": "firebase deploy --only functions",
		"deploy:all": "npm run build:client && npm run build:functions && firebase deploy",
		"emulators": "firebase emulators:start"
	}
}
```

## Phase 6: Data Migration Strategy

### 6.1 Migration Script

#### scripts/migrate-to-firestore.js

```javascript
const admin = require('firebase-admin')
const serviceAccount = require('./service-account-key.json')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

async function migrateGames() {
	// Export from current database and import to Firestore
	const gamesSnapshot = await db.collection('games_old').get()

	for (const doc of gamesSnapshot.docs) {
		const gameData = doc.data()
		await db
			.collection('games')
			.doc(doc.id)
			.set({
				...gameData,
				migratedAt: admin.firestore.FieldValue.serverTimestamp(),
			})
	}
}

async function migrateUsers() {
	// Migrate user data and usage tracking
	// This would be custom based on your current user structure
}

// Run migration
migrateGames()
	.then(() => {
		console.log('Migration completed')
		process.exit(0)
	})
	.catch((error) => {
		console.error('Migration failed:', error)
		process.exit(1)
	})
```

## Phase 7: Testing & Validation

### 7.1 Local Development Setup

```bash
# Start Firebase emulators
firebase emulators:start

# Test functions locally
curl -X POST http://localhost:5001/quiz-booth-production/us-central1/createGame \
  -H "Content-Type: application/json" \
  -d '{"data": {"title": "Test Game", "description": "Test"}}'

# Test Firestore rules
firebase emulators:exec --project=quiz-booth-production "npm test"
```

### 7.2 Production Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore security rules tested
- [ ] Functions deployed and tested
- [ ] Frontend built and deployed to hosting
- [ ] Environment variables configured
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificates verified
- [ ] Performance monitoring set up
- [ ] Error tracking configured

## Phase 8: Performance Optimization

### 8.1 Firestore Indexes

#### firestore.indexes.json

```json
{
	"indexes": [
		{
			"collectionGroup": "games",
			"queryScope": "COLLECTION",
			"fields": [
				{ "fieldPath": "userId", "order": "ASCENDING" },
				{ "fieldPath": "createdAt", "order": "DESCENDING" }
			]
		},
		{
			"collectionGroup": "games",
			"queryScope": "COLLECTION",
			"fields": [
				{ "fieldPath": "isPublic", "order": "ASCENDING" },
				{ "fieldPath": "createdAt", "order": "DESCENDING" }
			]
		},
		{
			"collectionGroup": "questions",
			"queryScope": "COLLECTION",
			"fields": [
				{ "fieldPath": "gameId", "order": "ASCENDING" },
				{ "fieldPath": "order", "order": "ASCENDING" }
			]
		}
	]
}
```

### 8.2 Functions Optimization

- Use environment variables for configuration
- Implement proper error handling and logging
- Set appropriate memory and timeout settings
- Use Firebase Functions v2 for better performance

## Migration Timeline

### Week 1: Setup & Planning

- Firebase project setup
- Development environment configuration
- Backend function skeleton creation

### Week 2: Backend Migration

- Convert Express routes to Firebase Functions
- Implement Firestore-based usage tracking
- Test functions locally with emulators

### Week 3: Frontend Updates

- Update API client to use Firebase Functions
- Test frontend-backend integration
- Performance testing and optimization

### Week 4: Data Migration & Deployment

- Migrate existing data to Firestore
- Deploy to staging environment
- Comprehensive testing and validation

### Week 5: Production Deployment

- Deploy to production
- Monitor performance and errors
- User acceptance testing

## Risk Mitigation

### Technical Risks

- **Cold starts**: Implement warm-up functions
- **Data consistency**: Use Firestore transactions
- **Performance**: Optimize queries and indexes

### Business Risks

- **Downtime**: Gradual migration with feature flags
- **Data loss**: Comprehensive backup strategy
- **User experience**: A/B testing of new features

## Success Metrics

- Application response time < 500ms
- Function cold start time < 2 seconds
- 99.9% uptime availability
- Zero data loss during migration
- Positive user feedback on performance

This migration plan provides a comprehensive roadmap for moving Quiz Booth to a fully Firebase-hosted architecture while maintaining all existing functionality and preparing for future scalability.
