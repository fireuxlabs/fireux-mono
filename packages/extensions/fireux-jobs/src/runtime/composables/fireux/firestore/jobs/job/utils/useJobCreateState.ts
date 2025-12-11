import { useState } from '#imports'
import type { JobStatus } from '../../../../models/job.model.ts'

export type JobDraft = {
  title: string
  status: JobStatus
}

export type JobStatusMeta = {
  label: string
  description: string
  tone: 'neutral' | 'success' | 'warning' | 'info' | 'error'
}

export const defaultJobStatus: JobStatus = 'open'

export const jobStatusMeta = {
  open: {
    label: 'Open',
    description: 'Visible to professionals across FireUX and partner apps.',
    tone: 'success',
  },
  closed: {
    label: 'Closed',
    description: 'Hidden from talent but kept in your internal history.',
    tone: 'neutral',
  },
} as const satisfies Record<JobStatus, JobStatusMeta>

export const jobStatusOrder: JobStatus[] = ['open', 'closed']

export const jobStatusOptions = jobStatusOrder.map((value) => ({
  label: jobStatusMeta[value].label,
  value,
})) as ReadonlyArray<{ label: string; value: JobStatus }>

const createInitialDraft = (): JobDraft => ({
  title: '',
  status: defaultJobStatus,
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
    status: draft.status,
  }
}

export const validateJobDraft = (draft: JobDraft): string | null => {
  if (!draft.title.trim()) return 'Title is required'
  if (!draft.status) return 'Status is required'
  return null
}
