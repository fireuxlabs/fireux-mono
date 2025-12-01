import { collection, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreManager.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import type { Job, JobStatus } from '../../../../models/job.model.ts'

type CreateJobInput = {
  title: string
  description?: string | null
  pay?: string | number | null
  status?: JobStatus
}

type JobDraft = Partial<Job> &
  Pick<Job, 'id' | 'title' | 'tenant_id' | 'created_by'>

function sanitizeString(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

export function useJobCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const { appId } = useFireUXConfig()

  const createJob = async (input: Partial<CreateJobInput>): Promise<string> => {
    const user = await useRequireUser()
    const tenantId = appId || 'global'
    const baseRef = doc(collection(db, 'jobs'))
    const jobId = baseRef.id

    const title =
      sanitizeString(input.title ?? 'Untitled Job') || 'Untitled Job'
    const descriptionValue = sanitizeString(input.description)

    const payload: JobDraft = {
      id: jobId,
      title,
      description: descriptionValue ? descriptionValue : null,
      pay: input.pay ?? null,
      status: input.status ?? 'draft',
      tenant_id: tenantId,
      created_by: user.uid,
    }

    await setDocument<JobDraft>('jobs', jobId, payload)
    return jobId
  }

  return { createJob }
}
