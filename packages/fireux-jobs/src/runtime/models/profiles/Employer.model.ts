import type { Profile } from '../../../../../fireux-core/src/runtime/models/profiles/profile.model'

export interface Employer extends Profile {
  // NOTE: uid, created_at, updated_at inherited from Profile
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
}
