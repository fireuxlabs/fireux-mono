export interface Professional {
  uid: string // User ID of the professional
  displayName: string
  email: string
  bio?: string
  avatarUrl?: string
  skills?: string[]
  createdAt: Date | string
  updatedAt?: Date | string
  // Add more fields as needed
}
