export interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  location: {
    address: string
    city: string
    state: string
    country: string
    remote: boolean
  }
  salary: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  }
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship'
  category: string
  tags: string[]
  postedBy: string // employer user ID
  postedAt: Date
  expiresAt: Date
  status: 'active' | 'paused' | 'closed' | 'filled'
  applicationsCount: number
  viewsCount: number
}

export interface JobApplication {
  id: string
  jobId: string
  applicantId: string // job seeker user ID
  appliedAt: Date
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  coverLetter: string
  resume?: {
    url: string
    filename: string
  }
  customFields?: Record<string, any>
  employerNotes?: string
  reviewedAt?: Date
  reviewedBy?: string
}

export interface Employer {
  id: string
  userId: string
  companyName: string
  companyDescription: string
  industry: string
  website?: string
  logo?: string
  contactEmail: string
  contactPhone?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  verified: boolean
  rating: number
  reviewsCount: number
  jobsPosted: number
  createdAt: Date
}

export interface JobSeeker {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio: string
  skills: string[]
  experience: {
    years: number
    level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  }
  education: {
    degree: string
    field: string
    school: string
    year: number
  }[]
  resume?: {
    url: string
    filename: string
    uploadedAt: Date
  }
  portfolio?: {
    url: string
    title: string
  }[]
  preferences: {
    employmentTypes: string[]
    salaryMin: number
    salaryMax: number
    locations: string[]
    remote: boolean
    categories: string[]
  }
  availability: 'immediately' | 'two-weeks' | 'one-month' | 'negotiable'
  createdAt: Date
  lastActive: Date
}

export interface JobSearchFilters {
  query?: string
  category?: string
  location?: string
  remote?: boolean
  employmentType?: string
  salaryMin?: number
  salaryMax?: number
  company?: string
  tags?: string[]
  postedWithin?: 'day' | 'week' | 'month' | 'all'
}

export interface JobSearchResult {
  jobs: Job[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
