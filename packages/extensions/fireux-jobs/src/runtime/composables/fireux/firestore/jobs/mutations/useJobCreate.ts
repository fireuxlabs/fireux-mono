import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { ref } from 'vue'
import type { JobStatus } from '../../../../../models/objects/job.model'

export const JobPayload = {
  company_id: '',
  kitchen_id: '',
  title: '',
  status: 'open' as JobStatus,
  description: '',
}

export const JobStampOptions = {
  creator: true,
} as const

export type JobCreateForm = {
  company_id: string
  kitchen_id: string
  title: string
  status: JobStatus
  description: string
}

type JobCreateInput = JobCreateForm

const DEFAULT_FORM: JobCreateForm = {
  ...JobPayload,
}

export function useJobCreate() {
  const { createDocument } = useFirestoreCreate()
  const form = ref<JobCreateForm>({ ...DEFAULT_FORM })

  const reset = () => {
    form.value = { ...DEFAULT_FORM }
  }

  async function createJob(payload: JobCreateInput): Promise<{ created: boolean; id: string }> {
    const data = {
      ...payload,
    } satisfies JobCreateInput

    const id = await createDocument<JobCreateInput>('jobs', data, {
      app: true,
      creator: true,
    })
    

    return { created: true, id }
  }

  const submit = async (): Promise<string> => {
    const title = String(form.value.title ?? '').trim()
    const description = String(form.value.description ?? '').trim()
    const kitchenId = String(form.value.kitchen_id ?? '').trim()

    if (!kitchenId) throw new Error('Kitchen is required')
    if (!title) throw new Error('Title is required')
    if (!description) throw new Error('Description is required')

    const payload: JobCreateInput = {
      ...form.value,
      title,
      description,
      kitchen_id: kitchenId,
      company_id: String(form.value.company_id ?? '').trim(),
      status: form.value.status ?? 'open',
    }

    const result = await createJob(payload)
    return result.id
  }

  return { form, reset, submit, createJob }
}
