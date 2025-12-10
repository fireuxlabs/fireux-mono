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

export const jobStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Open', value: 'open' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

const createInitialDraft = (): JobDraft => ({
  title: '',
  description: '',
  notes: '',
  pay: '',
  status: 'draft',
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
