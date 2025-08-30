import type { FirestoreObject } from 'fireux-core/models/objects/object.model'
import type { FieldValue } from 'firebase/firestore'

/**
 * Job interface for job postings
 * Extends FirestoreObject for consistent CRUD operations
 */
export interface Job
  extends Omit<FirestoreObject, 'created_at' | 'updated_at'> {
  // Override timestamp fields to support FieldValue during creation
  created_at: string | Date | FieldValue
  updated_at: string | Date | FieldValue

  // Job-specific fields
  title: string
  description: string
  company: string
  location: string
  salary_range?: string
  employment_type:
    | 'full-time'
    | 'part-time'
    | 'contract'
    | 'freelance'
    | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  remote_friendly: boolean
  skills_required: string[]

  // Application details
  application_deadline?: string | Date
  application_email?: string
  application_url?: string

  // Status
  is_active: boolean
  is_featured?: boolean

  // Employer info (links to employer profile)
  employer_id: string
}
