import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'vuefire'
import type { Job, JobCreateInput } from '../../../../../models/objects/job.model'

export const JobPayload = {
  id: '',
  app_id: '',
  created_by: '',
  posted_by_agent_id: '',
  company_id: '',
  place_id: '',
  kitchen_id: '',
  source: '',
  title: '',
  status: '',
  description: '',
}

export const JobStampOptions = {
  creator: true,
} as const

export function useJobCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()

  async function createJob(payload: JobCreateInput): Promise<{ created: boolean; id: string }> {
    if (!payload?.id) {
      throw new Error('Job id is required')
    }

    const ref = doc(db, 'jobs', payload.id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { created: false, id: payload.id }
    }

    const fireux = useFireUXConfig()
    const data = {
      ...payload,
      app_id: payload.app_id || fireux.appId,
    } satisfies Omit<Job, 'created_at' | 'updated_at' | 'creator_id'>

    await setDocument<Job>('jobs', payload.id, data as Job, {
      creator: true,
    })

    return { created: true, id: payload.id }
  }

  return { createJob }
}
