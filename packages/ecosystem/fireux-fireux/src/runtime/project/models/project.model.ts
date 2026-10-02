import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type ProjectStatus = 'active' | 'inactive' | 'archived'

export type Project = {
  id: string
  status: ProjectStatus
  name: string
  description: string
  image_url: string
  /** Present only on the anonymous create/resume path; not membership access. */
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
