import { collection, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import type { Job, JobStatus } from '../../../../../models/job.model.ts'

type CreateJobInput = {
  title?: string | null
  status?: JobStatus
}

type JobDraft = Pick<Job, 'id' | 'title' | 'tenant_id' | 'created_by' | 'status'>

function sanitizeString(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

export function useJobCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const { appId } = useFireUXConfig()

  const createJob = async (input: Partial<CreateJobInput>): Promise<string> => {
    const user = await useRequireUser()
    const resolvedTenantId = appId || 'global'
    const baseRef = doc(collection(db, 'jobs'))
    const jobId = baseRef.id

    const title =
      sanitizeString(input.title ?? 'Untitled Job') || 'Untitled Job'
    const payload: JobDraft = {
      id: jobId,
      title,
      status: input.status ?? 'open',
      tenant_id: resolvedTenantId,
      created_by: user.uid,
    }

    await setDocument<JobDraft>('jobs', jobId, payload)
    return jobId
  }

  return { createJob }
}
