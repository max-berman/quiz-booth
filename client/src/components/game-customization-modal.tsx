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
	customLogoUrl: string
}

const DEFAULT_COLORS = {
	primaryColor: '#3b82f6', // Blue
	secondaryColor: '#8b5cf6', // Purple
	tertiaryColor: '#f1f5f9', // Light gray
}

const COLOR_PRESETS = [
	{
		name: 'Professional Blue',
		primary: '#2563eb',
		secondary: '#7c3aed',
		tertiary: '#f8fafc',
	},
	{
		name: 'Modern Green',
		primary: '#059669',
		secondary: '#0d9488',
		tertiary: '#f0fdf4',
	},
	{
		name: 'Warm Orange',
		primary: '#ea580c',
		secondary: '#dc2626',
		tertiary: '#fff7ed',
	},
	{
		name: 'Elegant Purple',
		primary: '#7c3aed',
		secondary: '#a855f7',
		tertiary: '#faf5ff',
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
		}))
	}

	const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast({
				title: 'File Too Large',
				description: 'Please upload an image smaller than 5MB.',
				variant: 'destructive',
			})
			return
		}

		// In a real implementation, you would upload to Firebase Storage here
		// For now, we'll create a local URL for preview
		const objectUrl = URL.createObjectURL(file)
		setFormData((prev) => ({ ...prev, customLogoUrl: objectUrl }))

		toast({
			title: 'Logo Uploaded',
			description: 'Logo has been uploaded successfully.',
		})
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
			<DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
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
					<div className='lg:col-span-2 space-y-6 overflow-y-auto'>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className='grid w-full grid-cols-3'>
								<TabsTrigger value='colors' className='flex items-center gap-2'>
									<Palette className='h-4 w-4' />
									Colors
								</TabsTrigger>
								<TabsTrigger
									value='branding'
									className='flex items-center gap-2'
								>
									<Image className='h-4 w-4' />
									Branding
								</TabsTrigger>
								<TabsTrigger
									value='preview'
									className='flex items-center gap-2'
								>
									<Eye className='h-4 w-4' />
									Preview
								</TabsTrigger>
							</TabsList>

							{/* Colors Tab */}
							<TabsContent value='colors' className='space-y-6'>
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
													</div>
													<span className='text-sm font-medium'>
														{preset.name}
													</span>
												</div>
											</button>
										))}
									</div>
								</div>

								<div className='space-y-4'>
									<div>
										<Label
											htmlFor='primaryColor'
											className='text-base font-medium'
										>
											Primary Color
										</Label>
										<div className='flex gap-3 mt-2'>
											<Input
												id='primaryColor'
												type='color'
												value={formData.primaryColor}
												onChange={(e) =>
													handleColorChange('primaryColor', e.target.value)
												}
												className='w-20 h-10 p-1'
											/>
											<Input
												value={formData.primaryColor}
												onChange={(e) =>
													handleColorChange('primaryColor', e.target.value)
												}
												placeholder='#3b82f6'
												className='flex-1'
											/>
										</div>
									</div>

									<div>
										<Label
											htmlFor='secondaryColor'
											className='text-base font-medium'
										>
											Secondary Color
										</Label>
										<div className='flex gap-3 mt-2'>
											<Input
												id='secondaryColor'
												type='color'
												value={formData.secondaryColor}
												onChange={(e) =>
													handleColorChange('secondaryColor', e.target.value)
												}
												className='w-20 h-10 p-1'
											/>
											<Input
												value={formData.secondaryColor}
												onChange={(e) =>
													handleColorChange('secondaryColor', e.target.value)
												}
												placeholder='#8b5cf6'
												className='flex-1'
											/>
										</div>
									</div>

									<div>
										<Label
											htmlFor='tertiaryColor'
											className='text-base font-medium'
										>
											Background Color
										</Label>
										<div className='flex gap-3 mt-2'>
											<Input
												id='tertiaryColor'
												type='color'
												value={formData.tertiaryColor}
												onChange={(e) =>
													handleColorChange('tertiaryColor', e.target.value)
												}
												className='w-20 h-10 p-1'
											/>
											<Input
												value={formData.tertiaryColor}
												onChange={(e) =>
													handleColorChange('tertiaryColor', e.target.value)
												}
												placeholder='#f1f5f9'
												className='flex-1'
											/>
										</div>
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
															PNG, JPG up to 5MB
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
									<Card style={previewStyles} className='customization-preview'>
										<CardHeader className='bg-[var(--primary-color)] text-white'>
											<CardTitle className='flex items-center justify-between'>
												<span>Game Preview</span>
												{formData.customLogoUrl && (
													<img
														src={formData.customLogoUrl}
														alt='Custom logo'
														className='h-8'
													/>
												)}
											</CardTitle>
										</CardHeader>
										<CardContent className='p-4 space-y-4 bg-[var(--tertiary-color)]'>
											<div className='p-4 rounded-lg bg-white border border-[var(--secondary-color)]/20'>
												<h4 className='font-semibold text-[var(--primary-color)] mb-2'>
													Sample Question
												</h4>
												<p className='text-sm'>
													What is the capital of France?
												</p>
											</div>
											<div className='grid grid-cols-2 gap-2'>
												{['A', 'B', 'C', 'D'].map((letter) => (
													<button
														key={letter}
														className='p-3 rounded border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors'
													>
														Option {letter}
													</button>
												))}
											</div>
											<Button className='w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90'>
												Continue
											</Button>
										</CardContent>
									</Card>
								</div>
							</TabsContent>
						</Tabs>
					</div>

					{/* Live Preview Sidebar */}
					<div className='lg:col-span-1'>
						<Card className='sticky top-0'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Sparkles className='h-4 w-4' />
									Preview
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium'>Primary</span>
										<div
											className='w-6 h-6 rounded border'
											style={{ backgroundColor: formData.primaryColor }}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium'>Secondary</span>
										<div
											className='w-6 h-6 rounded border'
											style={{ backgroundColor: formData.secondaryColor }}
										/>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium'>Background</span>
										<div
											className='w-6 h-6 rounded border'
											style={{ backgroundColor: formData.tertiaryColor }}
										/>
									</div>
								</div>

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
										onClick={handleSave}
										disabled={updateGameMutation.isPending || !canCustomize}
										className='w-full'
									>
										<Save className='h-4 w-4 mr-2' />
										{updateGameMutation.isPending
											? 'Saving...'
											: 'Apply Customization'}
									</Button>

									<Button
										variant='outline'
										onClick={handleReset}
										className='w-full'
									>
										Reset to Defaults
									</Button>

									{!canCustomize && (
										<div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
											<p className='text-sm text-amber-800'>
												<strong>Premium Feature:</strong> Upgrade to customize
												your game appearance.
											</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
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
