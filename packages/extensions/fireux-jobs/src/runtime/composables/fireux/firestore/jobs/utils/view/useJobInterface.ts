import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Job, JobResolved } from '../../../../../../models/job.model'

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

  function resolveSubtitle(job: JobResolved): string {
    const workplace = (job as any)?.workplace as any | null | undefined
    return safeString(workplace?.short_address).trim()
  }

  function map(job: JobResolved): JobCard.Card {
    const id = safeString(job.id).trim()
    const workplace = (job as any)?.workplace as any | null | undefined
    const workplaceId = safeString((job as any)?.workplace_id)
    const workplaceType = safeString((job as any)?.workplace_type)

    return {
      id,
      to: id ? `/jobs/${id}` : '',

      imageUrl: safeString(workplace?.image_url),
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

  function buildInterface(target?: JobResolved | null | undefined): JobCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: JobResolved | null | undefined): JobPill | null {
    return buildInterface(target)
  }

  function cell(target?: JobResolved | null | undefined): JobCell | null {
    return buildInterface(target)
  }

  function preview(target?: JobResolved | null | undefined): JobPreview | null {
    return buildInterface(target)
  }

  function profile(target?: JobResolved | null | undefined): JobProfile | null {
    return buildInterface(target)
  }

  function searchText(job: JobResolved): string {
    // keep it simple; add company/place names later once jobs are hydrated
    const title = safeString(job.title)
    const status = safeString(job.status)
    const location = safeString((job as any)?.workplace_label)
    const id = safeString(job.id)
    return `${title} ${status} ${location} ${id}`.trim().toLowerCase()
  }

  return { interface: buildInterface, searchText }
}
