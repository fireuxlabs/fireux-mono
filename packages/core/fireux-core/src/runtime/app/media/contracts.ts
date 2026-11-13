import type { AppImageKind } from './types'

export type AppMediaSyncFailure = {
  kind: AppImageKind
  message: string
}

export type AppMediaSyncResponse = {
  appId: string
  uploaded: Partial<Record<AppImageKind, string>>
  failed: AppMediaSyncFailure[]
}
