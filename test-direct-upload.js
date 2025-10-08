// Test script for direct image upload functionality
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Create a simple test image file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const testImagePath = path.join(__dirname, 'test-image.png')

// Check if test image exists, if not create a simple one
if (!fs.existsSync(testImagePath)) {
	console.log('Creating test image...')
	// Create a simple 1x1 PNG image
	const pngBuffer = Buffer.from([
		0x89,
		0x50,
		0x4e,
		0x47,
		0x0d,
		0x0a,
		0x1a,
		0x0a, // PNG signature
		0x00,
		0x00,
		0x00,
		0x0d,
		0x49,
		0x48,
		0x44,
		0x52, // IHDR chunk
		0x00,
		0x00,
		0x00,
		0x01,
		0x00,
		0x00,
		0x00,
		0x01, // Width: 1, Height: 1
		0x08,
		0x02,
		0x00,
		0x00,
		0x00,
		0x90,
		0x77,
		0x53, // Bit depth, color type, etc.
		0xde,
		0x00,
		0x00,
		0x00,
		0x0c,
		0x49,
		0x44,
		0x41, // IDAT chunk
		0x54,
		0x08,
		0x5b,
		0x63,
		0xf8,
		0x0f,
		0x00,
		0x00, // Image data
		0x02,
		0x00,
		0x01,
		0xe2,
		0x21,
		0xbc,
		0x33,
		0x00, // Image data
		0x00,
		0x00,
		0x00,
		0x49,
		0x45,
		0x4e,
		0x44,
		0xae, // IEND chunk
		0x42,
		0x60,
		0x82, // IEND chunk
	])
	fs.writeFileSync(testImagePath, pngBuffer)
}

console.log('Test image created at:', testImagePath)
console.log('You can now test the image upload functionality at:')
console.log(
	'http://localhost:5173/game-customization/bbe4aebe-86ea-4ee8-9bf3-1e54f215762f'
)
console.log('')
console.log(
	'The direct upload function should now work locally with the emulator.'
)
