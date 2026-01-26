import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { JobResolved } from '../../../../../../models/objects/job.model'

export namespace JobCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    subtitle: string

    title: string
    status: Job['status']
    description: string

    // Status/label chips
    badges: string[]
  }
}

export function useJobInterface() {
  function map(job: JobResolved): JobCard.Card {
    const id = safeString(job.id).trim()
    const status = safeString(job.status ?? '')
    return {
      id,
      to: id ? `/jobs/${id}` : '',

      avatarUrl: safeString(job.kitchen?.place_image),
      subtitle: status,

      title: safeString(job.title),
      status: job.status,
      description: safeString(job.description),

      badges: [],
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
    const id = safeString(job.id)
    return `${title} ${status} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
