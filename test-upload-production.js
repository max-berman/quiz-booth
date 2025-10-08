// Test script to verify image upload functionality in production
// This can help diagnose the 500 error in production

const admin = require('firebase-admin')

// Test Firebase Admin initialization
console.log('Testing Firebase Admin initialization...')

try {
	// Initialize Firebase Admin (production configuration)
	admin.initializeApp({
		projectId: 'trivia-games-7a81b',
		storageBucket: 'trivia-games-7a81b.appspot.com',
	})

	console.log('✅ Firebase Admin initialized successfully')

	// Test Firestore FieldValue
	const fieldValue = admin.firestore.FieldValue
	if (fieldValue && fieldValue.serverTimestamp) {
		console.log('✅ Firestore FieldValue.serverTimestamp is available')
	} else {
		console.log('❌ Firestore FieldValue.serverTimestamp is NOT available')
	}

	// Test Firestore connection
	const firestore = admin.firestore()
	console.log('✅ Firestore instance created')

	// Test Storage connection
	const storage = admin.storage()
	const bucket = storage.bucket()
	console.log('✅ Storage bucket created:', bucket.name)

	console.log('✅ All Firebase Admin tests passed!')
} catch (error) {
	console.error('❌ Firebase Admin initialization failed:', error)
	console.error('Error details:', error.message)
	console.error('Stack trace:', error.stack)
}

// Test the specific error scenario from production
console.log('\nTesting specific upload scenario...')

// Simulate the generateImageUploadUrl function logic
async function testGenerateUploadUrl() {
	try {
		const bucket = admin.storage().bucket()
		const filePath = 'game-logos/test-game/test-image.png'
		const file = bucket.file(filePath)

		console.log('Testing signed URL generation...')

		const [signedUrl] = await file.getSignedUrl({
			version: 'v4',
			action: 'write',
			expires: Date.now() + 15 * 60 * 1000,
			contentType: 'image/*',
		})

		console.log('✅ Signed URL generated successfully')
		console.log('Signed URL:', signedUrl)
	} catch (error) {
		console.error('❌ Signed URL generation failed:', error)
		console.error('Error details:', error.message)
		console.error('Stack trace:', error.stack)
	}
}

// Run the test
testGenerateUploadUrl().catch(console.error)
