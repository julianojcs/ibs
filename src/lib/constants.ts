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

export const COUNTRIES = [
    "Brazil",
    "Argentina",
    "Australia",
    "Belize",
    "Bolivia",
    "Canada",
    "Chile",
    "Colombia",
    "Costa Rica",
    "Ecuador",
    "El Salvador",
    "France",
    "French Guiana",
    "Germany",
    "Guatemala",
    "Guyana",
    "Honduras",
    "Italy",
    "Mexico",
    "Nicaragua",
    "Panama",
    "Paraguay",
    "Peru",
    "Portugal",
    "Spain",
    "Suriname",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Venezuela",
    "Other"
] as const
