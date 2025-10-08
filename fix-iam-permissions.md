# Fix IAM Permissions for Firebase Functions Image Upload

## Problem

The Firebase Functions are failing with error:

```
Permission 'iam.serviceAccounts.signBlob' denied on resource (or it may not exist).
```

## Solution

You need to add the `Service Account Token Creator` role to the Firebase Functions service account.

## Steps to Fix

### Option 1: Google Cloud Console (Recommended)

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select your project: **trivia-games-7a81b**
3. Go to **IAM & Admin** > **IAM** in the left sidebar
4. Find the service account: `trivia-games-7a81b@appspot.gserviceaccount.com`
5. If it doesn't exist, click **+ GRANT ACCESS** and add:
   - **New principals**: `trivia-games-7a81b@appspot.gserviceaccount.com`
   - **Role**: `Service Account Token Creator` (roles/iam.serviceAccountTokenCreator)
6. If it exists, click the **pencil/edit** icon next to it and add the role
7. Click **SAVE**

### Option 2: Install gcloud CLI and run command

If you prefer to use the command line:

```bash
# Install Google Cloud SDK first
# Then run:
gcloud projects add-iam-policy-binding trivia-games-7a81b \
  --member="serviceAccount:trivia-games-7a81b@appspot.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

## Verification

After adding the role, test the image upload functionality again. The 500 error should be resolved.

## Additional Notes

- This permission is required for Firebase Functions to generate signed URLs for Cloud Storage
- The service account `trivia-games-7a81b@appspot.gserviceaccount.com` is automatically created by Firebase
- This is a common issue when using signed URLs with Firebase Functions
