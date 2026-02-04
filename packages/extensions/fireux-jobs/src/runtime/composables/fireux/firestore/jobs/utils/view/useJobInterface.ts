import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Job, JobResolved } from '../../../../../../models/objects/job.model'

export namespace JobCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    imageUrl: string

    // Primary display fields
    title: string
    subtitle: string
    status: Job['status']
    description: string

    // Status/label chips
    badges: string[]

    // IDs for fetching related entities
    kitchenId: string
    companyId: string
  }
}

export function useJobInterface() {
  function resolveSubtitle(job: JobResolved): string {
    const k = (job as any)?.kitchen as any | null | undefined
    const kitchenLabel =
      safeString(k?.short_address).trim() ||
      safeString(k?.formatted_address).trim() ||
      safeString(k?.name).trim()

    const fallback = safeString((job as any)?.location_label).trim()
    const status = safeString(job.status ?? '').trim()
    return kitchenLabel || fallback || status
  }

  function map(job: JobResolved): JobCard.Card {
    const id = safeString(job.id).trim()
    return {
      id,
      to: id ? `/jobs/${id}` : '',

      imageUrl: safeString((job as any)?.kitchen?.image_url),
      title: safeString(job.title),
      subtitle: resolveSubtitle(job),
      status: job.status,
      description: safeString(job.description),

      badges: [],

      kitchenId: safeString(job.kitchen_id),
      companyId: safeString(job.company_id),
    }
  }

  function card(target?: JobResolved | null | undefined): JobCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(job: JobResolved): string {
    // keep it simple; add company/place names later once jobs are hydrated
    const title = safeString(job.title)
    const status = safeString(job.status ?? '')
    const location = safeString((job as any)?.location_label ?? '')
    const id = safeString(job.id)
    return `${title} ${status} ${location} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
