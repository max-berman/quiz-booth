import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
	Palette,
	Image,
	Save,
	X,
	Upload,
	Sparkles,
	ArrowLeft,
	Edit,
	Link,
} from 'lucide-react'
import { GamePreview } from '@/components/game-preview'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { colorToHex, isValidHexColor } from '@/lib/color-utils'
import type { Game, GameCustomization } from '@shared/firebase-types'

const buttonDefaultStyle = `border-[##746c56] bg-[##fcf7e7] shadow-sm hover:bg-[#fcfdfe] hover:border-[##979181] hover:shadow-md ring-offset-[##fcf7e7]`

interface CustomizationForm {
	primaryColor: string
	secondaryColor: string
	tertiaryColor: string
	quaternaryColor: string
	customLogoUrl: string
	customLogoLink: string
}

const DEFAULT_COLORS = {
	primaryColor: '#5c4a2a', // Original primary color (brown)
	secondaryColor: '#e6e6e6', // Original secondary color (light gray)
	tertiaryColor: '#f2f0e9', // Original background color (cream)
	quaternaryColor: '#e8d9b5', // Original card color (light tan)
}

const COLOR_FIELDS = [
	{
		id: 'primaryColor',
		label: 'Primary',
		placeholder: '#5c4a2a',
	},
	{
		id: 'tertiaryColor',
		label: 'Background',
		placeholder: '#f2f0e9',
	},
	{
		id: 'quaternaryColor',
		label: 'Card',
		placeholder: '#e8d9b5',
	},
	{
		id: 'secondaryColor',
		label: 'Button Text',
		placeholder: '#e6e6e6',
	},
]

const COLOR_PRESETS = [
	{
		name: 'Warm Orange',
		primary: '#ea580c',
		secondary: '#ffffff',
		tertiary: '#fff2e5',
		quaternary: '#fffaf5',
	},
	{
		name: 'Elegant Purple',
		primary: '#7c3aed',
		secondary: '#ffffff',
		tertiary: '#faf5ff',
		quaternary: '#f3e8ff',
	},
	{
		name: 'Corporate Gray',
		primary: '#475569',
		secondary: '#ffffff',
		tertiary: '#f8fafc',
		quaternary: '#f1f5f9',
	},
	{
		name: 'Vibrant Teal',
		primary: '#ff004c',
		secondary: '#ffffff',
		tertiary: '#ffe5ee',
		quaternary: '#fffafe',
	},
]

