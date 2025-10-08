// Test script to verify the image upload flow in development environment
import https from 'https'
import http from 'http'

console.log('🧪 Testing Image Upload Flow in Development Environment\n')

// Test 1: Check if Firebase Functions emulator is accessible
console.log('1. Testing Firebase Functions emulator accessibility...')
const testFunctions = () => {
	return new Promise((resolve, reject) => {
		const req = http.request(
			'http://localhost:5001/trivia-games-7a81b/us-central1/generateImageUploadUrl',
			(res) => {
				console.log(
					`   ✅ Functions emulator accessible (Status: ${res.statusCode})`
				)
				resolve()
			}
		)

		req.on('error', (error) => {
			console.log(`   ❌ Functions emulator not accessible: ${error.message}`)
			reject(error)
		})

		req.end()
	})
}

// Test 2: Check if Storage emulator is accessible
console.log('2. Testing Firebase Storage emulator accessibility...')
const testStorage = () => {
	return new Promise((resolve, reject) => {
		const req = http.request('http://localhost:9199/', (res) => {
			console.log(
				`   ✅ Storage emulator accessible (Status: ${res.statusCode})`
			)
			resolve()
		})

		req.on('error', (error) => {
			console.log(`   ❌ Storage emulator not accessible: ${error.message}`)
			reject(error)
		})

		req.end()
	})
}

// Test 3: Check if Hosting emulator is accessible
console.log('3. Testing Firebase Hosting emulator accessibility...')
const testHosting = () => {
	return new Promise((resolve, reject) => {
		const req = http.request('http://localhost:5000/', (res) => {
			console.log(
				`   ✅ Hosting emulator accessible (Status: ${res.statusCode})`
			)
			resolve()
		})

		req.on('error', (error) => {
			console.log(`   ❌ Hosting emulator not accessible: ${error.message}`)
			reject(error)
		})

		req.end()
	})
}

// Test 4: Test direct upload to storage (should fail due to security rules)
console.log(
	'4. Testing direct upload to storage (should fail due to security rules)...'
)
const testDirectUpload = () => {
	return new Promise((resolve, reject) => {
		const data = 'test-image-content'
		const options = {
			hostname: 'localhost',
			port: 9199,
			path: '/v0/b/trivia-games-7a81b.appspot.com/o?name=test-file.png&uploadType=media',
			method: 'POST',
			headers: {
				'Content-Type': 'image/png',
				'Content-Length': data.length,
			},
		}

		const req = http.request(options, (res) => {
			let responseData = ''
			res.on('data', (chunk) => {
				responseData += chunk
			})
			res.on('end', () => {
				if (res.statusCode === 403) {
					console.log(
						`   ✅ Direct upload blocked by security rules (Status: ${res.statusCode})`
					)
					resolve()
				} else {
					console.log(`   ❌ Unexpected response: ${res.statusCode}`)
					reject(new Error(`Unexpected status: ${res.statusCode}`))
				}
			})
		})

		req.on('error', (error) => {
			console.log(`   ❌ Direct upload test failed: ${error.message}`)
			reject(error)
		})

		req.write(data)
		req.end()
	})
}

// Run all tests
async function runTests() {
	try {
		await testFunctions()
		await testStorage()
		await testHosting()
		await testDirectUpload()

		console.log(
			'\n🎉 All tests passed! The development environment is properly configured.'
		)
		console.log('\n📋 Next steps:')
		console.log(
			'   - Visit http://localhost:5000/game-customization/2748b523-5163-49cd-842b-bdee9f0d1cce'
		)
		console.log('   - Try uploading an image through the client interface')
		console.log('   - The client should now properly connect to the emulator')
		console.log(
			'   - The upload should work through Firebase Functions for security'
		)
	} catch (error) {
		console.log(
			'\n❌ Some tests failed. Please check the emulator configuration.'
		)
		console.log('   Error:', error.message)
		process.exit(1)
	}
}

runTests()
