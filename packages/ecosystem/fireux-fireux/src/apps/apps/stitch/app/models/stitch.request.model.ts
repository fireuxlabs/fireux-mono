import type { Timestamp } from 'firebase/firestore'

export const STITCH_REQUEST_COLLECTION = 'stitch_requests'
export const STITCH_REQUEST_BUDGET_TYPES = ['hourly', 'fixed', 'retainer'] as const
export const STITCH_REQUEST_STATUSES = ['open', 'paused', 'closed'] as const

export type StitchRequestBudgetType = (typeof STITCH_REQUEST_BUDGET_TYPES)[number]
export type StitchRequestStatus = (typeof STITCH_REQUEST_STATUSES)[number]
export type StitchRequestTimestamp = Timestamp | Date | string | null

export interface StitchRequest {
  id: string
  title: string
  summary: string
  scope: string
  tags: string[]
  budget_type: StitchRequestBudgetType
  budget_min?: number
  budget_max?: number
  start_date?: StitchRequestTimestamp
  duration?: string
  timezone?: string
  status: StitchRequestStatus
  created_by_uid: string
  created_at: StitchRequestTimestamp
  updated_at: StitchRequestTimestamp
}

export type StitchRequestCreateInput = {
  title: string
  summary: string
  scope: string
  tags?: string[]
  budget_type?: StitchRequestBudgetType
  budget_min?: number
  budget_max?: number
  start_date?: string
  duration?: string
  timezone?: string
  status?: StitchRequestStatus
}

export type StitchRequestUpdateInput = Partial<StitchRequestCreateInput>

export const STITCH_REQUEST_BUDGET_TYPE_OPTIONS = STITCH_REQUEST_BUDGET_TYPES.map((type) => ({ label: type, value: type }))
export const STITCH_REQUEST_STATUS_OPTIONS = STITCH_REQUEST_STATUSES.map((status) => ({ label: status, value: status }))

export function createStitchRequestDraft(): StitchRequestCreateInput {
  return {
    title: '',
    summary: '',
    scope: '',
    tags: [],
    budget_type: 'hourly',
    budget_min: undefined,
    budget_max: undefined,
    start_date: '',
    duration: '',
    timezone: '',
    status: 'open',
  }
}
