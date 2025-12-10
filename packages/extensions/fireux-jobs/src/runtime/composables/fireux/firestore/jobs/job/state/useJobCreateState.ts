import { useState } from '#imports'

export type JobDraft = Record<string, unknown>

export function useJobCreateState() {
  const jobDraft = useState<JobDraft>('job-create-draft', () => ({}))

  const setDraft = (draft: JobDraft) => {
    jobDraft.value = draft
  }

  return { jobDraft, setDraft }
}
