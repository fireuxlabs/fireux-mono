import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { ref } from 'vue'
import { JobStorage, type JobCreateInput } from '../../../../../models/job.model'
import { useFireuxJobsConfig } from '../../../../config/useFireuxJobsConfig'

export const JobPayload = {
  source_app_id: '',
  source_ecosystem_id: '',
  owner_type: 'app',
  owner_id: '',
  visibility: 'ecosystem',
  company_id: '',
  workplace_type: '',
  workplace_id: '',
  workplace_label: '',
  job_type: 'permanent',
  openings_count: 1,
  pay_currency: 'CHF',
  pay_rate: 0,
  pay_unit: 'hour',
  start_at: {} as JobCreateInput['start_at'],
  end_at: {} as JobCreateInput['end_at'],
  title: '',
  status: 'open',
  description: '',
} satisfies JobCreateInput

export const JobStampOptions = {
  creator: true,
} as const

export type JobCreateForm = JobCreateInput

const DEFAULT_FORM: JobCreateForm = {
  ...JobPayload,
}

export function useJobCreate() {
  const { createDocument } = useFirestoreCreate()
  const jobsConfig = useFireuxJobsConfig()
  const fireux = useFireUXConfig()
  const form = ref<JobCreateForm>({ ...DEFAULT_FORM })

  const reset = () => {
    form.value = { ...DEFAULT_FORM }
  }

  async function createJob(payload: JobCreateInput): Promise<{ created: boolean; id: string }> {
    const sourceAppId = normalizeString(payload.source_app_id || fireux.appId)
    const sourceEcosystemId = normalizeString(payload.source_ecosystem_id || fireux.ecosystem)
    const ownerType = normalizeString(payload.owner_type || (sourceAppId ? 'app' : 'ecosystem'))
    const ownerId = normalizeString(
      payload.owner_id || (ownerType === 'ecosystem' ? sourceEcosystemId : sourceAppId)
    )
    const data = {
      ...payload,
      source_app_id: sourceAppId,
      source_ecosystem_id: sourceEcosystemId,
      owner_type: ownerType,
      owner_id: ownerId,
      visibility: payload.visibility || 'ecosystem',
    } satisfies JobCreateInput

    const id = await createDocument<JobCreateInput>(JobStorage.collection, data, {
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
