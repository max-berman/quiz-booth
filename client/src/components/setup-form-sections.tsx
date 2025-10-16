import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Building,
	Settings,
	Gift,
	Plus,
	X,
	CheckCircle,
	AlertCircle,
	Info,
	ChevronsUpDown,
	Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isWebsite } from '@/lib/website-utils'
import { INDUSTRY_OPTIONS } from '@shared/constants'

// Difficulty options
const DIFFICULTY_OPTIONS = [
	{ level: 'easy', label: 'Easy', desc: 'Basic questions' },
	{ level: 'medium', label: 'Medium', desc: 'Moderate difficulty' },
	{ level: 'hard', label: 'Hard', desc: 'Challenging questions' },
]

// Category options
const CATEGORY_OPTIONS = [
	{
		key: 'companyFacts',
		label: 'Company Facts',
		desc: 'Questions about your company',
	},
	{
		key: 'industryKnowledge',
		label: 'Industry Knowledge',
		desc: 'Questions about your industry',
	},
	{ key: 'funFacts', label: 'Fun Facts', desc: 'Entertaining trivia' },
	{ key: 'generalKnowledge', label: 'General Knowledge', desc: 'Broad topics' },
	{ key: 'other', label: 'Custom Questions', desc: 'Your specific topics' },
]

// Question count options
const QUESTION_COUNT_OPTIONS = [
	{ value: '5', label: '5 Questions (Quick)' },
	{ value: '10', label: '10 Questions (Standard)' },
	{ value: '15', label: '15 Questions (Extended)' },
]

interface FormData {
	companyName: string
	industry: string
	productDescription: string
	questionCount: string
}

interface Prize {
	placement: string
	prize: string
}

interface Categories {
	companyFacts: boolean
	industryKnowledge: boolean
	funFacts: boolean
	generalKnowledge: boolean
	other: boolean
}

interface SetupFormSectionsProps {
	formData: FormData
	categories: Categories
	difficulty: string
	customCategory: string
	customIndustry: string
	prizes: Prize[]
	focusedSection: number | null
	industryOpen: boolean
	isAuthenticated: boolean
	checkCompanyComplete: () => boolean
	checkSettingsComplete: () => boolean
	onFormDataChange: (updates: Partial<FormData>) => void
	onCustomCategoryChange: (value: string) => void
	onCustomIndustryChange: (value: string) => void
	onDifficultyChange: (level: string) => void
	onCategoryToggle: (key: keyof Categories) => void
	onIndustryOpenChange: (open: boolean) => void
	onAddPrize: () => void
	onRemovePrize: (index: number) => void
	onUpdatePrize: (index: number, field: keyof Prize, value: string) => void
	onFocusedSectionChange: (section: number | null) => void
	validationErrors?: Record<string, string>
	validationMessages?: Record<string, string>
}

/**
 * Company Information Section Component
 */
