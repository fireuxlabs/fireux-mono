import type { Ref } from 'vue'
import type { Job } from '../types/job.model.ts'
import { useJobCollection } from './firestore/jobs/main/useJobCollection.ts'
import { useJobEnsure } from './firestore/jobs/main/useJobEnsure.ts'
import { useJobUpdate as baseUseJobUpdate } from './firestore/jobs/main/useJobUpdate.ts'
import { useJob as baseUseJob } from './firestore/jobs/useJob.ts'

export { useJobFetch } from './firestore/jobs/main/useJobFetch.ts'

export function useJobsList() {
  return useJobCollection()
}

export function useJobCreate() {
  const { createDraftJob } = useJobEnsure()
  return {
    createDraftJob,
    create: createDraftJob,
  }
}

export function useJobUpdate(job: Ref<Job | null>) {
  return baseUseJobUpdate(job)
}

export function useJob(job: Ref<Job | null>) {
  return baseUseJob(job)
}
