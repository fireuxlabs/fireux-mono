export interface Job {
  id: string
  employerId: string // References Employer.uid
  title: string
  description?: string
  location?: string
  salary?: string
  requirements?: string[]
  status: 'draft' | 'published' | 'closed' | 'filled'
  applications?: JobApplication[]
  applicantIds?: string[] // Array of Professional.uid who applied
  maxApplications?: number
  expiresAt?: Date | string
  createdAt: Date | string
  updatedAt?: Date | string
}

export interface JobApplication {
  id: string
  jobId: string
  professionalId: string // References Professional.uid
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  coverLetter?: string
  resumeUrl?: string
  appliedAt: Date | string
  reviewedAt?: Date | string
  notes?: string // Employer notes
}
