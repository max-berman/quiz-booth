# Firebase Functions Deployment Guide

## Migration from functions.config() to Environment Variables

This project has been migrated from using `functions.config()` to environment variables to comply with Firebase's deprecation notice.

### What Changed

- **Before**: Used `functions.config().deepseek.api_key`
- **After**: Uses `process.env.DEEPSEEK_API_KEY`

### Deployment Process

#### 1. Set Environment Variables in Firebase

For production deployment, you need to set environment variables in Firebase:

```bash
# Set DeepSeek API key
firebase functions:config:set deepseek.api_key="your_actual_api_key_here"

# Or use the new environment variable approach (recommended)
# Set environment variables directly in Firebase Console or use:
firebase functions:secrets:set DEEPSEEK_API_KEY
```

#### 2. Local Development

For local development, create a `.env` file in the `firebase-functions` directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your actual values
```

#### 3. Production Deployment

The deployment process now automatically loads environment variables from the `.env` file during build time.

### Environment Variables

| Variable           | Description                            | Required |
| ------------------ | -------------------------------------- | -------- |
| `DEEPSEEK_API_KEY` | API key for DeepSeek AI service        | Yes      |
| `ADMIN_USERS`      | Comma-separated list of admin user IDs | No       |

### Important Notes

1. **Security**: Never commit `.env` files to version control
2. **Backup**: Keep a secure backup of your environment variables
3. **Fallback**: The code still supports both methods during transition period
4. **Migration Deadline**: Functions using `functions.config()` will stop working after December 31, 2025

### Troubleshooting

If you encounter issues:

1. **Check environment variables**: Ensure all required variables are set
2. **Verify deployment**: Check Firebase Functions logs for any configuration errors
3. **Test locally**: Use Firebase emulators to test before deployment

### Additional Resources

- [Firebase Environment Variables Documentation](https://firebase.google.com/docs/functions/config-env)
- [Migrating from functions.config()](https://firebase.google.com/docs/functions/config-env#migrate-to-dotenv)
