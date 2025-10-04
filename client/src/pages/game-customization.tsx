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
} from 'lucide-react'
import { GamePreview } from '@/components/game-preview'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { Game, GameCustomization } from '@shared/firebase-types'

interface CustomizationForm {
	primaryColor: string
	secondaryColor: string
	tertiaryColor: string
	quaternaryColor: string
	customLogoUrl: string
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
		id: 'secondaryColor',
		label: 'Secondary',
		placeholder: '#e6e6e6',
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
]

const COLOR_PRESETS = [
	{
		name: 'Warm Orange',
		primary: '#ea580c',
		secondary: '#dc2626',
		tertiary: '#fff7ed',
		quaternary: '#ffedd5',
	},
	{
		name: 'Elegant Purple',
		primary: '#7c3aed',
		secondary: '#a855f7',
		tertiary: '#faf5ff',
		quaternary: '#f3e8ff',
	},
	{
		name: 'Corporate Gray',
		primary: '#475569',
		secondary: '#64748b',
		tertiary: '#f8fafc',
		quaternary: '#f1f5f9',
	},
	{
		name: 'Vibrant Teal',
		primary: '#0d9488',
		secondary: '#14b8a6',
		tertiary: '#f0fdfa',
		quaternary: '#ccfbf1',
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
	})

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
			queryClient.invalidateQueries({ queryKey: ['getGamesByUser'] })
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
		setFormData((prev) => ({ ...prev, [field]: value }))
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

	const handleLogoUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
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

	const handleSave = () => {
		const customization: GameCustomization = {
			primaryColor: formData.primaryColor,
			secondaryColor: formData.secondaryColor,
			tertiaryColor: formData.tertiaryColor,
			quaternaryColor: formData.quaternaryColor,
			customLogoUrl: formData.customLogoUrl,
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
			customLogoUrl: '',
		})
	}

	const handleBackToDashboard = () => {
		setLocation('/dashboard')
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
					<Button onClick={handleBackToDashboard} className='mt-4'>
						Return to Dashboard
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background p-6'>
			{/* Header */}
			<div className='max-w-7xl mx-auto mb-6'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<Button
							variant='outline'
							size='sm'
							onClick={handleBackToDashboard}
							className='flex items-center gap-2'
						>
							<ArrowLeft className='h-4 w-4' />
							Back to Dashboard
						</Button>
						<div>
							<h1 className='text-2xl font-bold flex items-center gap-2'>
								<Palette className='h-6 w-6' />
								Customize Game Appearance
							</h1>
						</div>
					</div>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
				{/* Main Content - Preview Only */}
				<div className='lg:col-span-2 space-y-6'>
					<div>
						<div className='border rounded-lg overflow-hidden'>
							<GamePreview
								primaryColor={formData.primaryColor}
								secondaryColor={formData.secondaryColor}
								tertiaryColor={formData.tertiaryColor}
								quaternaryColor={formData.quaternaryColor}
								customLogoUrl={formData.customLogoUrl}
							/>
						</div>
					</div>
				</div>

				{/* Sidebar - Customization Controls */}
				<div className='lg:col-span-1 space-y-6 '>
					{/* Colors Section */}
					<div className='bg-white border border-stone-700 rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-4'>
							<Image className='h-4 w-4' />
							<h3 className='font-semibold'>Branding</h3>
						</div>
						<div className='space-y-4'>
							<div>
								<h4 className='text-sm font-semibold mb-3'>Color Presets</h4>
								<div className='grid grid-cols-4 gap-2 mb-4'>
									{COLOR_PRESETS.map((preset) => (
										<button
											key={preset.name}
											onClick={() => handlePresetSelect(preset)}
											className='p-0.5 border rounded hover:border-[#ccc] transition-colors text-left text-xs'
										>
											<div className='flex gap-0.5 justify-around items-center'>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: preset.primary }}
												/>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: preset.secondary }}
												/>
												<div
													className='w-4 h-4 rounded border'
													style={{ backgroundColor: preset.tertiary }}
												/>
												<div
													className='w-4 h-4 rounded border'
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
											className='f text-xs w-1/3 p-1 h-8 bg-white'
										/>
									</div>
								))}
							</div>
						</div>

						<div className='flex items-center gap-2 mb-4'></div>
						<div className='space-y-4'>
							<div>
								<h4 className='text-sm font-semibold mb-3'>Logo</h4>
								<div className='border-2 border-dashed rounded-lg p-4 text-center bg-slate-100'>
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
												className='flex items-center gap-1 w-full'
											>
												<X className='h-3 w-3' />
												Remove Logo
											</Button>
										</div>
									) : (
										<div className='space-y-2'>
											<Upload className='h-6 w-6 text-muted-foreground mx-auto' />
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
												onChange={handleLogoUpload}
												className='hidden'
											/>
										</div>
									)}
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2 mb-4'></div>
						<div className='space-y-4'>
							{formData.customLogoUrl && (
								<div className='pt-4 border-t'>
									<p className='text-sm font-medium mb-2'>Logo Preview</p>
									<img
										src={formData.customLogoUrl}
										alt='Logo preview'
										className='max-h-16 mx-auto'
									/>
								</div>
							)}

							<div className='pt-4 border-t space-y-3'>
								<Button
									variant='outline'
									onClick={handleReset}
									className='w-full bg-[#fff7e6] hover:bg-[#fff7e6] border border-[#56492c]'
								>
									Reset to Defaults
								</Button>
								<Button
									variant='outline'
									onClick={handleBackToDashboard}
									className='w-full  bg-[#fff7e6] hover:bg-[#fff7e6] border border-[#56492c]'
								>
									Cancel
								</Button>{' '}
								<Button
									onClick={handleSave}
									disabled={updateGameMutation.isPending}
									className='w-full bg-[#56492c] hover:bg-[#56492c] border border-[#56492c]'
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
