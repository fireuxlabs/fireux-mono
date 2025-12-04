import type { ComputedRef } from 'vue'

export type DevHealthStatus = 'pass' | 'warn' | 'fail'
export type DevHealthScope =
  | 'runtime'
  | 'apps'
  | 'users'
  | 'profiles'
  | 'components'
export type DevHealthIssueSeverity = 'info' | 'warning' | 'error'

export interface DevHealthIssue {
  id: string
  message: string
  severity?: DevHealthIssueSeverity
  hint?: string
  context?: Record<string, unknown>
}

export interface DevHealthResult {
  id: string
  label: string
  description?: string
  status: DevHealthStatus
  summary: string
  issues: DevHealthIssue[]
  scopes?: DevHealthScope[]
  stats?: Record<string, number>
}

export interface DevHealthApi {
  checks: ComputedRef<DevHealthResult[]>
  getChecksForScope: (scope: DevHealthScope) => ComputedRef<DevHealthResult[]>
}
