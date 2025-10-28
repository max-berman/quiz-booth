import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle, AlertCircle } from 'lucide-react'

export default function AnalyticsTest() {
	const [testResults, setTestResults] = useState<{
		standardSnippetLoaded: boolean
		standardEventsSent: boolean
		customImplementationLoaded: boolean
		customEventsSent: boolean
	}>({
		standardSnippetLoaded: false,
		standardEventsSent: false,
		customImplementationLoaded: false,
		customEventsSent: false,
	})

	// Load standard Google Analytics snippet
	useEffect(() => {
		// Check if standard snippet is already loaded
		if (typeof window !== 'undefined' && (window as any).gtag) {
			setTestResults((prev) => ({ ...prev, standardSnippetLoaded: true }))
			return
		}

		// Load standard Google Analytics snippet
		const script1 = document.createElement('script')
		script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZL1DYTHSYJ'
		script1.async = true

		const script2 = document.createElement('script')
		script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZL1DYTHSYJ');
    `

		script1.onload = () => {
			setTestResults((prev) => ({ ...prev, standardSnippetLoaded: true }))
			console.log('Standard GA snippet loaded successfully')
		}

		script1.onerror = () => {
			console.error('Failed to load standard GA snippet')
		}

		document.head.appendChild(script1)
		document.head.appendChild(script2)
	}, [])

	// Test standard snippet events
	const testStandardSnippet = () => {
		if (typeof window !== 'undefined' && (window as any).gtag) {
			// Send multiple test events with different parameters
			;(window as any).gtag('event', 'test_event_standard', {
				event_category: 'test',
				event_label: 'standard_snippet_test',
				value: 1,
			})

			// Also send a page_view event
			;(window as any).gtag('event', 'page_view', {
				page_title: 'Analytics Test Page',
				page_location: window.location.href,
			})

			setTestResults((prev) => ({ ...prev, standardEventsSent: true }))
			console.log(
				'Standard snippet events sent: test_event_standard, page_view'
			)

			// Check for network requests
			console.log('Checking for Google Analytics network requests...')
			console.log(
				'Look for requests to: google-analytics.com, googletagmanager.com'
			)
		}
	}

	// Test custom implementation
	const testCustomImplementation = () => {
		if (typeof window !== 'undefined' && (window as any).gtag) {
			// Send multiple test events with different parameters
			;(window as any).gtag('event', 'test_event_custom', {
				event_category: 'test',
				event_label: 'custom_implementation_test',
				value: 1,
			})

			// Send a custom event with more parameters
			;(window as any).gtag('event', 'custom_game_event', {
				game_id: 'test-game-123',
				action: 'test_action',
				category: 'analytics_test',
			})

			setTestResults((prev) => ({ ...prev, customEventsSent: true }))
			console.log(
				'Custom implementation events sent: test_event_custom, custom_game_event'
			)
		}
	}

	// Check dataLayer status
	const checkDataLayer = () => {
		if (typeof window !== 'undefined') {
			console.log('Current dataLayer:', (window as any).dataLayer)
			console.log('gtag function type:', typeof (window as any).gtag)
		}
	}

	return (
		<div className='container mx-auto p-6 max-w-4xl'>
			<Card>
				<CardHeader>
					<CardTitle>Google Analytics Test Page</CardTitle>
					<p className='text-sm text-muted-foreground'>
						This page tests both standard Google Analytics snippet and custom
						implementation
					</p>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Status Section */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Test Status</h3>
						<div className='grid grid-cols-2 gap-4'>
							<div className='flex items-center justify-between p-4 border rounded-lg'>
								<span>Standard Snippet Loaded</span>
								{testResults.standardSnippetLoaded ? (
									<Badge variant='default' className='flex items-center gap-1'>
										<CheckCircle className='h-3 w-3' />
										Yes
									</Badge>
								) : (
									<Badge
										variant='destructive'
										className='flex items-center gap-1'
									>
										<AlertCircle className='h-3 w-3' />
										No
									</Badge>
								)}
							</div>
							<div className='flex items-center justify-between p-4 border rounded-lg'>
								<span>Standard Events Sent</span>
								{testResults.standardEventsSent ? (
									<Badge variant='default' className='flex items-center gap-1'>
										<CheckCircle className='h-3 w-3' />
										Yes
									</Badge>
								) : (
									<Badge variant='outline'>Not Tested</Badge>
								)}
							</div>
							<div className='flex items-center justify-between p-4 border rounded-lg'>
								<span>Custom Implementation</span>
								<Badge variant='default' className='flex items-center gap-1'>
									<CheckCircle className='h-3 w-3' />
									Active
								</Badge>
							</div>
							<div className='flex items-center justify-between p-4 border rounded-lg'>
								<span>Custom Events Sent</span>
								{testResults.customEventsSent ? (
									<Badge variant='default' className='flex items-center gap-1'>
										<CheckCircle className='h-3 w-3' />
										Yes
									</Badge>
								) : (
									<Badge variant='outline'>Not Tested</Badge>
								)}
							</div>
						</div>
					</div>

					{/* Test Actions */}
					<div className='space-y-4'>
						<h3 className='font-semibold'>Test Actions</h3>
						<div className='grid grid-cols-2 gap-4'>
							<Button
								onClick={testStandardSnippet}
								disabled={!testResults.standardSnippetLoaded}
								className='flex items-center gap-2'
							>
								<Play className='h-4 w-4' />
								Test Standard Snippet
							</Button>
							<Button
								onClick={testCustomImplementation}
								className='flex items-center gap-2'
							>
								<Play className='h-4 w-4' />
								Test Custom Implementation
							</Button>
							<Button
								onClick={checkDataLayer}
								variant='outline'
								className='col-span-2'
							>
								Check DataLayer Status
							</Button>
						</div>
					</div>

					{/* Instructions */}
					<div className='space-y-2 text-sm text-muted-foreground'>
						<p>
							<strong>Instructions:</strong>
						</p>
						<p>1. Wait for "Standard Snippet Loaded" to show "Yes"</p>
						<p>2. Click "Test Standard Snippet" to send a test event</p>
						<p>
							3. Click "Test Custom Implementation" to send another test event
						</p>
						<p>4. Check Google Analytics Real-Time report for events</p>
						<p>
							5. Use "Check DataLayer Status" to see current events in console
						</p>
					</div>

					{/* Debug Information */}
					<div className='space-y-2 text-sm'>
						<p>
							<strong>Debug Information:</strong>
						</p>
						<p>
							Measurement ID: <code>G-ZL1DYTHSYJ</code>
						</p>
						<p>
							Standard Event: <code>test_event_standard</code>
						</p>
						<p>
							Custom Event: <code>test_event_custom</code>
						</p>
						<p>Check browser console for detailed logs</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
