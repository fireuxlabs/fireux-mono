import type { FirebaseTimestamp } from '../../../types/firebase'

export type ProjectStatus = 'active' | 'inactive' | 'archived'

export type Project = {
  id: string
  status: ProjectStatus
  name: string
  description: string
  image_url: string
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
