import { collection, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser.ts'
import type { Job, JobStatus } from '../../../../../models/job.model.ts'

type CreateJobInput = {
  title: string
  description?: string | null
  notes?: string | null
  pay?: string | number | null
  status?: JobStatus
  date?: string | null
  start_time?: string | null
  end_time?: string | null
  location_id?: string | null
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
      notes: sanitizeString(input.notes) || null,
      pay: input.pay ?? null,
      status: input.status ?? 'draft',
      date: sanitizeString(input.date) || null,
      start_time: sanitizeString(input.start_time) || null,
      end_time: sanitizeString(input.end_time) || null,
      location_id: sanitizeString(input.location_id) || null,
      tenant_id: tenantId,
      created_by: user.uid,
    }

    await setDocument<JobDraft>('jobs', jobId, payload)
    return jobId
  }

  return { createJob }
}
