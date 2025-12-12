// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts
// NOTE for Copilot:
// - This composable OWNS job-create form state.
// - It is a FAKE create for now: submit() logs and returns a fake ID.
// - Only two fields exist for now: title + description.
// - When adding Firestore, update submit() to write the payload.

import { useState } from '#imports'
import type { Job } from '#fireux-jobs-models/job.model'

export type JobCreateForm = {
  title: string
  description: string
}

export function useJobCreate() {
  // Shared create form state (used by write + preview + submit)
  const form = useState<JobCreateForm>('jobs-create-form', () => ({
    title: '',
    description: '',
  }))

  const reset = () => {
    form.value = {
      title: '',
      description: '',
    }
  }

  const submit = async (): Promise<string> => {
    const trim = (v: string) => v.trim()

    const payload: Partial<Job> = {
      title: trim(form.value.title) || 'Hello world job',
      description: trim(form.value.description),
    }

    // Fake pipeline step: log only
    console.log('[jobs] FAKE createJob payload →', payload)

    // Fake ID so the page can still navigate to /jobs/:id
    const fakeId = `job-${Date.now()}`
    return fakeId
  }

  return {
    form,
    reset,
    submit,
  }
}
