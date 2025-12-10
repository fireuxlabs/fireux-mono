import { useState } from '#imports'
import type { JobStatus } from '../../../../models/job.model'

export type JobDraft = {
  title: string
  description: string
  notes: string
  pay: string
  status: JobStatus
  date: string
  start_time: string
  end_time: string
  location_id: string
}

export type JobStatusMeta = {
  label: string
  description: string
  tone: 'neutral' | 'success' | 'warning' | 'info' | 'error'
}

export const defaultJobStatus: JobStatus = 'draft'

export const jobStatusMeta = {
  draft: {
    label: 'Draft',
    description: 'Keep iterating privately until the details look right.',
    tone: 'warning',
  },
  open: {
    label: 'Open',
    description: 'Visible to professionals across FireUX and partner apps.',
    tone: 'success',
  },
  scheduled: {
    label: 'Scheduled',
    description: 'A professional is pencilled in; confirm the plan with them.',
    tone: 'info',
  },
  in_progress: {
    label: 'In progress',
    description: 'Shift is underway; keep an eye on updates from talent.',
    tone: 'info',
  },
  completed: {
    label: 'Completed',
    description: 'Everything wrapped—record feedback and close out any tasks.',
    tone: 'neutral',
  },
  closed: {
    label: 'Closed',
    description: 'Hidden from talent but kept in your internal history.',
    tone: 'neutral',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Let talent know what changed so expectations stay clear.',
    tone: 'error',
  },
} as const satisfies Record<JobStatus, JobStatusMeta>

export const jobStatusOrder: JobStatus[] = [
  'draft',
  'open',
  'scheduled',
  'in_progress',
  'completed',
  'closed',
  'cancelled',
]

export const jobStatusOptions = jobStatusOrder.map((value) => ({
  label: jobStatusMeta[value].label,
  value,
})) as ReadonlyArray<{ label: string; value: JobStatus }>

const createInitialDraft = (): JobDraft => ({
  title: '',
  description: '',
  notes: '',
  pay: '',
  status: defaultJobStatus,
  date: '',
  start_time: '',
  end_time: '',
  location_id: '',
})

export function useJobCreateState() {
  const jobDraft = useState<JobDraft>('job-create-draft', createInitialDraft)

  const setDraft = (draft: Partial<JobDraft>) => {
    jobDraft.value = { ...jobDraft.value, ...draft }
  }

  const resetDraft = () => {
    jobDraft.value = createInitialDraft()
  }

  return { jobDraft, setDraft, resetDraft }
}

export const toJobPayload = (draft: JobDraft) => {
  const trim = (value: string) => value.trim()

  return {
    title: trim(draft.title) || 'Untitled Job',
    description: trim(draft.description) || null,
    notes: trim(draft.notes) || null,
    pay: trim(draft.pay) || null,
    status: draft.status,
    date: draft.date || null,
    start_time: draft.start_time || null,
    end_time: draft.end_time || null,
    location_id: draft.location_id || null,
  }
}

export const validateJobDraft = (draft: JobDraft): string | null => {
  if (!draft.title.trim()) return 'Title is required'
  if (!draft.status) return 'Status is required'
  return null
}
