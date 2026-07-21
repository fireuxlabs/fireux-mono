// Concurrent edit — 2026-07-21 14:45 CEST — Dashboard Overview pass: share small presentation contracts across the three overview layers.

export type DashboardOverviewOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

export type DashboardOverviewProfileEntry = {
  profileId: string
  label: string
  icon?: string
  to: string
  active: boolean
}
