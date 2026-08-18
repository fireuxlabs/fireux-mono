// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: validate categories and configured Place-backed workplace types.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: submit caller-safe Job intent to the fixed-scope Admin create route.
// Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: submit canonical Place, contract, schedule, and compensation intent.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: validate free neutral category ids only for all-category Apps.
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { requireFinancialMoney } from 'fireux-finance/runtime/utils/money'
import { ref } from 'vue'
import type { JobCreateIntent } from '../../../models/job-author.model.ts'
import {
  JOB_CONTRACT_TYPES,
  JOB_MANAGEMENT_MODES,
  JOB_PAY_UNITS,
  type JobCompensation,
} from '../../../models/job.model.ts'
import { createAuthorJobRequest } from '../../author/jobAuthorClient'
import { useFireuxJobsConfig } from '../../../../composables/config/useFireuxJobsConfig'

export const JobPayload = {
  company_id: '',
  place_id: '',
  category_id: '',
  contract_type: 'permanent',
  management_mode: 'direct',
  openings_count: 1,
  compensation: null,
  start_at: null,
  end_at: null,
  title: '',
  description: '',
} satisfies JobCreateIntent

export type JobCreateForm = JobCreateIntent

export function useJobCreate() {
  const jobsConfig = useFireuxJobsConfig()

  const singletonCategory = jobsConfig.categoryScope === 'allowlist' &&
    jobsConfig.categories.length === 1
    ? jobsConfig.categories[0]
    : ''

  const createDefaultForm = (): JobCreateForm => ({
    ...JobPayload,
    category_id: singletonCategory,
  })

  const form = ref<JobCreateForm>(createDefaultForm())

  const reset = () => {
    form.value = createDefaultForm()
  }

  function resolveCategoryId(value: unknown): string {
    const categoryId = normalizeString(value) || singletonCategory
    if (!categoryId) {
      throw new Error('Job category is required')
    }
    if (categoryId.length > 120 || !isFirestoreDocumentId(categoryId)) {
      throw new Error('Invalid job category')
    }
    if (
      jobsConfig.categoryScope === 'allowlist' &&
      !jobsConfig.categories.includes(categoryId)
    ) {
      throw new Error('Invalid job category')
    }
    return categoryId
  }

  function normalizeCompensation(
    value: JobCreateIntent['compensation']
  ): JobCompensation | null {
    if (!value) return null
    if (!JOB_PAY_UNITS.includes(value.unit)) {
      throw new Error('Compensation unit is invalid')
    }
    const money = requireFinancialMoney(
      {
        amount_minor: Number(value.amount_minor),
        currency_code: normalizeString(value.currency_code).toUpperCase(),
      },
      {
        allowNegative: false,
        allowZero: false,
        label: 'Job compensation',
      }
    )
    return {
      ...money,
      unit: value.unit,
    }
  }

  function timestampMillis(value: JobCreateIntent['start_at']): number | null {
    if (!value) return null
    const source = value as unknown as {
      seconds?: number
      nanoseconds?: number
      toMillis?: () => number
    }
    if (typeof source.toMillis === 'function') return source.toMillis()
    if (!Number.isInteger(source.seconds)) return null
    return Number(source.seconds) * 1_000 + Number(source.nanoseconds ?? 0) / 1_000_000
  }

  function normalizeIntent(payload: JobCreateIntent): JobCreateIntent {
    const title = normalizeString(payload.title)
    const description = normalizeString(payload.description)
    const categoryId = resolveCategoryId(payload.category_id)
    const placeId = normalizeString(payload.place_id)
    const companyId = normalizeString(payload.company_id)
    const openingsCount = Number(payload.openings_count)

    if (!placeId) throw new Error('Place is required')
    if (!companyId) throw new Error('Company is required')
    if (!title) throw new Error('Title is required')
    if (!description) throw new Error('Description is required')
    if (!JOB_CONTRACT_TYPES.includes(payload.contract_type)) {
      throw new Error('Contract type is invalid')
    }
    if (!JOB_MANAGEMENT_MODES.includes(payload.management_mode)) {
      throw new Error('Management mode is invalid')
    }
    if (
      !Number.isInteger(openingsCount) ||
      openingsCount < 1 ||
      openingsCount > 500
    ) {
      throw new Error('Openings must be between 1 and 500')
    }

    const startAtMillis = timestampMillis(payload.start_at)
    const endAtMillis = timestampMillis(payload.end_at)
    if (payload.start_at && startAtMillis === null) {
      throw new Error('Start time is invalid')
    }
    if (payload.end_at && endAtMillis === null) {
      throw new Error('End time is invalid')
    }
    if (payload.contract_type === 'fixed_term' && (!payload.start_at || !payload.end_at)) {
      throw new Error('Fixed-term jobs require a start and end time')
    }
    if (payload.contract_type === 'permanent' && payload.end_at) {
      throw new Error('Permanent jobs cannot have an end time')
    }
    if (payload.end_at && !payload.start_at) {
      throw new Error('An end time requires a start time')
    }
    if (
      startAtMillis !== null &&
      endAtMillis !== null &&
      startAtMillis >= endAtMillis
    ) {
      throw new Error('End time must be after start time')
    }

    return {
      company_id: companyId,
      place_id: placeId,
      category_id: categoryId,
      contract_type: payload.contract_type,
      management_mode: payload.management_mode,
      openings_count: openingsCount,
      compensation: normalizeCompensation(payload.compensation),
      start_at: payload.start_at,
      end_at: payload.end_at,
      title,
      description,
    }
  }

  async function createJob(payload: JobCreateIntent): Promise<{ created: boolean; id: string }> {
    const data = normalizeIntent(payload)

    const response = await createAuthorJobRequest(data)
    return { created: true, id: response.id }
  }

  const submit = async (): Promise<string> => {
    const result = await createJob(form.value)
    return result.id
  }

  return { form, reset, submit, createJob }
}
