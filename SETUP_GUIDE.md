# Trivia Game App Setup Guide

## Prerequisites

Before running the application, you need to configure the following services:

1. **Firebase Project** (already configured in `.env`)
2. **DeepSeek AI API Key** (requires setup)

## DeepSeek API Key Setup

### Step 1: Create a DeepSeek Account

1. Go to [DeepSeek AI](https://platform.deepseek.com/)
2. Sign up for an account
3. Verify your email address

### Step 2: Obtain API Key

1. Log in to your DeepSeek account
2. Navigate to the API Keys section
3. Click "Create New API Key"
4. Copy the generated API key

### Step 3: Configure Environment Variable

Replace `your_deepseek_api_key_here` in the `.env` file with your actual DeepSeek API key:

```env
DEEPSEEK_API_KEY=sk-your_actual_api_key_here
```

### Step 4: Restart the Application

After updating the `.env` file, restart the development server:

```bash
npm run dev
```

## Firebase Configuration (Already Set Up)

The Firebase configuration is already provided in the `.env` file. The app uses:

- **Firebase Firestore** for database storage
- **Firebase Authentication** for user management
- **Firebase Storage** for file storage

## Testing the Setup

To verify that the DeepSeek API is working correctly:

1. Start the application: `npm run dev`
2. Navigate to the setup page (`/setup`)
3. Create a new trivia game with test data
4. The app should successfully generate questions using the DeepSeek API

## Server-Side Rendering (SSR) Testing

To test the SSR functionality:

1. **Test SSR Routes**:

   ```bash
   npm run test:ssr
   ```

2. **Test with Firebase Emulators**:

   ```bash
   npm run emulate
   ```

3. **Verify SSR Pages**:

   - Home page (`/`) - Should render server-side with SEO meta tags
   - About page (`/about`) - Should render server-side with mission content
   - Quiz Games page (`/quiz-games`) - Should render server-side with public games
   - FAQ page (`/faq`) - Should render server-side with structured content

4. **Check SSR Features**:
   - Server-generated HTML with proper meta tags
   - Dynamic content from Firestore
   - Security headers (X-Frame-Options, XSS Protection)
   - 1-hour caching for performance

## Troubleshooting

### Common Issues

1. **API Key Not Working**:

   - Ensure the API key is correctly copied without extra spaces
   - Check that your DeepSeek account has API access enabled

2. **Rate Limiting**:

   - DeepSeek may have rate limits on free accounts
   - Consider upgrading if you need higher usage limits

3. **Network Issues**:
   - Ensure your network allows outbound connections to `api.deepseek.com`
   - Check firewall settings if the API calls fail

### Error Messages

- **"DeepSeek API key not configured"**: The `DEEPSEEK_API_KEY` environment variable is missing or empty
- **"DeepSeek API error: 401 Unauthorized"**: The API key is invalid or expired
- **"DeepSeek API error: 429 Too Many Requests"**: You've exceeded the rate limit

## Security Notes

- Never commit your actual API keys to version control
- The `.env` file is included in `.gitignore` to prevent accidental commits
- For production deployment, set environment variables in your hosting platform

## Additional Resources

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Application README](../README.md)
