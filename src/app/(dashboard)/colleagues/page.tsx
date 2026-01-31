'use client'

import { useState, useEffect, useCallback } from 'react'
import { Metadata } from 'next'
import { Search, Filter, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ColleagueCard } from '@/components/colleagues/colleague-card'
import { USER_ROLES } from '@/lib/constants'
import { useInView } from 'react-intersection-observer'

interface IUser {
	_id: string
	email: string
	name: string
	avatar?: string
	role: string
	courseName: string
	city: string
	country: string
	phone?: string
	whatsapp?: string
	linkedin?: string
	instagram?: string
	github?: string
	twitter?: string
	bio?: string
	emailVerified: boolean
}

interface PaginationData {
	page: number
	limit: number
	total: number
	totalPages: number
}

export default function ColleaguesPage() {
	const [colleagues, setColleagues] = useState<IUser[]>([])
	const [pagination, setPagination] = useState<PaginationData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isFetchingMore, setIsFetchingMore] = useState(false)
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState<string>('')
	const [page, setPage] = useState(1)

	const { ref, inView } = useInView()

	const fetchColleagues = useCallback(async (pageNum: number) => {
		if (pageNum === 1) setIsLoading(true)
		else setIsFetchingMore(true)

		try {
			const params = new URLSearchParams()
			if (search) params.set('search', search)
			if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter)
			params.set('page', pageNum.toString())
			params.set('limit', '12')

			const response = await fetch(`/api/users?${params}`)
			const data = await response.json()

			if (response.ok) {
				setColleagues((prev) => pageNum === 1 ? data.users : [...prev, ...data.users])
				setPagination(data.pagination)
			}
		} catch (err) {
			console.error('Failed to fetch colleagues:', err)
		} finally {
			setIsLoading(false)
			setIsFetchingMore(false)
		}
	}, [search, roleFilter])

	useEffect(() => {
		const debounce = setTimeout(() => {
			setColleagues([])
			setPage(1)
			fetchColleagues(1)
		}, 300)

		return () => clearTimeout(debounce)
	}, [search, roleFilter, fetchColleagues])

	useEffect(() => {
		if (inView && pagination && page < pagination.totalPages && !isFetchingMore && !isLoading) {
			const nextPage = page + 1
			setPage(nextPage)
			fetchColleagues(nextPage)
		}
	}, [inView, pagination, page, isFetchingMore, isLoading, fetchColleagues])

	const handleSearch = (value: string) => {
		setSearch(value)
	}

	const handleRoleFilter = (value: string) => {
		setRoleFilter(value)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Classmates</h1>
				<p className="text-muted-foreground">
					Connect with your IBS London colleagues
				</p>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by name..."
						className="pl-10"
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>

				<Select value={roleFilter} onValueChange={handleRoleFilter}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<Filter className="mr-2 h-4 w-4" />
						<SelectValue placeholder="Filter by role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All roles</SelectItem>
						{Object.values(USER_ROLES).map((role) => (
							<SelectItem key={role} value={role}>
								{role.charAt(0).toUpperCase() + role.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Grid */}
			{isLoading && page === 1 ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : colleagues.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No classmates found.</p>
				</div>
			) : (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{colleagues.map((colleague) => (
							<ColleagueCard key={colleague._id.toString()} colleague={colleague} />
						))}
					</div>

					{/* Loading sentinel */}
					<div ref={ref} className="py-8 flex justify-center">
						{isFetchingMore && (
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						)}
					</div>
				</>
			)}
		</div>
	)
}
