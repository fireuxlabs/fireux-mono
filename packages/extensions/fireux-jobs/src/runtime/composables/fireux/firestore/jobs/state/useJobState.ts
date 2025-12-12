import { useState } from '#imports'

export type JobDraft = {
  title: string
  description: string
}

const DEFAULT_DRAFT: JobDraft = {
  title: 'Job Title',
  description: 'Job Description',
}

export function useJobState() {
  const preview = useState<JobDraft>('job-create-preview', () => ({
    ...DEFAULT_DRAFT,
  }))

  const commit = () => {
    const trim = (v: string) => v.trim()
    return {
      title: trim(preview.value.title) || 'Untitled Job',
      description: trim(preview.value.description),
    }
  }

  const reset = () => {
    preview.value = { ...DEFAULT_DRAFT }
  }

  return {
    preview,
    commit,
    reset,
  }
}