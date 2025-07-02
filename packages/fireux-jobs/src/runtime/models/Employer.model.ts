export interface Employer {
  uid: string // User ID of the employer (creator) - matches AppUser.uid
  // NOTE: Name/contact person info is fetched from AppUser - no duplication

  // Company identity
  companyName: string
  logoUrl?: string // Company logo (separate from personal AppUser avatar)
  contactEmail: string
  website?: string
  description?: string

  // Additional company details
  industry?: string
  companySize?: string
  foundedYear?: string
  address?: string
  phone?: string

  // Timestamps
  createdAt: Date | string
  updatedAt?: Date | string
  updated_at?: unknown // Required for Firestore updateDocument function
}
