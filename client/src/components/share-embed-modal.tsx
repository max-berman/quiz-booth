import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Share, Code, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareEmbedModalProps {
	gameId?: string
	gameTitle?: string
	isBuilder?: boolean
}

export function ShareEmbedModal({
	gameId,
	gameTitle,
	isBuilder = false,
}: ShareEmbedModalProps) {
	const { toast } = useToast()
	const [isOpen, setIsOpen] = useState(false)

	const baseUrl = window.location.origin
	const gameUrl = gameId ? `${baseUrl}/game/${gameId}` : `${baseUrl}/setup`
	const embedCode = gameId
		? `<iframe src="${gameUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`
		: `<iframe src="${baseUrl}/setup" width="100%" height="700" frameborder="0" style="border-radius: 8px;"></iframe>`

	const handleCopy = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		toast({
			title: 'Copied!',
			description: `${label} copied to clipboard.`,
		})
	}

	const handleShare = async () => {
		const shareData = {
			title: isBuilder
				? 'Trade Show Trivia Builder'
				: `${gameTitle} Trivia Challenge`,
			text: isBuilder
				? 'Create engaging trivia games for your trade show booth with AI-powered questions!'
				: `Test your knowledge with the ${gameTitle} trivia challenge!`,
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

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Share className='mr-1 h-4 w-4' />
					{isBuilder ? 'Share Trivia Builder' : 'Share'}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl !bg-white !text-black border-4 !border-black shadow-2xl z-50'>
				<DialogHeader>
					<DialogTitle>
						{isBuilder ? 'Share Trivia Builder' : `Share ${gameTitle} Trivia`}
					</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue='link' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='link'>Share Link</TabsTrigger>
						{!isBuilder && <TabsTrigger value='embed'>Embed Code</TabsTrigger>}
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
							<Button onClick={handleShare} className='flex-1  !text-white '>
								<LinkIcon className='mr-2 h-4 w-4' />
								Share Link
							</Button>
						</div>

						<div className='text-sm text-muted-foreground'>
							{isBuilder
								? 'Share this link to let others create their own trivia games'
								: 'Share this link to let others play the trivia game'}
						</div>
					</TabsContent>

					{!isBuilder && (
						<TabsContent value='embed' className='space-y-4'>
							<div>
								<Label htmlFor='embedCode'>Embed Code</Label>
								<div className='flex gap-2 mt-1'>
									<Textarea
										id='embedCode'
										value={embedCode}
										readOnly
										rows={3}
										className='flex-1 font-mono text-sm'
									/>
									<Button
										variant='outline'
										size='icon'
										onClick={() => handleCopy(embedCode, 'Embed code')}
									>
										<Copy className='h-4 w-4' />
									</Button>
								</div>
							</div>

							<div className='bg-muted p-4 rounded-lg'>
								<div className='flex items-center gap-2 mb-2'>
									<Code className='h-4 w-4 text-primary' />
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
					)}
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
