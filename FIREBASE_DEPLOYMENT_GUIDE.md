# Firebase Deployment Guide for Quiz Booth

This guide provides step-by-step instructions for deploying the Quiz Booth application to Firebase.

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI globally

   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

3. **Authentication**: Login to Firebase CLI
   ```bash
   firebase login
   ```

## Project Setup

### 1. Initialize Firebase Project

```bash
# Set your Firebase project ID
firebase use --add

# Select your Firebase project or create a new one
```

### 2. Environment Configuration

Create a `.env.production` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quiz-booth-production
VITE_FIREBASE_STORAGE_BUCKET=quiz-booth-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. Firebase Functions Setup

Install dependencies for Firebase Functions:

```bash
cd firebase-functions
npm install
```

## Deployment Steps

### 1. Build the Application

```bash
# Build the client application
npm run build:client

# Build the Firebase Functions
npm run build:functions
```

### 2. Deploy Firebase Services

#### Option A: Deploy Everything at Once

```bash
npm run deploy:all
```

#### Option B: Deploy Services Individually

```bash
# Deploy Firestore rules and indexes
npm run deploy:firestore

# Deploy Firebase Functions
npm run deploy:functions

# Deploy hosting
npm run deploy:hosting
```

### 3. Verify Deployment

1. **Check Firebase Console**: Visit [Firebase Console](https://console.firebase.google.com) to verify all services are deployed
2. **Test Functions**: Use the Firebase Functions logs to monitor function execution
3. **Test Hosting**: Visit your Firebase hosting URL to test the application

## Environment Configuration

### Firebase Functions Environment Variables

Set environment variables for Firebase Functions:

```bash
firebase functions:config:set deepseek.api_key="your_deepseek_api_key"
firebase functions:config:set admin.users="admin_user_id1,admin_user_id2"
```

### Firestore Security Rules

The security rules are defined in `firestore.rules` and will be deployed automatically. Test them using the Firebase Emulator Suite:

```bash
npm run emulators
```

## Testing Locally

### 1. Firebase Emulators

```bash
# Start all emulators
npm run emulators

# Or start specific emulators
firebase emulators:start --only functions,firestore,auth
```

### 2. Local Development

For local development with the emulators, update your `.env.development`:

```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-project
```

## Monitoring and Maintenance

### 1. Function Logs

```bash
# View function logs
npm run logs

# Or use Firebase CLI directly
firebase functions:log
```

### 2. Performance Monitoring

- Monitor function execution times and cold starts
- Set up Firebase Performance Monitoring for the frontend
- Configure Firebase Alerts for critical errors

### 3. Database Maintenance

- Regularly backup Firestore data
- Monitor usage and set up billing alerts
- Review and optimize Firestore indexes

## Troubleshooting

### Common Issues

1. **Function Deployment Failures**

   - Check function logs for errors
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed

2. **Firestore Rules Issues**

   - Test rules using the Firebase Emulator
   - Check rule syntax and security requirements

3. **Hosting Issues**
   - Verify the build output is correct
   - Check Firebase hosting configuration
   - Clear browser cache if needed

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.community)
- [GitHub Issues](https://github.com/max-berman/quiz-booth/issues)

## Migration from Previous Deployment

If migrating from a previous deployment (e.g., Render, Vercel):

1. **Data Migration**: Export data from your current database and import to Firestore
2. **Domain Configuration**: Update DNS settings to point to Firebase hosting
3. **Environment Variables**: Migrate all environment variables to Firebase Functions config
4. **Testing**: Thoroughly test all functionality before switching traffic

## Cost Optimization

- Use Firebase Blaze plan for production (pay-as-you-go)
- Monitor function invocations and optimize cold starts
- Implement caching strategies where appropriate
- Set up budget alerts in Google Cloud Console

This deployment guide ensures a smooth transition to Firebase while maintaining all existing functionality and preparing for future scalability.
