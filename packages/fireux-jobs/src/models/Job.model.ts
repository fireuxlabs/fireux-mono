export interface Job {
  id: string
  employerId: string
  title: string
  description?: string
  location?: string
  salary?: string
  createdAt: Date | string
  updatedAt?: Date | string
  // Add more fields as needed
}
