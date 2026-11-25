import type { FirebaseTimestamp } from '../../../types/firebase'

export type FireuxStamps = {
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
