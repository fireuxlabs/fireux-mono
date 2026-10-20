import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type ProjectStatus = 'active' | 'inactive' | 'archived'
export type ProjectIdentity = {
  status: ProjectStatus
  name: string
  description: string
  image_url: string
}

export type Project = {
  id: string
  /** Internal operator background; excluded from public projections. */
  context?: string
  identity: ProjectIdentity
  /** Exact anonymous create/resume authority; separate from membership access. */
  guest_owner_uid?: string
  created: {
    at: FirebaseTimestamp
    by?: string
    app_id?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}

/** Public profile only; never anonymous authority or audit provenance. */
export type ProjectPublicSummary = Pick<Project, 'id' | 'identity'>
