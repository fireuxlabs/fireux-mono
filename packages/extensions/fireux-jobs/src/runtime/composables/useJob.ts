import type { Ref } from 'vue'
import type { Job } from '../types/job.model.ts'
import { useJobCollection } from './firestore/jobs/main/useJobCollection.ts'
import { useJobEnsure } from './firestore/jobs/main/useJobEnsure.ts'
import { useJobUpdate } from './firestore/jobs/main/useJobUpdate.ts'
import { useJob } from './firestore/jobs/useJob.ts'
import { useJobFetch } from './firestore/jobs/main/useJobFetch.ts'

/**
 * Aggregated helpers for Job composables.
 * Provides uniquely named wrappers so Nuxt auto-imports avoid duplicate bindings.
 */
export function useJobsCollection() {
  return useJobCollection()
}

export function useJobsList() {
  return useJobCollection()
}

export function useJobsEnsure() {
  return useJobEnsure()
}

export function useJobCreate() {
  const { createDraftJob } = useJobEnsure()
  return {
    createDraftJob,
    create: createDraftJob,
  }
}

export function useJobsUpdate(job: Ref<Job | null>) {
  return useJobUpdate(job)
}

export function useJobEditor(job: Ref<Job | null>) {
  return useJob(job)
}

export function useJobsFetch(jobId: Ref<string | null> | string) {
  return useJobFetch(jobId)
}
