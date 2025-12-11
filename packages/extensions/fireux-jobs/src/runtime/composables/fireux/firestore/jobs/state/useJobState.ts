import { useState } from '#imports'

export function useJobState() {
  //
  // 1. PREVIEW STATE
  //    Holds the raw form values only.
  //
  const preview = useState('job-create-preview', () => ({
    title: 'Job Title',
    description: 'Job Description',
  }))

  //
  // 2. COMMIT
  //    Returns the clean payload used by useJobCreate().
  //    Does NOT write to Firestore — that is the mutation’s job.
  //
  const commit = () => {
    const trim = (v: string) => v.trim()
    return {
      title: trim(preview.value.title) || 'Untitled Job',
      description: trim(preview.value.description),
    }
  }

  //
  // 3. RESET back to defaults
  //
  const reset = () => {
    preview.value = {
      title: '',
      description: '',
    }
  }

  return {
    preview,
    commit,
    reset,
  }
}