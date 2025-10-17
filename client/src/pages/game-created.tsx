import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
	CheckCircle,
	Play,
	Share2,
	BarChart3,
	Copy,
	QrCode,
	Edit3,
	Home,
	Plus,
	Palette,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import QRCode from 'qrcode'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PrizeEditModal } from '@/components/prize-edit-modal'
import type { Game } from '@shared/firebase-types'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth } from '@/lib/firebase'
import { getExistingPrizes } from '@/lib/game-utils'
import app from '@/lib/firebase'

export default function GameCreated() {
	const { id } = useParams<{ id: string }>()
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const [showQR, setShowQR] = useState(false)
	const [showShare, setShowShare] = useState(false)
	const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
	const [editingPrizes, setEditingPrizes] = useState<string | null>(null)
	const [initialPrizes, setInitialPrizes] = useState([
		{ placement: '1st Place', prize: '' },
		{ placement: '2nd Place', prize: '' },
		{ placement: '3rd Place', prize: '' },
	])

	const { data: game, isLoading } = useQuery<Game>({
		queryKey: [`game-${id}`],
		queryFn: async () => {
			const functions = getFunctions(app)
			const getGame = httpsCallable(functions, 'getGame')
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
		enabled: !!id,
	})

	const gameUrl = `${window.location.origin}/game/${id}`

	const copyGameUrl = () => {
		navigator.clipboard.writeText(gameUrl)
		toast({
			title: 'Copied!',
			description: 'Game URL copied to clipboard',
		})
	}

	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		toast({
			title: 'Copied!',
			description: `${label} copied to clipboard.`,
		})
	}

	const handleShare = async () => {
		const shareData = {
			title: `${game?.companyName} Trivia Challenge`,
			text: `Test your knowledge with the ${game?.companyName} trivia challenge!`,
			url: gameUrl,
		}

		if (navigator.share) {
			try {
				await navigator.share(shareData)
			} catch (error) {
				handleCopy(gameUrl, 'Game link')
			}
		} else {
			handleCopy(gameUrl, 'Game link')
		}
	}

	// Generate QR code when modal opens
	useEffect(() => {
		if (showQR && !qrCodeDataURL) {
			QRCode.toDataURL(gameUrl, {
				width: 256,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF',
				},
			})
				.then((dataURL) => {
					setQrCodeDataURL(dataURL)
				})
				.catch((err) => {
					console.error('Failed to generate QR code:', err)
				})
		}
	}, [showQR, gameUrl, qrCodeDataURL])

	const handleDownloadQR = () => {
		if (qrCodeDataURL) {
			const link = document.createElement('a')
			link.download = `${game?.companyName || 'game'}-qr-code.png`
			link.href = qrCodeDataURL
			link.click()
		}
	}

	const handleEditPrizes = () => {
		if (game) {
			const existingPrizes = getExistingPrizes(game)
			setInitialPrizes(existingPrizes)
			setEditingPrizes(id || null)
		}
	}

	if (isLoading) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading your game...</p>
				</div>
			</div>
		)
	}

	if (!game) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold mb-4'>Game not found</h2>
					<Button onClick={() => setLocation('/dashboard')}>
						<Home className='mr-2 h-4 w-4' />
						Go to Dashboard
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background py-8 items-center flex'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Success Header */}
				<div className='text-center mb-8'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4'>
						<CheckCircle className='h-8 w-8 text-primary-foreground' />
					</div>
					<h1 className='text-3xl font-bold text-primary mb-2'>
						Game Created Successfully!
					</h1>
					<p className='text-foreground'>
						Your trivia game is ready to engage visitors at your trade show.
					</p>
				</div>

				{/* Game Details Card - Enhanced styling to match game-card-enhanced */}
				<Card className='mb-8 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-2'>
					<CardHeader className='p-4'>
						<div className='flex justify-between flex-row'>
							<CardTitle
								title={game.companyName}
								className='font-bolds text-primary mb-1 mr-2'
							>
								{game.gameTitle || game.companyName}
							</CardTitle>
							<Badge
								title={game.industry}
								className='font-semibold max-w-[90%] truncate h-6 leading-normal inline'
							>
								{game.industry}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className='space-y-4 px-4'>
						{/* Game Details */}
						<div className='space-y-2 text-sm text-foreground'>
							<div className='flex items-center gap-2'>
								<span>Questions:</span>
								<div className='font-bold text-primary'>
									{game.questionCount}
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<span>Difficulty:</span>
								<div className='font-bold text-primary capitalize'>
									{game.difficulty}
								</div>
							</div>
						</div>

						{game.categories.length > 0 && (
							<div className='flex flex-wrap gap-1'>
								{game.categories.map((category, index) => (
									<Badge key={index} variant='secondary' className='text-xs'>
										{category}
									</Badge>
								))}
							</div>
						)}

						{game.productDescription && (
							<div className='pt-2'>
								<p className='text-muted-foreground text-sm'>
									{game.productDescription}
								</p>
							</div>
						)}

						{game.prizes &&
							Array.isArray(game.prizes) &&
							game.prizes.length > 0 && (
								<div className='flex border-primary rounded-sm bg-primary/10 px-2'>
									Prizes:
									<ul className='text-xs flex flex-col flex-wrap w-2/3 p-1 mx-2'>
										{game.prizes.map((prize, index) => (
											<li key={index} className='mr-2'>
												<strong>{prize.placement}</strong>: {prize.prize}
											</li>
										))}
									</ul>
								</div>
							)}

						{/* Action Buttons - Enhanced styling to match game-card-enhanced */}
						<div className='space-y-2 mb-4'>
							{/* Customization Action */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={() => setLocation(`/game-customization/${game.id}`)}
									data-testid={`button-customize-game-${game.id}`}
									aria-label={`Customize appearance for ${game.companyName}`}
								>
									<Palette className='mr-1 h-4 w-4' />
									Customize
								</Button>
								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={handleEditPrizes}
									data-testid='button-edit-prizes'
								>
									{game.prizes &&
									Array.isArray(game.prizes) &&
									game.prizes.length > 0 ? (
										<>
											<Edit3 className='mr-1 h-4 w-4' /> Edit Prizes
										</>
									) : (
										<>
											<Plus className='mr-1 h-4 w-4' /> Add
										</>
									)}{' '}
									Prizes
								</Button>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={() => setLocation(`/game/${id}`)}
									data-testid='button-play-game'
								>
									<Play className='mr-2 h-4 w-4' />
									Play Game
								</Button>
								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={() => setLocation(`/edit-questions/${id}`)}
									data-testid='button-edit-questions'
								>
									<Edit3 className='mr-1 h-4 w-4' />
									Edit Questions
								</Button>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={() => setShowShare(true)}
									data-testid='button-share-embed'
								>
									<Share2 className='mr-1 h-4 w-4' />
									Share & Embed
								</Button>

								<Button
									variant='outline'
									className='w-full'
									size='sm'
									onClick={() => setShowQR(true)}
									data-testid='button-qr-code'
								>
									<QrCode className='mr-1 h-4 w-4' />
									QR Code
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* QR Code Modal */}
				<Dialog open={showQR} onOpenChange={setShowQR}>
					<DialogContent className='sm:max-w-md'>
						<DialogHeader>
							<DialogTitle>Game QR Code</DialogTitle>
						</DialogHeader>
						<div className='space-y-4'>
							<div className='text-center'>
								<p className='text-sm text-muted-foreground mb-4'>
									Scan this QR code to play: {game?.companyName}
								</p>
								{qrCodeDataURL ? (
									<div className='bg-white p-4 rounded-lg inline-block'>
										<img
											src={qrCodeDataURL}
											alt='QR Code'
											className='w-64 h-64'
											data-testid='qr-code-image'
										/>
									</div>
								) : (
									<div className='w-64 h-64 bg-muted rounded-lg flex items-center justify-center mx-auto'>
										<div className='text-center'>
											<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2'></div>
											<p className='text-sm text-muted-foreground'>
												Generating QR code...
											</p>
										</div>
									</div>
								)}
							</div>

							<div className='text-center space-y-2'>
								<p className='text-xs text-muted-foreground'>
									Game URL: {gameUrl}
								</p>
								<Button
									onClick={handleDownloadQR}
									disabled={!qrCodeDataURL}
									className='w-full'
									data-testid='button-download-qr'
								>
									<Copy className='mr-2 h-4 w-4' />
									Download QR Code
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Share & Embed Modal */}
				<Dialog open={showShare} onOpenChange={setShowShare}>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle>Share {game?.companyName} Trivia</DialogTitle>
						</DialogHeader>

						<Tabs defaultValue='link' className='w-full'>
							<TabsList className='grid w-full grid-cols-2'>
								<TabsTrigger value='link'>Share Link</TabsTrigger>
								<TabsTrigger value='embed'>Embed Code</TabsTrigger>
							</TabsList>

							<TabsContent value='link' className='space-y-4'>
								<div>
									<Label htmlFor='shareUrl'>Share URL</Label>
									<div className='flex gap-2 mt-1'>
										<Input
											id='shareUrl'
											value={gameUrl}
											readOnly
											className='flex-1'
										/>
										<Button
											variant='outline'
											size='icon'
											onClick={() => handleCopy(gameUrl, 'Share link')}
										>
											<Copy className='h-4 w-4' />
										</Button>
									</div>
								</div>

								<div className='flex gap-2'>
									<Button onClick={handleShare} className='flex-1'>
										<Share2 className='mr-2 h-4 w-4' />
										Share Link
									</Button>
								</div>

								<div className='text-sm text-muted-foreground'>
									Share this link to let others play the trivia game
								</div>
							</TabsContent>

							<TabsContent value='embed' className='space-y-4'>
								<div>
									<Label htmlFor='embedCode'>Embed Code</Label>
									<div className='flex gap-2 mt-1'>
										<Textarea
											id='embedCode'
											value={`<iframe src="${gameUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`}
											readOnly
											rows={3}
											className='flex-1 font-mono text-sm'
										/>
										<Button
											variant='outline'
											size='icon'
											onClick={() =>
												handleCopy(
													`<iframe src="${gameUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`,
													'Embed code'
												)
											}
										>
											<Copy className='h-4 w-4' />
										</Button>
									</div>
								</div>

								<div className='bg-muted p-4 rounded-lg'>
									<div className='flex items-center gap-2 mb-2'>
										<Edit3 className='h-4 w-4 text-primary' />
										<span className='font-medium text-foreground'>
											How to use:
										</span>
									</div>
									<ul className='text-sm text-muted-foreground space-y-1'>
										<li>• Copy the embed code above</li>
										<li>• Paste it into your website's HTML</li>
										<li>• The trivia game will appear on your page</li>
										<li>• Customize width and height as needed</li>
									</ul>
								</div>
							</TabsContent>
						</Tabs>
					</DialogContent>
				</Dialog>

				{/* Prize Edit Modal */}
				<PrizeEditModal
					open={!!editingPrizes}
					onOpenChange={() => setEditingPrizes(null)}
					gameId={editingPrizes}
					initialPrizes={initialPrizes}
					onPrizesUpdated={() => {
						// Refresh the game data to show updated prizes immediately
						queryClient.invalidateQueries({ queryKey: [`game-${id}`] })
					}}
				/>
			</div>
		</div>
	)
}