export default function GameCustomizationPage() {
	const { id } = useParams()
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { getGame, updateGame } = useFirebaseFunctions()

	const [formData, setFormData] = useState<CustomizationForm>({
		primaryColor: DEFAULT_COLORS.primaryColor,
		secondaryColor: DEFAULT_COLORS.secondaryColor,
		tertiaryColor: DEFAULT_COLORS.tertiaryColor,
		quaternaryColor: DEFAULT_COLORS.quaternaryColor,
		customLogoUrl: '',
		customLogoLink: '',
	})
	const [isDragOver, setIsDragOver] = useState(false)
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [editedTitle, setEditedTitle] = useState('')

	// Fetch game data
	const {
		data: game,
		isLoading: gameLoading,
		error: gameError,
	} = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: !!id,
	})

	// Initialize form data when game loads
	useEffect(() => {
		if (game?.customization) {
			setFormData({
				primaryColor:
					game.customization.primaryColor || DEFAULT_COLORS.primaryColor,
				secondaryColor:
					game.customization.secondaryColor || DEFAULT_COLORS.secondaryColor,
				tertiaryColor:
					game.customization.tertiaryColor || DEFAULT_COLORS.tertiaryColor,
				quaternaryColor:
					game.customization.quaternaryColor || DEFAULT_COLORS.quaternaryColor,
				customLogoUrl: game.customization.customLogoUrl || '',
				customLogoLink: game.customization.customLogoLink || '',
			})
		}
	}, [game?.customization])

	const updateGameMutation = useMutation({
		mutationFn: async (customization: GameCustomization) => {
			const result = await updateGame({
				gameId: id!,
				updates: {}, // Empty updates object since we're only updating customization
				customization,
			})
			return result.data
		},
		onSuccess: () => {
			// Always invalidate user games list
			queryClient.invalidateQueries({ queryKey: ['getGamesByUser'] })

			// Smart invalidation: Only invalidate specific game query if customization changed
			// This prevents unnecessary Firestore reads when no actual changes occurred
			const currentCustomization = {
				primaryColor: formData.primaryColor,
				secondaryColor: formData.secondaryColor,
				tertiaryColor: formData.tertiaryColor,
				quaternaryColor: formData.quaternaryColor,
				customLogoUrl: formData.customLogoUrl,
			}

			const initialCustomization = game?.customization || {
				primaryColor: DEFAULT_COLORS.primaryColor,
				secondaryColor: DEFAULT_COLORS.secondaryColor,
				tertiaryColor: DEFAULT_COLORS.tertiaryColor,
				quaternaryColor: DEFAULT_COLORS.quaternaryColor,
				customLogoUrl: '',
			}

			// Check if customization actually changed
			const hasCustomizationChanged =
				currentCustomization.primaryColor !==
					initialCustomization.primaryColor ||
				currentCustomization.secondaryColor !==
					initialCustomization.secondaryColor ||
				currentCustomization.tertiaryColor !==
					initialCustomization.tertiaryColor ||
				currentCustomization.quaternaryColor !==
					initialCustomization.quaternaryColor ||
				currentCustomization.customLogoUrl !==
					initialCustomization.customLogoUrl

			if (hasCustomizationChanged) {
				// Invalidate the specific game query to force refetch with updated customization
				queryClient.invalidateQueries({ queryKey: [`game-${id}`] })
			}

			toast({
				title: 'Customization Saved',
				description: 'Your game customization has been applied successfully.',
			})
			// Navigate back to dashboard after successful save
			setLocation('/dashboard')
		},
		onError: (error) => {
			console.error('Failed to save customization:', error)
			toast({
				title: 'Error',
				description: 'Failed to save customization. Please try again.',
				variant: 'destructive',
			})
		},
	})

	const handleColorChange = (field: keyof CustomizationForm, value: string) => {
		// Sanitize the color value before setting it in state
		let sanitizedValue = value

		// If it's already a valid hex color, use it as-is
		if (isValidHexColor(value)) {
			sanitizedValue = value.startsWith('#') ? value : `#${value}`
		} else {
			// Try to convert other color formats to hex
			const hexColor = colorToHex(value)
			if (hexColor) {
				sanitizedValue = hexColor
			} else {
				// If conversion fails and it's an invalid color, use the current value as fallback
				// This prevents breaking the UI while allowing manual correction
				console.warn(
					`Invalid color value: ${value}, using current value as fallback`
				)
				sanitizedValue = formData[field]
			}
		}

		setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
	}

	const handlePresetSelect = (preset: (typeof COLOR_PRESETS)[0]) => {
		setFormData((prev) => ({
			...prev,
			primaryColor: preset.primary,
			secondaryColor: preset.secondary,
			tertiaryColor: preset.tertiary,
			quaternaryColor: preset.quaternary,
		}))
	}

	const handleLogoUpload = async (file: File) => {
		if (!file) return

		// Basic validation
		if (!file.type.startsWith('image/')) {
			toast({
				title: 'Invalid File',
				description: 'Please upload an image file.',
				variant: 'destructive',
			})
			return
		}

		if (file.size > 1 * 1024 * 1024) {
			// 1MB limit
			toast({
				title: 'File Too Large',
				description: 'Please upload an image smaller than 1MB.',
				variant: 'destructive',
			})
			return
		}

		try {
			// Create a temporary preview URL
			const objectUrl = URL.createObjectURL(file)
			setFormData((prev) => ({ ...prev, customLogoUrl: objectUrl }))

			// Check if storage is available
			if (!storage) {
				throw new Error(
					'Firebase Storage is not available. Please ensure the Storage emulator is running.'
				)
			}

			// Upload to Firebase Storage
			const storageRef = ref(storage, `game-logos/${id}/${file.name}`)
			const snapshot = await uploadBytes(storageRef, file)
			const downloadURL = await getDownloadURL(snapshot.ref)

			// Update form data with the permanent URL
			setFormData((prev) => ({ ...prev, customLogoUrl: downloadURL }))

			toast({
				title: 'Logo Uploaded',
				description: 'Logo has been uploaded successfully.',
			})
		} catch (error) {
			console.error('Logo upload failed:', error)

			let errorMessage = 'Failed to upload logo. Please try again.'
			if (error instanceof Error) {
				if (error.message.includes('Storage is not available')) {
					errorMessage =
						'Firebase Storage is not available. Please ensure the Storage emulator is running (npm run emulate).'
				} else if (error.message.includes('permission-denied')) {
					errorMessage =
						'Permission denied. Please check your Firebase Storage rules.'
				} else if (error.message.includes('network')) {
					errorMessage =
						'Network error. Please check your connection and try again.'
				}
			}

			toast({
				title: 'Upload Failed',
				description: errorMessage,
				variant: 'destructive',
			})
			// Reset the logo URL on error
			setFormData((prev) => ({ ...prev, customLogoUrl: '' }))
		}
	}

	const handleFileInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (file) {
			handleLogoUpload(file)
		}
	}

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		setIsDragOver(false)

		const files = event.dataTransfer.files
		if (files.length > 0) {
			const file = files[0]
			handleLogoUpload(file)
		}
	}

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		setIsDragOver(true)
	}

	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		setIsDragOver(false)
	}

	const handleSave = () => {
		const customization: GameCustomization = {
			primaryColor: formData.primaryColor,
			secondaryColor: formData.secondaryColor,
			tertiaryColor: formData.tertiaryColor,
			quaternaryColor: formData.quaternaryColor,
			customLogoUrl: formData.customLogoUrl,
			customLogoLink: formData.customLogoLink,
			isCustomized: true,
		}

		updateGameMutation.mutate(customization)
	}

	const handleReset = () => {
		setFormData({
			primaryColor: DEFAULT_COLORS.primaryColor,
			secondaryColor: DEFAULT_COLORS.secondaryColor,
			tertiaryColor: DEFAULT_COLORS.tertiaryColor,
			quaternaryColor: DEFAULT_COLORS.quaternaryColor,
			customLogoUrl: game?.customization?.customLogoUrl || '',
			customLogoLink: game?.customization?.customLogoLink || '',
		})
	}

	const handleBackToDashboard = () => {
		setLocation('/dashboard')
	}

	const handleStartEditing = () => {
		setEditedTitle(game?.gameTitle || '')
		setIsEditingTitle(true)
	}

	const handleCancelEditing = () => {
		setIsEditingTitle(false)
		setEditedTitle('')
	}

	const handleSaveTitle = async () => {
		if (!editedTitle.trim()) {
			toast({
				title: 'Error',
				description: 'Game title cannot be empty.',
				variant: 'destructive',
			})
			return
		}

		try {
			const result = await updateGame({
				gameId: id!,
				updates: { gameTitle: editedTitle.trim() },
				customization: undefined,
			})

			// The updateGame function should succeed if there's no error
			// Invalidate the game query to refetch with updated title
			queryClient.invalidateQueries({ queryKey: [`game-${id}`] })
			setIsEditingTitle(false)
			toast({
				title: 'Title Updated',
				description: 'Game title has been updated successfully.',
			})
		} catch (error) {
			console.error('Failed to update game title:', error)
			toast({
				title: 'Error',
				description: 'Failed to update game title. Please try again.',
				variant: 'destructive',
			})
		}
	}

	if (gameLoading) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading game customization...</p>
				</div>
			</div>
		)
	}

	if (gameError || !game) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center max-w-md mx-auto p-6'>
					<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6'>
						<h2 className='text-xl font-bold text-destructive mb-2'>
							Game Not Found
						</h2>
						<p className='text-foreground mb-4'>
							The game you're trying to customize could not be found.
						</p>
					</div>
					<Button onClick={handleBackToDashboard} variant='outline'>
						Return to Dashboard
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-[#fff] py-6 px-2'>
			{/* Header */}
			<div className='max-w-7xl mx-auto mb-6'>
				<div className='flex items-center justify-between'>
					<div className='flex flex-row items-center gap-4 w-full'>
						<Button
							variant='outline'
							size='sm'
							onClick={handleBackToDashboard}
							className={`hidden lg:flex ${buttonDefaultStyle}`}
						>
							<ArrowLeft className='h-4 w-4' />
							Back to Dashboard
						</Button>
						<div className='flex-1'>
							{isEditingTitle ? (
								<div className='flex items-center gap-2'>
									<Input
										value={editedTitle}
										onChange={(e) => setEditedTitle(e.target.value)}
										placeholder='Enter game title'
										className='text-xl h-10 bg-#f9fafc'
										autoFocus
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												handleSaveTitle()
											} else if (e.key === 'Escape') {
												handleCancelEditing()
											}
										}}
									/>
									<Button
										variant='outline'
										size='sm'
										onClick={handleSaveTitle}
										className={buttonDefaultStyle}
									>
										<Save className='h-4 w-4' />
									</Button>
									<Button
										variant='outline'
										size='sm'
										onClick={handleCancelEditing}
										className={buttonDefaultStyle}
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							) : (
								<h1 className='text-2xl font-bold flex items-center gap-2'>
									{game?.gameTitle || 'Game'}
									<Button
										variant='ghost'
										size='sm'
										onClick={handleStartEditing}
										className={`h-6 w-6 p-0 ${buttonDefaultStyle}`}
									>
										<Edit className='h-4 w-4' />
									</Button>
								</h1>
							)}
						</div>
						<Button
							variant='outline'
							size='icon'
							onClick={handleBackToDashboard}
							className={`ml-auto ${buttonDefaultStyle}`}
						>
							<X className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto'>
				{/* Main Content - Preview Only */}
				<div className='lg:col-span-2 space-y-6'>
					<div className='border border-stone-700 rounded-lg overflow-hidden'>
						<GamePreview
							primaryColor={formData.primaryColor}
							secondaryColor={formData.secondaryColor}
							tertiaryColor={formData.tertiaryColor}
							quaternaryColor={formData.quaternaryColor}
							customLogoUrl={formData.customLogoUrl}
						/>
					</div>
				</div>

				{/* Sidebar - Customization Controls */}
				<div className='lg:col-span-1 space-y-6 '>
					{/* Colors Section */}
					<div className='bg-white border border-stone-700 rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-4'>
							<h3 className='font-semibold'>Branding</h3>
						</div>
						<div className='space-y-4 mb-4'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<Palette className='h-4 w-4' />
									<h4 className='text-sm font-semibold '>Color Presets</h4>
								</div>
								<div className='grid grid-cols-4 gap-2 mb-4'>
									{COLOR_PRESETS.map((preset) => (
										<button
											key={preset.name}
											onClick={() => handlePresetSelect(preset)}
											className='p-1 border  rounded hover:border-primary transition-colors text-left text-xs'
										>
											<div className='flex gap-0.5 justify-around items-center'>
												<div
													className='w-6 h-6 rounded-full border-primary'
													style={{ backgroundColor: preset.primary }}
												/>
												{/* <div
													className='w-6 h-6 rounded-full border'
													style={{ backgroundColor: preset.secondary }}
												/> */}
												<div
													className='w-6 h-6 rounded-full border-background'
													style={{ backgroundColor: preset.tertiary }}
												/>
												<div
													className='w-6 h-6 rounded-full border-card'
													style={{ backgroundColor: preset.quaternary }}
												/>
											</div>
											{/* <span className='font-medium'>{preset.name}</span> */}
										</button>
									))}
								</div>
							</div>

							<div className='space-y-3  w-full'>
								{COLOR_FIELDS.map((field) => (
									<div
										key={field.id}
										className='gap-2 flex justify-between items-center'
									>
										<Label
											htmlFor={field.id}
											className='text-sm w-1/3 font-medium'
										>
											{field.label}
										</Label>
										<Input
											id={field.id}
											type='color'
											value={
												formData[field.id as keyof CustomizationForm] as string
											}
											onChange={(e) =>
												handleColorChange(
													field.id as keyof CustomizationForm,
													e.target.value
												)
											}
											className='w-1/4 h-8 p-0.5 bg-white'
										/>
										<Input
											value={
												formData[field.id as keyof CustomizationForm] as string
											}
											onChange={(e) =>
												handleColorChange(
													field.id as keyof CustomizationForm,
													e.target.value
												)
											}
											placeholder={field.placeholder}
											className='text-xs w-2/3 p-1 h-8 bg-white'
										/>
									</div>
								))}
							</div>
						</div>

						<div className='space-y-4 border-t pt-4  mb-4'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<Image className='h-4 w-4' />
									<h4 className='text-sm font-semibold '>Logo</h4>
								</div>

								<div
									className={`border-2 border-dashed rounded-lg p-4 text-center bg-slate-100 transition-colors duration-200 ${
										isDragOver ? 'border-[#ef4444]' : 'border-gray-300'
									}`}
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
								>
									{formData.customLogoUrl ? (
										<div className='space-y-3'>
											<img
												src={formData.customLogoUrl}
												alt='Custom logo preview'
												className='max-h-20 mx-auto'
											/>
											<Button
												variant='outline'
												size='sm'
												onClick={() =>
													setFormData((prev) => ({
														...prev,
														customLogoUrl: '',
													}))
												}
												className='flex items-center gap-1 w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
											>
												<X className='h-3 w-3' />
												Remove Logo
											</Button>
										</div>
									) : (
										<div className='space-y-2'>
											<Upload className='h-6 w-6 text-muted-foreground  mx-auto' />
											<div>
												<Label
													htmlFor='logo-upload'
													className='cursor-pointer text-xs'
												>
													<span className='text-[#56492c] hover:underline font-semibold'>
														Click to upload
													</span>{' '}
													or drag and drop
												</Label>
												<p className='text-xs text-muted-foreground mt-1'>
													PNG, JPG up to 1MB
												</p>
											</div>
											<Input
												id='logo-upload'
												type='file'
												accept='image/*'
												onChange={handleFileInputChange}
												className='hidden'
											/>
										</div>
									)}
								</div>
							</div>
						</div>

						<div className='space-y-4 border-t pt-4  mb-4'>
							<div>
								<div className='flex items-center gap-2 mb-4'>
									<Link className='h-4 w-4' />
									<h4 className='text-sm font-semibold '>Logo Link</h4>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='logo-link' className='text-sm'>
										Logo Click-through URL
									</Label>
									<Input
										id='logo-link'
										type='url'
										value={formData.customLogoLink}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												customLogoLink: e.target.value,
											}))
										}
										placeholder='https://example.com'
										className='text-sm bg-white'
									/>
									<p className='text-xs text-muted-foreground'>
										Optional: Where users should go when clicking the logo
									</p>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='pt-4 border-t space-y-3'>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										onClick={handleReset}
										className={`w-full ${buttonDefaultStyle}`}
									>
										Reset to Defaults
									</Button>
									<Button
										variant='outline'
										onClick={handleBackToDashboard}
										className={`w-full ${buttonDefaultStyle}`}
									>
										Cancel
									</Button>
								</div>
								<Button
									onClick={handleSave}
									disabled={updateGameMutation.isPending}
									className='w-full bg-[#645331] text-white shadow-none hover:bg-[##57482b]'
								>
									<Save className='h-4 w-4 mr-2' />
									{updateGameMutation.isPending
										? 'Saving...'
										: 'Apply Customization'}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
