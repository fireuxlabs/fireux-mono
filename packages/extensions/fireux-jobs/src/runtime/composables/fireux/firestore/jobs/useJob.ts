import type { Ref } from 'vue'
import { useJobFetch } from './fetch/useJobFetch'
import { useJobComputed } from './utils/view/useJobComputed'
import { useJobInterface } from './utils/view/useJobInterface'
import { useJobState } from '../../jobs/create/useJobState'
import { useJobCreate } from './mutations/useJobCreate'
import { useJobUpdate } from './mutations/useJobUpdate'
import { useJobDelete } from './mutations/useJobDelete'
import { useJobPublish } from './mutations/useJobPublish'
import { useJobSeo } from './utils/useJobSeo'

export type { Job } from '../../../../models/job.model'

/**
 * FireUX stack family: Publishable root entity.
 * Entity: Job.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-jobs/docs/contract.md
 *
 * This file is the Job family entry seam for one explicit Job document.
 * Job create/post authoring state belongs to the Job family first; it should not live under Firestore unless it is persisted truth.
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
    ...useJobPublish(),
    ...useJobDelete(),
    useJobSeo,
  }
}
