import { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'
import { firebaseAnalytics } from '@/lib/firebase-analytics'

interface QRCodeModalProps {
	gameId: string
	gameTitle?: string
}

export function QRCodeModal({ gameId, gameTitle }: QRCodeModalProps) {
	const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
	const [isOpen, setIsOpen] = useState(false)

	// Generate QR code when modal opens
	useEffect(() => {
		if (isOpen) {
			// Track QR code generation event
			firebaseAnalytics.trackGameShared({
				gameId,
				shareMethod: 'qr_code',
			})

			const gameUrl = `${window.location.origin}/game/${gameId}`
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
	}, [isOpen, gameId])

	const handleDownload = () => {
		if (qrCodeDataURL) {
			// Track QR code download event
			firebaseAnalytics.trackGameShared({
				gameId,
				shareMethod: 'qr_code',
				platform: 'download',
			})

			const link = document.createElement('a')
			link.download = `${gameTitle || 'game'}-qr-code.png`
			link.href = qrCodeDataURL
			link.click()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant='secondary'
					// size='sm'
					className='w-full'
					data-testid={`button-qr-code-${gameId}`}
				>
					<QrCode className='mr-1 h-4 w-4' />
					QR Code
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md   border-4  shadow-2xl z-50'>
				<DialogHeader>
					<DialogTitle>Game QR Code</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='text-center'>
						<p className='text-sm text-muted-foreground mb-4'>
							Scan this QR code to play: {gameTitle}
						</p>
						{qrCodeDataURL ? (
							<div className='  inline-block'>
								<img
									src={qrCodeDataURL}
									alt='QR Code'
									className='w-64 h-64'
									data-testid='qr-code-image'
								/>
							</div>
						) : (
							<div className='w-64 h-64  rounded-lg flex items-center justify-center mx-auto'>
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
							Game URL: {window.location.origin}/game/{gameId}
						</p>
						<Button
							onClick={handleDownload}
							disabled={!qrCodeDataURL}
							className='w-full'
							data-testid='button-download-qr'
						>
							<Download className='mr-2 h-4 w-4' />
							Download QR Code
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
