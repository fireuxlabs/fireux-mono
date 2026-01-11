import type { Ref } from 'vue'
import { useJobFetch } from './fetch/useJobFetch'
import { useJobComputed } from './utils/view/useJobComputed'
import { useJobInterface } from './utils/view/useJobInterface'
import { useJobState } from './state/useJobState'
import { useJobCreate } from './mutations/useJobCreate'
import { useJobUpdate } from './mutations/useJobUpdate'
import { useJobDelete } from './mutations/useJobDelete'

export type { Job } from '../../../../models/job.model'

/**
 * useJob (canon)
 * - Fetches and manages a single Job document
 * - Takes an explicit jobId (string or Ref); there is no implicit default
 * - For collections, call useJobCollection() directly from its own composable
 *
 * Responsibilities:
 * - Fetch: useJobFetch(jobId) → { job, pending }
 * - Computed: useJobComputed(job, pending) → derived flags (status, ownership, etc.)
 * - Interface: useJobInterface(job) → card/pill props for UI
 * - Mutations: useJobCreate / useJobUpdate / useJobDelete
 * - State: useJobState() → local draft state for create/edit flows
 */
export function useJob(jobId: string | Ref<string | null | undefined>) {
  const { job, pending } = useJobFetch(jobId)

  return {
    job,
    pending,
    ...useJobComputed(job, pending),
    ...useJobInterface(),
    ...useJobState(),
    ...useJobCreate(),
    ...useJobUpdate(),
    ...useJobDelete(),
  }
}
