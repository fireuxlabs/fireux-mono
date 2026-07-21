// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: validate categories and configured Place-backed workplace types.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: submit caller-safe Job intent to the fixed-scope Admin create route.
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { ref } from 'vue'
import type { JobCreateIntent } from '../../../../../models/job-author.model'
import { createAuthorJobRequest } from '../../../jobs/author/jobAuthorClient'
import { useFireuxJobsConfig } from '../../../../config/useFireuxJobsConfig'

export const JobPayload = {
  company_id: '',
  category_id: '',
  workplace_type: '',
  workplace_id: '',
  workplace_label: '',
  job_type: 'permanent',
  openings_count: 1,
  pay_currency: 'CHF',
  pay_rate: 0,
  pay_unit: 'hour',
  start_at: {} as JobCreateIntent['start_at'],
  end_at: {} as JobCreateIntent['end_at'],
  title: '',
  status: 'open',
  description: '',
} satisfies JobCreateIntent

export type JobCreateForm = JobCreateIntent

export function useJobCreate() {
  const jobsConfig = useFireuxJobsConfig()

  const configuredDefaultWorkplaceType = normalizeString(
    jobsConfig.defaultWorkplaceType
  )
  const singletonCategory = jobsConfig.categories.length === 1
    ? jobsConfig.categories[0]
    : ''

  const createDefaultForm = (): JobCreateForm => ({
    ...JobPayload,
    category_id: singletonCategory,
    workplace_type: configuredDefaultWorkplaceType,
  })

  const form = ref<JobCreateForm>(createDefaultForm())

  const reset = () => {
    form.value = createDefaultForm()
  }

  function requireDefaultWorkplaceType(): string {
    if (!configuredDefaultWorkplaceType) {
      throw new Error('Jobs default workplace type is not configured')
    }
    if (
      jobsConfig.workplaces.length > 0 &&
      !jobsConfig.workplaces.includes(configuredDefaultWorkplaceType)
    ) {
      throw new Error('Jobs default workplace type is not allowed')
    }
    return configuredDefaultWorkplaceType
  }

  function resolveCategoryId(value: unknown): string {
    const categoryId = normalizeString(value) || singletonCategory
    if (jobsConfig.categories.length > 0 && !categoryId) {
      throw new Error('Job category is required')
    }
    if (
      categoryId &&
      jobsConfig.categories.length > 0 &&
      !jobsConfig.categories.includes(categoryId)
    ) {
      throw new Error('Invalid job category')
    }
    return categoryId
  }

  async function createJob(payload: JobCreateIntent): Promise<{ created: boolean; id: string }> {
    requireDefaultWorkplaceType()
    const categoryId = resolveCategoryId(payload.category_id)
    const workplaceType = normalizeString(payload.workplace_type)
    if (!workplaceType) throw new Error('Workplace type is required')
    if (
      jobsConfig.workplaces.length > 0 &&
      !jobsConfig.workplaces.includes(workplaceType)
    ) {
      throw new Error('Invalid workplace type')
    }
    const data = {
      ...payload,
      category_id: categoryId,
      workplace_type: workplaceType,
    } satisfies JobCreateIntent

    const response = await createAuthorJobRequest(data)
    return { created: true, id: response.id }
  }

  const submit = async (): Promise<string> => {
    requireDefaultWorkplaceType()
    const title = normalizeString(form.value.title)
    const description = normalizeString(form.value.description)
    const categoryId = resolveCategoryId(form.value.category_id)
    const workplaceId = normalizeString(form.value.workplace_id)
    const workplaceType = normalizeString(form.value.workplace_type)
    const companyId = normalizeString(form.value.company_id)

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
    if (!companyId) throw new Error('Company is required')

    const payload: JobCreateIntent = {
      ...form.value,
      title,
      description,
      category_id: categoryId,
      workplace_id: workplaceId,
      workplace_type: workplaceType,
      workplace_label: normalizeString(form.value.workplace_label),
      company_id: companyId,
      status: form.value.status ?? 'open',
    }

    const result = await createJob(payload)
    return result.id
  }

  return { form, reset, submit, createJob }
}
