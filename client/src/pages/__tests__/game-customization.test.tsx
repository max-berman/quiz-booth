import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GameCustomizationPage from '../game-customization'
import { useParams, useLocation } from 'wouter'
import { useToast } from '@/hooks/use-toast'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

// Mock dependencies
vi.mock('wouter')
vi.mock('@/hooks/use-toast')
vi.mock('@/hooks/use-firebase-functions')
vi.mock('firebase/functions')
vi.mock('@/lib/firebase')
vi.mock('@/components/game-preview')

// Mock the Firebase functions
const mockGenerateUploadUrl = vi.fn()
const mockHandleUploadComplete = vi.fn()
const mockGetGame = vi.fn()
const mockUpdateGame = vi.fn()

describe('GameCustomizationPage - Image Upload', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Setup mocks
		;(useParams as any).mockReturnValue({ id: 'test-game-id' })
		;(useLocation as any).mockReturnValue([null, vi.fn()])
		;(useToast as any).mockReturnValue({
			toast: vi.fn(),
		})
		;(useFirebaseFunctions as any).mockReturnValue({
			getGame: mockGetGame,
			updateGame: mockUpdateGame,
		})
		;(httpsCallable as any).mockImplementation(
			(functionsInstance, functionName) => {
				if (functionName === 'generateImageUploadUrl') {
					return mockGenerateUploadUrl
				}
				if (functionName === 'handleImageUploadComplete') {
					return mockHandleUploadComplete
				}
				return vi.fn()
			}
		)
	})

	const mockGame = {
		id: 'test-game-id',
		gameTitle: 'Test Game',
		userId: 'test-user-id',
		customization: {
			primaryColor: '#5c4a2a',
			secondaryColor: '#e6e6e6',
			tertiaryColor: '#f2f0e9',
			quaternaryColor: '#e8d9b5',
			customLogoUrl: '',
			customLogoLink: '',
			isCustomized: false,
		},
	}

	it('should render the game customization page with logo upload section', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Branding')).toBeInTheDocument()
			expect(screen.getByText('Logo')).toBeInTheDocument()
			expect(screen.getByText('Click to upload')).toBeInTheDocument()
		})
	})

	it('should handle file validation for non-image files', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const fileInput = screen.getByLabelText('Click to upload').closest('input')!

		// Create a non-image file
		const textFile = new File(['test content'], 'test.txt', {
			type: 'text/plain',
		})
		fireEvent.change(fileInput, { target: { files: [textFile] } })

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: 'Invalid File',
				description: 'Please upload an image file.',
				variant: 'destructive',
			})
		})
	})

	it('should handle file size validation for large files', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const fileInput = screen.getByLabelText('Click to upload').closest('input')!

		// Create a large image file (6MB)
		const largeFile = new File(
			['x'.repeat(6 * 1024 * 1024)],
			'large-image.png',
			{ type: 'image/png' }
		)
		fireEvent.change(fileInput, { target: { files: [largeFile] } })

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: 'File Too Large',
				description: 'Please upload an image smaller than 5MB.',
				variant: 'destructive',
			})
		})
	})

	it('should handle successful logo upload', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		// Mock successful upload flow
		mockGenerateUploadUrl.mockResolvedValue({
			data: {
				signedUrl: 'https://storage.googleapis.com/signed-url',
				filePath: 'game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		mockHandleUploadComplete.mockResolvedValue({
			data: {
				success: true,
				imageUrl: 'https://storage.googleapis.com/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		// Mock successful fetch response
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(''),
		})

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const fileInput = screen.getByLabelText('Click to upload').closest('input')!

		// Create a valid image file
		const imageFile = new File(['image content'], 'test-logo.png', {
			type: 'image/png',
		})
		fireEvent.change(fileInput, { target: { files: [imageFile] } })

		await waitFor(() => {
			expect(mockGenerateUploadUrl).toHaveBeenCalledWith({
				gameId: 'test-game-id',
				fileName: 'test-logo.png',
				uploadType: 'LOGO',
			})
		})

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				'https://storage.googleapis.com/signed-url',
				{
					method: 'PUT',
					body: imageFile,
					headers: {
						'Content-Type': 'image/png',
					},
				}
			)
		})

		await waitFor(() => {
			expect(mockHandleUploadComplete).toHaveBeenCalledWith({
				gameId: 'test-game-id',
				filePath: 'game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			})
		})

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: 'Logo Uploaded',
				description: 'Logo has been uploaded successfully.',
			})
		})
	})

	it('should handle upload failure with 403 error', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		// Mock successful URL generation but failed upload
		mockGenerateUploadUrl.mockResolvedValue({
			data: {
				signedUrl: 'https://storage.googleapis.com/signed-url',
				filePath: 'game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		// Mock failed fetch response with 403
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			statusText: 'Forbidden',
			text: () => Promise.resolve('Permission denied'),
		})

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const fileInput = screen.getByLabelText('Click to upload').closest('input')!

		const imageFile = new File(['image content'], 'test-logo.png', {
			type: 'image/png',
		})
		fireEvent.change(fileInput, { target: { files: [imageFile] } })

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: 'Upload Failed',
				description:
					'Upload permission denied. Please check your authentication.',
				variant: 'destructive',
			})
		})
	})

	it('should handle emulator environment upload correctly', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		// Mock emulator URL
		mockGenerateUploadUrl.mockResolvedValue({
			data: {
				signedUrl:
					'http://localhost:9199/v0/b/test-bucket/o?name=test-path&uploadType=media',
				filePath: 'game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		mockHandleUploadComplete.mockResolvedValue({
			data: {
				success: true,
				imageUrl:
					'http://localhost:9199/test-bucket/game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		// Mock successful fetch response
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(''),
		})

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const fileInput = screen.getByLabelText('Click to upload').closest('input')!

		const imageFile = new File(['image content'], 'test-logo.png', {
			type: 'image/png',
		})
		fireEvent.change(fileInput, { target: { files: [imageFile] } })

		await waitFor(() => {
			// Should use PUT method for emulator URLs
			expect(global.fetch).toHaveBeenCalledWith(
				'http://localhost:9199/v0/b/test-bucket/o?name=test-path&uploadType=media',
				{
					method: 'PUT',
					body: imageFile,
					headers: {
						'Content-Type': 'image/png',
					},
				}
			)
		})
	})

	it('should handle drag and drop file upload', async () => {
		mockGetGame.mockResolvedValue({ data: mockGame })
		const mockToast = vi.fn()
		;(useToast as any).mockReturnValue({ toast: mockToast })

		// Mock successful upload
		mockGenerateUploadUrl.mockResolvedValue({
			data: {
				signedUrl: 'https://storage.googleapis.com/signed-url',
				filePath: 'game-logos/test-game-id/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		mockHandleUploadComplete.mockResolvedValue({
			data: {
				success: true,
				imageUrl: 'https://storage.googleapis.com/test-logo.png',
				uploadType: 'LOGO',
				fieldName: 'logoUrl',
			},
		})

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: () => Promise.resolve(''),
		})

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Logo')).toBeInTheDocument()
		})

		const dropZone = screen.getByText('Click to upload').closest('div')!

		const imageFile = new File(['image content'], 'test-logo.png', {
			type: 'image/png',
		})

		// Simulate drag and drop
		fireEvent.dragOver(dropZone)
		fireEvent.drop(dropZone, {
			dataTransfer: {
				files: [imageFile],
			},
		})

		await waitFor(() => {
			expect(mockGenerateUploadUrl).toHaveBeenCalledWith({
				gameId: 'test-game-id',
				fileName: 'test-logo.png',
				uploadType: 'LOGO',
			})
		})
	})

	it('should handle remove logo functionality', async () => {
		const gameWithLogo = {
			...mockGame,
			customization: {
				...mockGame.customization,
				customLogoUrl: 'https://storage.googleapis.com/test-logo.png',
			},
		}
		mockGetGame.mockResolvedValue({ data: gameWithLogo })

		render(<GameCustomizationPage />)

		await waitFor(() => {
			expect(screen.getByText('Remove Logo')).toBeInTheDocument()
		})

		const removeButton = screen.getByText('Remove Logo')
		fireEvent.click(removeButton)

		await waitFor(() => {
			expect(screen.getByText('Click to upload')).toBeInTheDocument()
		})
	})
})
