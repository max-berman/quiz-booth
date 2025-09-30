import { useState } from 'react'
import { useParams, Link } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Users, Trophy, Clock, Mail } from 'lucide-react'
import type { Player, Game } from '@shared/schema'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth } from '@/lib/firebase'
import { formatTime } from '@/lib/time-utils'
import { formatDateTime } from '@/lib/date-utils'

export default function Submissions() {
	const { id } = useParams()

	const { data: game } = useQuery<Game>({
		queryKey: [`game-${id}`],
		enabled: !!id,
		queryFn: async () => {
			const functions = getFunctions()
			const getGame = httpsCallable(functions, 'getGame')
			const result = await getGame({ gameId: id })
			return result.data as Game
		},
	})

	const {
		data: players = [],
		isLoading,
		error,
	} = useQuery<Player[]>({
		queryKey: [`game-${id}-players`],
		enabled: !!id && !!auth.currentUser,
		queryFn: async () => {
			const functions = getFunctions()
			const getGamePlayers = httpsCallable(functions, 'getGamePlayers')
			const result = await getGamePlayers({ gameId: id })
			return result.data as Player[]
		},
	})

	const downloadCSV = () => {
		const headers = [
			'Name',
			'Email',
			'Score',
			'Correct Answers',
			'Total Questions',
			'Time Spent (s)',
			'Completion Time',
		]
		const csvData = players.map((player) => [
			player.name,
			player.company || '', // Email is stored in company field
			player.score,
			player.correctAnswers,
			player.totalQuestions,
			player.timeSpent,
			player.completedAt ? formatDateTime(player.completedAt.toString()) : '',
		])

		const csvContent = [headers, ...csvData]
			.map((row) => row.map((field: any) => `"${field}"`).join(','))
			.join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `${game?.companyName}-trivia-submissions.csv`
		link.click()
		window.URL.revokeObjectURL(url)
	}

	const stats = {
		totalPlayers: players.length,
		avgScore:
			players.length > 0
				? Math.round(
						players.reduce((sum, p) => sum + p.score, 0) / players.length
				  )
				: 0,
		avgTime:
			players.length > 0
				? Math.round(
						players.reduce((sum, p) => sum + p.timeSpent, 0) / players.length
				  )
				: 0,
		topScore: players.length > 0 ? Math.max(...players.map((p) => p.score)) : 0,
	}

	if (isLoading) {
		return (
			<div className='flex-1 bg-gray-50 py-8'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='animate-pulse'>
						<div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
						<div className='h-64 bg-gray-200 rounded'></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex-1 bg-gray-50 py-8'>
				<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
					<Card className='border-red-200 bg-red-50'>
						<CardContent className='p-8 text-center'>
							<h2 className='text-2xl font-bold text-red-800 mb-4'>
								Access Denied
							</h2>
							<p className='text-red-700 mb-6'>
								{error.message ||
									"You don't have permission to view this data."}
							</p>
							<p className='text-sm text-red-600 mb-6'>
								Only the person who created this trivia game can view the
								submission data.
							</p>
							<Link href='/'>
								<Button variant='outline'>
									<ArrowLeft className='mr-2 h-4 w-4' />
									Back to Home
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								{game?.companyName} Trivia Submissions
							</h1>
							<p className='text-gray-600'>
								Raw data from all player submissions
							</p>
						</div>
					</div>
					<Button onClick={downloadCSV} disabled={players.length === 0}>
						<Download className='mr-2 h-4 w-4' />
						Download CSV
					</Button>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center gap-2'>
								<Users className='h-5 w-5 text-blue-600' />
								<div>
									<p className='text-sm text-gray-600'>Total Players</p>
									<p className='text-2xl font-bold'>{stats.totalPlayers}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center gap-2'>
								<Trophy className='h-5 w-5 text-yellow-600' />
								<div>
									<p className='text-sm text-gray-600'>Average Score</p>
									<p className='text-2xl font-bold'>{stats.avgScore}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center gap-2'>
								<Clock className='h-5 w-5 text-green-600' />
								<div>
									<p className='text-sm text-gray-600'>Avg. Time</p>
									<p className='text-2xl font-bold'>
										{formatTime(stats.avgTime)}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className='p-4'>
							<div className='flex items-center gap-2'>
								<Trophy className='h-5 w-5 text-purple-600' />
								<div>
									<p className='text-sm text-gray-600'>Top Score</p>
									<p className='text-2xl font-bold'>{stats.topScore}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Submissions Table */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Mail className='h-5 w-5' />
							All Submissions ({players.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{players.length === 0 ? (
							<div className='text-center py-8'>
								<Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
								<p className='text-gray-500'>No submissions yet</p>
								<p className='text-sm text-gray-400'>
									Players who complete the trivia will appear here
								</p>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Score</TableHead>
											<TableHead>Correct/Total</TableHead>
											<TableHead>Time Spent</TableHead>
											<TableHead>Completed</TableHead>
											<TableHead>Performance</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{players.map((player: Player, index: number) => {
											const percentage = Math.round(
												(player.correctAnswers / player.totalQuestions) * 100
											)
											const performanceColor =
												percentage >= 80
													? 'bg-green-100 text-green-800'
													: percentage >= 60
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-red-100 text-red-800'

											return (
												<TableRow key={index}>
													<TableCell className='font-medium'>
														{player.name}
													</TableCell>
													<TableCell>
														{player.company || 'Not provided'}
													</TableCell>
													<TableCell className='font-bold'>
														{player.score}
													</TableCell>
													<TableCell>
														{player.correctAnswers}/{player.totalQuestions}
													</TableCell>
													<TableCell>{formatTime(player.timeSpent)}</TableCell>
													<TableCell>
														{player.completedAt
															? formatDateTime(player.completedAt.toString())
															: 'Unknown'}
													</TableCell>
													<TableCell>
														<Badge className={performanceColor}>
															{percentage}%
														</Badge>
													</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
