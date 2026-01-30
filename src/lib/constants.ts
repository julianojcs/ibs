// User roles constants
export const USER_ROLES = {
	STUDENT: 'student',
	TEACHER: 'teacher',
	ADVISOR: 'advisor',
	COORDINATOR: 'coordinator',
	GUEST: 'guest',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Course types
export const COURSE_TYPES = {
	UNDERGRADUATE: 'undergraduate',
	POSTGRADUATE: 'postgraduate',
	SHORT_COURSE: 'short-course',
} as const

export type CourseType = typeof COURSE_TYPES[keyof typeof COURSE_TYPES]
