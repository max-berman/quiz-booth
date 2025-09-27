export function LoadingSpinner({
	message = 'Loading...',
}: {
	message?: string
}) {
	return (
		<div className='flex-1 flex flex-col items-center justify-center bg-background'>
			<div className='bg-card rounded-2xl shadow-xl p-12'>
				<div className='animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6'></div>
				<h3 className='text-2xl font-bold text-primary mb-4'>{message}</h3>
				<p className='text-foreground mb-4'>
					Our AI is creating custom questions based on your company
					information...
				</p>
				<div className='w-full bg-border rounded-full h-2'>
					<div className='bg-primary h-2 rounded-full w-3/4 animate-pulse'></div>
				</div>
				<p className='text-sm text-foreground mt-2'>
					This usually takes 10-15 seconds
				</p>
			</div>
		</div>
	)
}
