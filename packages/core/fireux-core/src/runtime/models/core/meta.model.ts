// FILE: packages/core/fireux-core/src/runtime/models/core/meta.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'

export interface FireuxTimestamps {
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export interface FireuxAuthored extends FireuxTimestamps {
  creator_id: string
}
