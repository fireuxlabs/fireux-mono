export interface Employer {
  uid: string // User ID of the employer (creator)
  companyName: string
  contactEmail: string
  website?: string
  description?: string
  logoUrl?: string
  createdAt: Date | string
  updatedAt?: Date | string
  // Add more fields as needed
}
