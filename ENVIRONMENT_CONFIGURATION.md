# Environment Configuration System

This document describes the centralized environment configuration system for the Quiz Booth application, which provides clear separation between development and production environments.

## Overview

The system replaces scattered environment checks throughout the codebase with a centralized configuration that automatically detects the current environment and provides appropriate settings for Firebase, security rules, and feature flags.

## Architecture

### Configuration Files

1. **Shared Configuration** (`shared/environment.ts`)

   - Core environment detection utilities
   - Common configuration interface
   - Environment-specific feature flags

2. **Client Configuration** (`client/src/config/environment.ts`)

   - Client-specific Firebase configuration
   - URL configuration for APIs and websites
   - Client-side environment validation

3. **Server Configuration** (`firebase-functions/src/config/environment.ts`)
   - Server-specific Firebase Admin configuration
   - API keys and service configurations
   - Server-side limits and timeouts

### Security Rules

- **Development Rules** (`*.rules.dev`)

  - Permissive rules for testing
  - Allow all operations for development
  - Should NEVER be used in production

- **Production Rules** (`*.rules.prod`)
  - Strict security rules
  - Proper authentication and authorization
  - Default deny for unknown operations

## Environment Detection

The system automatically detects the environment using multiple methods:

### Client-Side Detection

- Vite development mode (`import.meta.env.DEV`)
- Localhost detection (`window.location.hostname`)

### Server-Side Detection

- Node.js environment variables (`NODE_ENV`)
- Firebase emulator flags (`FUNCTIONS_EMULATOR`, `FIREBASE_EMULATOR`)

### Default Behavior

- If no environment can be detected, defaults to **production** for safety

## Usage

### Basic Environment Checks

```typescript
import {
	isDevelopment,
	isProduction,
	getEnvironment,
} from '../../../shared/environment'

if (isDevelopment()) {
	// Development-specific code
}

if (isProduction()) {
	// Production-specific code
}

const environment = getEnvironment() // 'development' | 'production'
```

### Client-Side Configuration

```typescript
import clientEnvironment from '../config/environment'

const config = clientEnvironment.getConfig()

// Firebase configuration
const firebaseConfig = config.firebase.config

// API URLs
const apiBaseUrl = config.urls.apiBase

// Environment validation
if (!clientEnvironment.validateFirebaseConfig()) {
	// Handle invalid configuration
}
```

### Server-Side Configuration

```typescript
import serverEnvironment from '../config/environment'

const config = serverEnvironment.getConfig()

// API keys
const deepseekApiKey = config.api.deepseek.apiKey

// Function configuration
const timeout = serverEnvironment.getFunctionTimeout()
const memory = serverEnvironment.getFunctionMemory()
```

### Logging

```typescript
import { log } from '../../../shared/environment'

log.debug('Debug message') // Only in development
log.info('Info message') // Always
log.warn('Warning message') // Always
log.error('Error message') // Always
```

## Security Rules

### Development Rules

- **Firestore**: Allow all read/write operations
- **Storage**: Allow all read/write operations
- **Purpose**: Enable easy testing and development

### Production Rules

- **Firestore**: Strict user-based permissions
- **Storage**: Public read for game logos, authenticated write
- **Purpose**: Secure production environment

## Deployment

### Using the Deployment Script

```bash
# Deploy to development (default)
./scripts/deploy-with-environment.sh

# Deploy to production
./scripts/deploy-with-environment.sh production
```

### Manual Deployment

1. **Select appropriate rules:**

   ```bash
   # Development
   cp firestore.rules.dev firestore.rules
   cp storage.rules.dev storage.rules

   # Production
   cp firestore.rules.prod firestore.rules
   cp storage.rules.prod storage.rules
   ```

2. **Deploy Firebase services:**
   ```bash
   firebase deploy --only functions,firestore:rules,firestore:indexes,storage,hosting
   ```

## Environment Variables

### Client-Side (Vite)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Server-Side

```env
DEEPSEEK_API_KEY=your_deepseek_key
SPARKPOST_API_KEY=your_sparkpost_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## Benefits

1. **Centralized Configuration**: Single source of truth for environment settings
2. **Type Safety**: Full TypeScript support with interfaces
3. **Security**: Clear separation between development and production rules
4. **Maintainability**: Easy to update environment-specific behavior
5. **Testing**: Simplified testing with environment-specific mocks
6. **Deployment Safety**: Prevents accidental deployment of development rules to production

## Migration Guide

### Before (Scattered Environment Checks)

```typescript
// Old way - scattered throughout codebase
if (import.meta.env.DEV) {
	// Development code
} else {
	// Production code
}
```

### After (Centralized Configuration)

```typescript
// New way - centralized and type-safe
import { isDevelopment } from '../../../shared/environment'

if (isDevelopment()) {
	// Development code
} else {
	// Production code
}
```

## Testing

The configuration system includes built-in validation:

```typescript
// Client-side validation
clientEnvironment.validateFirebaseConfig()

// Server-side validation
serverEnvironment.validateEnvironment()
```

## Troubleshooting

### Common Issues

1. **Environment not detected correctly**

   - Check that environment variables are set properly
   - Verify Vite is running in development mode

2. **Firebase configuration validation fails**

   - Ensure all required environment variables are set in production
   - Check that Firebase project IDs match between client and server

3. **Security rules not applying**
   - Verify the correct rule files are copied before deployment
   - Check Firebase project configuration

### Debug Mode

Enable debug logging by setting environment variables:

```bash
# Client-side
VITE_DEBUG=true

# Server-side
DEBUG=true
```

## Future Enhancements

- [ ] Add staging environment support
- [ ] Implement feature flag system
- [ ] Add environment-specific analytics
- [ ] Create environment validation tests
- [ ] Add deployment preview environments
