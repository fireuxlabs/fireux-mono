// Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: map the safe DTO without source App scope.
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { JobStorage, type Job } from '../../../../../../models/job.model'

export type JobView = Pick<
  Job,
  | 'id'
  | 'category_id'
  | 'visibility'
  | 'status'
  | 'workplace_type'
  | 'workplace_label'
  | 'job_type'
  | 'openings_count'
  | 'pay_currency'
  | 'pay_rate'
  | 'pay_unit'
  | 'title'
  | 'description'
> & Partial<Pick<
  Job,
  | 'company_id'
  | 'workplace_id'
  | 'start_at'
  | 'end_at'
>> & {
  workplace?: unknown | null
  workplace_image_url?: string
  workplace_short_address?: string
  workplace_formatted_address?: string
}

export namespace JobCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string

    // Primary display fields
    title: string
    subtitle: string
    summary: string
    status: Job['status']
    description: string

    // Status/label chips
    badges: string[]

    // IDs for fetching related entities
    workplaceId: string
    workplaceType: string
    companyId: string
  }
}

export function useJobInterface() {
  type JobPill = JobCard.Card
  type JobCell = JobCard.Card
  type JobPreview = JobCard.Card
  type JobProfile = JobCard.Card

  function resolveSubtitle(job: JobView): string {
    const workplace = (job as any)?.workplace as any | null | undefined
    return (
      safeString((job as any)?.workplace_short_address).trim() ||
      safeString((job as any)?.workplace_formatted_address).trim() ||
      safeString(workplace?.short_address).trim() ||
      safeString(job.workplace_label).trim()
    )
  }

  function map(job: JobView): JobCard.Card {
    const id = safeString(job.id).trim()
    const workplace = (job as any)?.workplace as any | null | undefined
    const workplaceId = safeString((job as any)?.workplace_id)
    const workplaceType = safeString((job as any)?.workplace_type)

    return {
      id,
      to: id ? `/${JobStorage.collection}/${id}` : '',

      imageUrl:
        safeString((job as any)?.workplace_image_url) ||
        safeString(workplace?.image_url),
      title: safeString(job.title),
      subtitle: resolveSubtitle(job),
      summary: safeString(job.description),
      status: job.status,
      description: safeString(job.description),

      badges: [],

      workplaceId,
      workplaceType,
      companyId: safeString(job.company_id),
    }
  }

  function buildInterface(
    target?: JobView | null | undefined
  ): JobCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: JobView | null | undefined): JobPill | null {
    return buildInterface(target)
  }

  function cell(target?: JobView | null | undefined): JobCell | null {
    return buildInterface(target)
  }

  function preview(target?: JobView | null | undefined): JobPreview | null {
    return buildInterface(target)
  }

  function profile(target?: JobView | null | undefined): JobProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
