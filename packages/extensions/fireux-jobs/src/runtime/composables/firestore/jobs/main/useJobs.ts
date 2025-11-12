import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import type { Job, JobStatus } from '../../../../types/job.model.ts'

type CreateJobInput = Pick<Job, 'title' | 'description' | 'pay'> & {
  status?: JobStatus
}

export function useJobs() {
  const db = useFirestore()
  const { uid } = useAuth()
  const { appId } = useFireUXConfig()

  const createJob = async (
    payload: Partial<CreateJobInput> = {}
  ): Promise<string> => {
    if (!appId) throw new Error('[useJobs] Missing appId')
    if (!uid.value)
      throw new Error('[useJobs] User must be authenticated to create jobs')

    const jobsCollection = collection(db, 'apps', appId, 'jobs')
    const docRef = await addDoc(jobsCollection, {
      title: payload.title ?? 'Untitled Job',
      description: payload.description ?? null,
      pay: payload.pay ?? null,
      status: payload.status ?? 'draft',
      created_by: uid.value,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })

    return docRef.id
  }

  return {
    createJob,
  }
}
