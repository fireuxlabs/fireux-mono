import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './stamps.model'

export interface FireuxConsoleAccess {
  operator_ids: string[]
}

export interface FireuxAppAccessRecord
  extends FireuxStamped,
    FireuxConsoleAccess {
  id: string
  team_ids: string[]
  join_requests: string[]
}

export const FireuxConsoleAccessDefaults: FireuxConsoleAccess = {
  operator_ids: [],
}

export const FireuxAppAccessRecordDefaults: FireuxAppAccessRecord = {
  id: '',
  ...FireuxConsoleAccessDefaults,
  team_ids: [],
  join_requests: [],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
    app_id: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}