export function CompanyInformationSection({
	formData,
	customIndustry,
	focusedSection,
	industryOpen,
	checkCompanyComplete,
	onFormDataChange,
	onCustomIndustryChange,
	onIndustryOpenChange,
	onFocusedSectionChange,
	validationErrors = {},
	validationMessages = {},
}: Pick<
	SetupFormSectionsProps,
	| 'formData'
	| 'customIndustry'
	| 'focusedSection'
	| 'industryOpen'
	| 'checkCompanyComplete'
	| 'onFormDataChange'
	| 'onCustomIndustryChange'
	| 'onIndustryOpenChange'
	| 'onFocusedSectionChange'
	| 'validationErrors'
	| 'validationMessages'
>) {
	return (
		<section
			className={`p-4 lg:p-6 bg-popover rounded-xl border-2 transition-all border-accent ${
				focusedSection === 1 ? 'shadow-md ' : ''
			}`}
			onFocus={() => onFocusedSectionChange(1)}
			onBlur={() => onFocusedSectionChange(null)}
			tabIndex={0}
		>
			<div className='mb-6'>
				<h3 className='text-base md:text-xl font-bold text-foreground flex items-center'>
					<Building className='text-foreground mr-3 h-6 w-6' />
					Business Information
					{checkCompanyComplete() && (
						<CheckCircle className='ml-2 h-5 w-5 text-primary' />
					)}
				</h3>
			</div>

			<div className='grid md:grid-cols-2 gap-6'>
				<div>
					<Label htmlFor='companyName' className='text-base font-medium'>
						Company Name or Website *
					</Label>
					<Input
						id='companyName'
						placeholder='Enter company name or website URL'
						value={formData.companyName}
						onChange={(e) => onFormDataChange({ companyName: e.target.value })}
						className={`mt-2 h-12  ${
							formData.companyName.trim() ? 'border-primary' : 'border-border'
						}`}
						required
					/>
					{validationErrors.companyName && (
						<div className='flex items-start gap-2 mt-2 text-destructive'>
							<AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
							<p className='text-sm'>{validationErrors.companyName}</p>
						</div>
					)}
					{validationMessages.companyName && !validationErrors.companyName && (
						<div className='flex items-start gap-2 mt-2 text-primary'>
							<CheckCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
							<p className='text-sm'>{validationMessages.companyName}</p>
						</div>
					)}
					{!validationErrors.companyName && !validationMessages.companyName && (
						<div className='flex items-start gap-2 mt-2'>
							<Info className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
							<p className='text-sm text-muted-foreground'>
								Provide a website URL for more relevant AI-generated questions,
								or enter your company name.
							</p>
						</div>
					)}
				</div>

				<div>
					<Label htmlFor='industry' className='text-base font-medium'>
						Industry *
					</Label>
					<Popover open={industryOpen} onOpenChange={onIndustryOpenChange}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={industryOpen}
								className={`mt-2 h-12 w-full justify-between text-base ${
									formData.industry
										? 'border-primary'
										: 'border-border text-placeholder'
								}`}
							>
								{formData.industry
									? formData.industry
									: 'Select your industry...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput
									placeholder='Search industry...'
									className='h-9'
								/>
								<CommandList>
									<CommandEmpty>No industry found.</CommandEmpty>
									<CommandGroup>
										{INDUSTRY_OPTIONS.map((industry) => (
											<CommandItem
												key={industry}
												value={industry}
												onSelect={(currentValue) => {
													onFormDataChange({
														industry:
															currentValue === formData.industry
																? ''
																: currentValue,
													})
													onIndustryOpenChange(false)
												}}
											>
												{industry}
												<Check
													className={cn(
														'ml-auto',
														formData.industry === industry
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{formData.industry === 'Other' && (
					<div>
						<Label htmlFor='customIndustry' className='text-base font-medium'>
							Custom Industry *
						</Label>
						<Input
							id='customIndustry'
							placeholder='Enter your industry'
							value={customIndustry}
							onChange={(e) => onCustomIndustryChange(e.target.value)}
							className={`mt-2 h-12 text-base ${
								validationErrors.customIndustry
									? 'border-destructive'
									: customIndustry.trim()
									? 'border-primary'
									: 'border-border'
							}`}
							required
						/>
						{validationErrors.customIndustry && (
							<div className='flex items-start gap-2 mt-2 text-destructive'>
								<AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
								<p className='text-sm'>{validationErrors.customIndustry}</p>
							</div>
						)}
						{validationMessages.customIndustry &&
							!validationErrors.customIndustry && (
								<div className='flex items-start gap-2 mt-2 text-primary'>
									<CheckCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
									<p className='text-sm'>{validationMessages.customIndustry}</p>
								</div>
							)}
					</div>
				)}

				<div className='md:col-span-2'>
					<Label htmlFor='productDescription' className='text-base font-medium'>
						Product/Service Focus{' '}
						{!isWebsite(formData.companyName) ? '*' : '(Optional)'}
					</Label>
					<Textarea
						id='productDescription'
						placeholder='Briefly describe your main products or services (max 100 characters) ...'
						value={formData.productDescription}
						onChange={(e) =>
							onFormDataChange({
								productDescription: e.target.value.slice(0, 100),
							})
						}
						className={`mt-2  ${
							validationErrors.productDescription
								? 'border-destructive'
								: formData.productDescription.trim()
								? 'border-primary'
								: 'border-border'
						}`}
						rows={2}
					/>
					{validationErrors.productDescription && (
						<div className='flex items-start gap-2 mt-2 text-destructive'>
							<AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
							<p className='text-sm'>{validationErrors.productDescription}</p>
						</div>
					)}
					{validationMessages.productDescription &&
						!validationErrors.productDescription && (
							<div className='flex items-start gap-2 mt-2 text-primary'>
								<CheckCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
								<p className='text-sm'>
									{validationMessages.productDescription}
								</p>
							</div>
						)}
					{!validationErrors.productDescription &&
						!validationMessages.productDescription && (
							<div className='flex justify-between text-sm text-muted-foreground mt-1'>
								<span>Keep it brief for better AI performance</span>
								<span>{formData.productDescription.length}/100</span>
							</div>
						)}
				</div>
			</div>
		</section>
	)
}

/**
 * Game Settings Section Component
 */
export function GameSettingsSection({
	formData,
	categories,
	difficulty,
	customCategory,
	focusedSection,
	checkSettingsComplete,
	onFormDataChange,
	onDifficultyChange,
	onCategoryToggle,
	onCustomCategoryChange,
	onFocusedSectionChange,
}: Pick<
	SetupFormSectionsProps,
	| 'formData'
	| 'categories'
	| 'difficulty'
	| 'customCategory'
	| 'focusedSection'
	| 'checkSettingsComplete'
	| 'onFormDataChange'
	| 'onDifficultyChange'
	| 'onCategoryToggle'
	| 'onCustomCategoryChange'
	| 'onFocusedSectionChange'
>) {
	return (
		<section
			className={`p-4 lg:p-6 bg-popover rounded-xl  border-2 transition-all border-accent ${
				focusedSection === 2 ? 'shadow-md ' : ''
			}`}
			onFocus={() => onFocusedSectionChange(2)}
			onBlur={() => onFocusedSectionChange(null)}
			tabIndex={0}
		>
			<div className='mb-6'>
				<h3 className='text-base md:text-xl  font-bold text-foreground flex items-center'>
					<Settings className='text-foreground mr-3 h-6 w-6' />
					Game Settings
					{checkSettingsComplete() && (
						<CheckCircle className='ml-2 h-5 w-5 text-primary' />
					)}
				</h3>
			</div>

			<div className='grid md:grid-cols-2 gap-4'>
				<div>
					<Label htmlFor='questionCount' className='text-base font-medium'>
						Number of Questions
					</Label>
					<Select
						value={formData.questionCount}
						onValueChange={(value) =>
							onFormDataChange({ questionCount: value })
						}
					>
						<SelectTrigger
							className={`mt-2 h-12 text-base ${
								formData.questionCount ? 'border-primary' : 'border-border'
							}`}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{QUESTION_COUNT_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='text-base font-medium'>Difficulty Level</Label>
					<div className='grid grid-cols-3 gap-3 mt-3'>
						{DIFFICULTY_OPTIONS.map(({ level, label }) => (
							<Button
								key={level}
								type='button'
								variant={difficulty === level ? 'outline' : 'link'}
								className='h-8 flex flex-col hover:scale-100'
								onClick={() => onDifficultyChange(level)}
							>
								<span
									className={` ${
										difficulty === level ? 'font-bold' : 'font-medium'
									}`}
								>
									{label}
								</span>
							</Button>
						))}
					</div>
				</div>

				<div className='md:col-span-2'>
					<Label className='text-base font-medium'>Question Categories *</Label>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4  mt-3'>
						{CATEGORY_OPTIONS.map(({ key, label, desc }) => (
							<div
								key={key}
								className={`p-2 border rounded-lg transition-all ${
									categories[key as keyof typeof categories]
										? 'border-primary bg-background'
										: 'border-primary border-dashed hover:border-solid'
								}`}
							>
								<div className='flex items-start space-x-2'>
									<Checkbox
										id={key}
										className='mt-1'
										checked={categories[key as keyof typeof categories]}
										onCheckedChange={() =>
											onCategoryToggle(key as keyof Categories)
										}
									/>
									<label htmlFor={key} className='cursor-pointer flex-1'>
										<span className='font-bold'>{label}</span>
										<p className='text-sm text-muted-foreground'>{desc}</p>
									</label>
								</div>
							</div>
						))}
					</div>
					{categories.other && (
						<div className='mt-4 rounded-lg'>
							<Label htmlFor='customCategory' className='text-base font-medium'>
								Describe your custom questions *
							</Label>
							<Textarea
								id='customCategory'
								placeholder='e.g., questions about sustainable packaging, our company history, or specific product features'
								value={customCategory}
								onChange={(e) => onCustomCategoryChange(e.target.value)}
								className={`mt-2 ${
									customCategory.trim()
										? 'border-primary'
										: categories.other && !customCategory.trim()
										? 'border-destructive'
										: 'border-border'
								}`}
								rows={2}
							/>
							{categories.other && !customCategory.trim() && (
								<div className='flex items-center gap-2 mt-2 text-destructive'>
									<AlertCircle className='h-4 w-4' />
									<span className='text-sm'>
										Custom questions description is required when selecting
										Custom Questions category
									</span>
								</div>
							)}
						</div>
					)}
					{!Object.values(categories).some(Boolean) && (
						<div className='flex items-center gap-2 mt-2 text-destructive'>
							<AlertCircle className='h-4 w-4' />
							<span className='text-sm'>
								Please select at least one category
							</span>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

/**
 * Prize Settings Section Component
 */
export function PrizeSettingsSection({
	prizes,
	focusedSection,
	onAddPrize,
	onRemovePrize,
	onUpdatePrize,
	onFocusedSectionChange,
}: Pick<
	SetupFormSectionsProps,
	| 'prizes'
	| 'focusedSection'
	| 'onAddPrize'
	| 'onRemovePrize'
	| 'onUpdatePrize'
	| 'onFocusedSectionChange'
>) {
	return (
		<section
			className={`p-4 lg:p-6 bg-popover rounded-xl border-2 transition-all border-accent ${
				focusedSection === 3 ? 'shadow-md ' : ''
			}`}
			onFocus={() => onFocusedSectionChange(3)}
			onBlur={() => onFocusedSectionChange(null)}
			tabIndex={0}
		>
			<div className='flex flex-col md:flex-row justify-between mb-6'>
				<h3 className='text-base mb-2 md:mb-0 md:text-xl font-bold text-foreground flex items-center'>
					<Gift className='text-foreground mr-2 h-6 w-6' />
					Prize Information (Optional)
				</h3>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={onAddPrize}
					className='flex items-center gap-1 w-1/3 md:w-auto  self-end'
				>
					<Plus className='h-2 w-2' />
					Add Prize
				</Button>
			</div>

			<div className='space-y-4'>
				{prizes.map((prize, index) => (
					<div
						key={index}
						className='flex gap-3 items-end p-4  rounded-lg border'
					>
						<div className='flex-1'>
							<Label
								htmlFor={`placement-${index}`}
								className='text-base font-medium'
							>
								Placement
							</Label>
							<Input
								id={`placement-${index}`}
								placeholder='e.g., 1st Place, Top 10, etc.'
								value={prize.placement}
								onChange={(e) =>
									onUpdatePrize(index, 'placement', e.target.value)
								}
								className={`mt-2 h-10 ${
									prize.placement.trim() ? 'border-primary' : 'border-border'
								}`}
							/>
						</div>
						<div className='flex-1'>
							<Label
								htmlFor={`prize-${index}`}
								className='text-base font-medium'
							>
								Prize
							</Label>
							<Input
								id={`prize-${index}`}
								placeholder='e.g., $100 Gift Card'
								value={prize.prize}
								onChange={(e) => onUpdatePrize(index, 'prize', e.target.value)}
								className={`mt-2 h-10 ${
									prize.prize.trim() ? 'border-primary' : 'border-border'
								}`}
							/>
						</div>
						{prizes.length > 1 && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => onRemovePrize(index)}
								className='h-10 w-10 p-0'
							>
								<X className='h-2 w-2' />
							</Button>
						)}
					</div>
				))}
				<div className='flex items-start gap-2 p-4 bg-muted rounded-lg'>
					<Info className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
					<p className='text-sm text-primary'>
						Add prizes to motivate participation. You can customize placements
						(e.g., "4th Place", "Top 10", "Best Score") to match your event
						needs.
					</p>
				</div>
			</div>
		</section>
	)
}
