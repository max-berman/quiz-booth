import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Palette,
	Image,
	Eye,
	Save,
	X,
	Upload,
	Sparkles,
	Crown,
} from 'lucide-react'
import { GamePreview } from './game-preview'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { Game, GameCustomization } from '@shared/firebase-types'

interface GameCustomizationModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	game: Game
	canCustomize?: boolean
}

interface CustomizationForm {
	primaryColor: string
	secondaryColor: string
	tertiaryColor: string
	quaternaryColor: string
	customLogoUrl: string
}

const DEFAULT_COLORS = {
	primaryColor: '#3b82f6', // Blue
	secondaryColor: '#8b5cf6', // Purple
	tertiaryColor: '#f1f5f9', // Light gray
	quaternaryColor: '#fef3c7', // Light yellow for cards
}

const COLOR_FIELDS = [
	{
		id: 'primaryColor',
		label: 'Primary Color',
		placeholder: '#3b82f6',
	},
	{
		id: 'secondaryColor',
		label: 'Secondary Color',
		placeholder: '#8b5cf6',
	},
	{
		id: 'tertiaryColor',
		label: 'Background Color',
		placeholder: '#f1f5f9',
	},
	{
		id: 'quaternaryColor',
		label: 'Card Color',
		placeholder: '#fef3c7',
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
]

export function GameCustomizationModal({
	open,
	onOpenChange,
	game,
	canCustomize = true,
}: GameCustomizationModalProps) {
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { updateGame } = useFirebaseFunctions()

	const [activeTab, setActiveTab] = useState('colors')
	const [formData, setFormData] = useState<CustomizationForm>({
		primaryColor:
			game.customization?.primaryColor || DEFAULT_COLORS.primaryColor,
		secondaryColor:
			game.customization?.secondaryColor || DEFAULT_COLORS.secondaryColor,
		tertiaryColor:
			game.customization?.tertiaryColor || DEFAULT_COLORS.tertiaryColor,
		quaternaryColor:
			game.customization?.quaternaryColor || DEFAULT_COLORS.quaternaryColor,
		customLogoUrl: game.customization?.customLogoUrl || '',
	})

	const updateGameMutation = useMutation({
		mutationFn: async (customization: GameCustomization) => {
			const result = await updateGame({
				gameId: game.id,
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
			onOpenChange(false)
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
			const storageRef = ref(storage, `game-logos/${game.id}/${file.name}`)
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
		if (!canCustomize) {
			toast({
				title: 'Premium Feature',
				description:
					'Game customization is available in our Professional plan.',
				variant: 'destructive',
			})
			return
		}

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

	const previewStyles = {
		'--primary-color': formData.primaryColor,
		'--secondary-color': formData.secondaryColor,
		'--tertiary-color': formData.tertiaryColor,
	} as React.CSSProperties

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-4xl max-h-[90vh]  overflow-x-hidden'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Palette className='h-5 w-5' />
						Customize Game Appearance
						{!canCustomize && (
							<Badge variant='secondary' className='ml-2'>
								<Crown className='h-3 w-3 mr-1' />
								Premium
							</Badge>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-full'>
					{/* Customization Controls */}
					<div className='lg:col-span-2 space-y-6 '>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							{/* Colors Tab */}
							<TabsContent value='colors' className='space-y-6 '>
								<div>
									<div className=''>
										<GamePreview
											primaryColor={formData.primaryColor}
											secondaryColor={formData.secondaryColor}
											tertiaryColor={formData.tertiaryColor}
											quaternaryColor={formData.quaternaryColor}
											customLogoUrl={formData.customLogoUrl}
										/>
									</div>
								</div>
							</TabsContent>

							{/* Branding Tab */}
							<TabsContent value='branding' className='space-y-6'>
								<div>
									<h3 className='text-lg font-semibold mb-4'>Custom Logo</h3>
									<div className='space-y-4'>
										<div className='border-2 border-dashed border-border rounded-lg p-6 text-center'>
											{formData.customLogoUrl ? (
												<div className='space-y-4'>
													<img
														src={formData.customLogoUrl}
														alt='Custom logo preview'
														className='max-h-32 mx-auto'
													/>
													<Button
														variant='outline'
														onClick={() =>
															setFormData((prev) => ({
																...prev,
																customLogoUrl: '',
															}))
														}
														className='flex items-center gap-2'
													>
														<X className='h-4 w-4' />
														Remove Logo
													</Button>
												</div>
											) : (
												<div className='space-y-3'>
													<Upload className='h-8 w-8 text-muted-foreground mx-auto' />
													<div>
														<Label
															htmlFor='logo-upload'
															className='cursor-pointer'
														>
															<span className='text-primary hover:underline'>
																Click to upload
															</span>{' '}
															or drag and drop
														</Label>
														<p className='text-sm text-muted-foreground mt-1'>
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
							</TabsContent>

							{/* Preview Tab */}
							<TabsContent value='preview' className='space-y-6'>
								<div>
									<h3 className='text-lg font-semibold mb-4'>Live Preview</h3>
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
							</TabsContent>
						</Tabs>
					</div>

					{/* Sidebar */}
					<div className='lg:col-span-1'>
						<div>
							<h3 className='text-lg font-semibold mb-4'>Color Presets</h3>
							<div className='grid grid-cols-2 gap-3 mb-6'>
								{COLOR_PRESETS.map((preset) => (
									<button
										key={preset.name}
										onClick={() => handlePresetSelect(preset)}
										className='p-3 border rounded-lg hover:border-primary transition-colors text-left'
									>
										<div className='flex items-center gap-3 mb-2'>
											<div className='flex gap-1'>
												<div
													className='w-6 h-6 rounded border'
													style={{ backgroundColor: preset.primary }}
												/>
												<div
													className='w-6 h-6 rounded border'
													style={{ backgroundColor: preset.secondary }}
												/>
												<div
													className='w-6 h-6 rounded border'
													style={{ backgroundColor: preset.tertiary }}
												/>
												<div
													className='w-6 h-6 rounded border'
													style={{ backgroundColor: preset.quaternary }}
												/>
											</div>

											<span className='text-sm font-medium'>{preset.name}</span>
										</div>
									</button>
								))}
							</div>
						</div>
						<div className='space-y-4'>
							{COLOR_FIELDS.map((field) => (
								<div key={field.id}>
									<Label htmlFor={field.id} className='text-base font-medium'>
										{field.label}
									</Label>
									<div className='flex gap-3 mt-2'>
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
											className='w-20 h-10 p-1'
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
											className='w-auto'
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className='flex justify-between items-center'>
					<div className='text-sm text-muted-foreground'>
						Changes will be applied to all players of this game.
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={updateGameMutation.isPending || !canCustomize}
						>
							<Save className='h-4 w-4 mr-2' />
							Save Changes
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
