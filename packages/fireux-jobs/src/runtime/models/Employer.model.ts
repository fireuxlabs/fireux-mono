export interface Employer {
  uid: string // User ID of the employer (creator)
  companyName: string
  contactEmail: string
  website?: string
  description?: string
  logoUrl?: string
  createdAt: Date | string
  updatedAt?: Date | string
  updated_at?: unknown // Required for Firestore updateDocument function
  // Add more fields as needed
}
