import { useState } from '#imports'

export type JobDraft = {
  title: string
  description: string
}

const DEFAULT_DRAFT: JobDraft = {
  title: 'Job Title',
  description: 'Job Description',
}

/**
 * FireUX stack family: Entity authoring helper.
 * Entity: Job.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-jobs/docs/contract.md
 *
 * This file owns local Job create/post preview state.
 * It is not persisted Firestore data and should move out of firestore/jobs.
 */
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
