import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, MessageSquare, User, Send } from 'lucide-react'
import app from '@/lib/firebase'

// Contact form validation schema
const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(1, 'Please select a subject'),
	message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const SUBJECT_OPTIONS = [
	{ value: 'general', label: 'General Inquiry' },
	{ value: 'support', label: 'Technical Support' },
	{ value: 'partnership', label: 'Partnership' },
	{ value: 'bug', label: 'Bug Report' },
	{ value: 'feature', label: 'Feature Request' },
	{ value: 'other', label: 'Other' },
]

export default function Contact() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { toast } = useToast()

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
		reset,
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			name: '',
			email: '',
			subject: '',
			message: '',
		},
	})

	const selectedSubject = watch('subject')

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true)

		try {
			// Import the Firebase function
			const { getFunctions, httpsCallable } = await import('firebase/functions')
			const functions = getFunctions(app)

			const sendContactForm = httpsCallable(functions, 'sendContactForm')

			const result = await sendContactForm(data)

			toast({
				title: 'Message Sent!',
				description: "Thank you for your message. We'll get back to you soon.",
				variant: 'default',
			})

			reset()
		} catch (error) {
			console.error('Failed to send message:', error)
			toast({
				title: 'Failed to Send',
				description:
					'There was an error sending your message. Please try again.',
				variant: 'destructive',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<Helmet>
				<title>Contact Us - QuizBooth</title>
				<meta
					name='description'
					content="Get in touch with the QuizBooth team. We're here to help with technical support, partnerships, feature requests, and any questions you may have."
				/>
				<meta property='og:title' content='Contact Us - QuizBooth' />
				<meta
					property='og:description'
					content='Contact the QuizBooth team for support, partnerships, and inquiries about our AI-powered trivia platform.'
				/>
				<meta property='og:url' content='https://quizbooth.games/contact' />
				<link rel='canonical' href='https://quizbooth.games/contact' />
			</Helmet>

			<div className='flex-1 flex flex-col'>
				{/* Hero Section */}
				<section className='relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10'>
					<div className='max-w-4xl mx-auto text-center'>
						<div className='mb-8'>
							<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-6'>
								Contact <span className='text-primary'>QuizBooth</span>
							</h1>
							<p className='text-xl text-foreground max-w-2xl mx-auto leading-relaxed'>
								Have questions, feedback, or need support? We'd love to hear
								from you. Get in touch with our team and we'll get back to you
								as soon as possible.
							</p>
						</div>
					</div>
				</section>

				{/* Contact Form Section */}
				<section className='py-12 px-2 lg:px-8'>
					<div className='max-w-2xl mx-auto'>
						<Card className='lg:shadow-sm '>
							<CardHeader className='text-center'>
								<CardTitle className='flex items-center justify-center gap-2 text-2xl'>
									<MessageSquare className='h-6 w-6 text-primary' />
									Send us a Message
								</CardTitle>
								<CardDescription>
									Fill out the form below and we'll respond within 24 hours
								</CardDescription>
							</CardHeader>
							<CardContent className='p-2 md:p-6'>
								<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
									{/* Name Field */}
									<div className='space-y-2'>
										<Label htmlFor='name' className='flex items-center gap-2'>
											<User className='h-4 w-4' />
											Full Name
										</Label>
										<Input
											id='name'
											placeholder='Enter your full name'
											{...register('name')}
											className={errors.name ? 'border-destructive' : ''}
										/>
										{errors.name && (
											<p className='text-sm text-destructive'>
												{errors.name.message}
											</p>
										)}
									</div>

									{/* Email Field */}
									<div className='space-y-2'>
										<Label htmlFor='email' className='flex items-center gap-2'>
											<Mail className='h-4 w-4' />
											Email Address
										</Label>
										<Input
											id='email'
											type='email'
											placeholder='your.email@example.com'
											{...register('email')}
											className={errors.email ? 'border-destructive' : ''}
										/>
										{errors.email && (
											<p className='text-sm text-destructive'>
												{errors.email.message}
											</p>
										)}
									</div>

									{/* Subject Field */}
									<div className='space-y-2'>
										<Label htmlFor='subject'>Subject</Label>
										<Select
											value={selectedSubject}
											onValueChange={(value) => setValue('subject', value)}
										>
											<SelectTrigger
												className={errors.subject ? 'border-destructive' : ''}
											>
												<SelectValue placeholder='Select a subject' />
											</SelectTrigger>
											<SelectContent>
												{SUBJECT_OPTIONS.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.subject && (
											<p className='text-sm text-destructive'>
												{errors.subject.message}
											</p>
										)}
									</div>

									{/* Message Field */}
									<div className='space-y-2'>
										<Label htmlFor='message'>Message</Label>
										<Textarea
											id='message'
											placeholder='Tell us how we can help you...'
											rows={6}
											{...register('message')}
											className={errors.message ? 'border-destructive' : ''}
										/>
										{errors.message && (
											<p className='text-sm text-destructive'>
												{errors.message.message}
											</p>
										)}
									</div>

									{/* Submit Button */}
									<Button
										type='submit'
										className='w-full'
										disabled={isSubmitting}
										size='lg'
									>
										{isSubmitting ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												Sending...
											</>
										) : (
											<>
												<Send className='mr-2 h-4 w-4' />
												Send Message
											</>
										)}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Additional Contact Information */}
						<div className='mt-12 grid grid-cols-1 md:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Mail className='h-5 w-5 text-primary' />
										Email Support
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-foreground'>
										For direct support, you can also email us at:
									</p>
									<a
										href='mailto:contact@quizbooth.games'
										className='text-primary hover:underline font-medium'
										onClick={(e) => {
											e.preventDefault()
											// Obfuscate email to avoid spam crawlers
											const domain = 'quizbooth.games'
											const user = 'contact'
											window.location.href = `mailto:${user}@${domain}`
										}}
									>
										contact<span style={{ display: 'none' }}>remove-this</span>
										@quizbooth.games
									</a>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<MessageSquare className='h-5 w-5 text-primary' />
										Response Time
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-foreground'>
										We typically respond to all inquiries within 24 hours during
										business days. For urgent matters, please indicate in your
										message.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}
