# Apply CORS Configuration to Cloud Storage Bucket

## Problem

The image upload is failing with CORS error:

```
Access to fetch at 'https://storage.googleapis.com/trivia-games-7a81b.appspot.com/...' from origin 'https://quizbooth.games' has been blocked by CORS policy
```

## Solution

Configure CORS for the Cloud Storage bucket to allow cross-origin requests from your domain.

## Steps to Fix

### Option 1: Google Cloud Console (Recommended)

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select your project: **trivia-games-7a81b**
3. Go to **Cloud Storage** > **Buckets** in the left sidebar
4. Click on your bucket: **trivia-games-7a81b.appspot.com**
5. In the bucket details page, look for these options:
   - **Option A**: Click the **PERMISSIONS** tab, then look for **CORS** in the left sidebar
   - **Option B**: Click the **CONFIGURATION** tab, then look for **CORS** settings
   - **Option C**: Look for a **SETTINGS** or **CONFIGURATION** button/icon near the top
6. If you don't see CORS immediately, try:
   - Look for **Bucket settings** or **Bucket configuration**
   - Search for "CORS" using the page search (Ctrl+F)
   - Check under **Security** or **Permissions** sections
7. Once you find CORS settings, click **ADD** or **CONFIGURE** and paste the following JSON configuration:

```json
[
	{
		"origin": [
			"https://quizbooth.games",
			"http://localhost:5173",
			"http://127.0.0.1:5173"
		],
		"method": ["PUT", "POST", "GET", "DELETE", "HEAD"],
		"responseHeader": [
			"Content-Type",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Headers",
			"Access-Control-Max-Age"
		],
		"maxAgeSeconds": 3600
	}
]
```

8. Click **SAVE**

### Option 2: Using gcloud CLI (if installed)

```bash
# Set the CORS configuration
gsutil cors set fix-cors-config.json gs://trivia-games-7a81b.appspot.com

# Verify the configuration
gsutil cors get gs://trivia-games-7a81b.appspot.com
```

## Verification

After applying the CORS configuration, test the image upload functionality again. The CORS error should be resolved and the upload should work successfully.

## Additional Notes

- CORS configuration is required when uploading files directly from the browser to Cloud Storage
- The configuration allows requests from your production domain and local development URLs
- The `PUT` method is essential for file uploads using signed URLs
- Changes to CORS configuration may take a few minutes to propagate
