import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { ref } from 'vue'
import type { JobStatus } from '../../../../../models/job.model'
import { useFireuxJobsConfig } from '../../../../config/useFireuxJobsConfig'

export const JobPayload = {
  company_id: '',
  workplace_type: '',
  workplace_id: '',
  workplace_label: '',
  title: '',
  status: 'open' as JobStatus,
  description: '',
}

export const JobStampOptions = {
  creator: true,
} as const

export type JobCreateForm = {
  company_id: string
  workplace_type: string
  workplace_id: string
  workplace_label: string
  title: string
  status: JobStatus
  description: string
}

type JobCreateInput = JobCreateForm

const DEFAULT_FORM: JobCreateForm = {
  ...JobPayload,
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useJobCreate() {
  const { createDocument } = useFirestoreCreate()
  const jobsConfig = useFireuxJobsConfig()
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
    const title = normalizeString(form.value.title)
    const description = normalizeString(form.value.description)
    const workplaceId = normalizeString(form.value.workplace_id)
    const workplaceType = normalizeString(form.value.workplace_type)

    if (!workplaceId) throw new Error('Workplace is required')
    if (!workplaceType) throw new Error('Workplace type is required')
    if (
      jobsConfig.workplaces.length > 0 &&
      !jobsConfig.workplaces.includes(workplaceType)
    ) {
      throw new Error('Invalid workplace type')
    }
    if (!title) throw new Error('Title is required')
    if (!description) throw new Error('Description is required')

    const payload: JobCreateInput = {
      ...form.value,
      title,
      description,
      workplace_id: workplaceId,
      workplace_type: workplaceType,
      workplace_label: normalizeString(form.value.workplace_label),
      company_id: normalizeString(form.value.company_id),
      status: form.value.status ?? 'open',
    }

    const result = await createJob(payload)
    return result.id
  }

  return { form, reset, submit, createJob }
}
