import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Job, JobResolved } from '../../../../../../models/objects/job.model'
import {
  resolveWorkplace,
  resolveWorkplaceMeta,
} from '../../../../../workplace/resolveWorkplace'

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
    workplaceId: string
    workplaceType: string
    companyId: string
  }
}

export function useJobInterface() {
  function resolveSubtitle(job: JobResolved): string {
    const workplace = resolveWorkplace(job)
    const workplaceLabel =
      safeString((workplace as any)?.short_address).trim() ||
      safeString((workplace as any)?.formatted_address).trim() ||
      safeString((workplace as any)?.name).trim()

    const { workplaceLabel: fallbackLabel } = resolveWorkplaceMeta(job)
    const fallback = safeString(fallbackLabel).trim() || safeString((job as any)?.location_label).trim()
    const status = safeString(job.status ?? '').trim()
    return workplaceLabel || fallback || status
  }

  function map(job: JobResolved): JobCard.Card {
    const id = safeString(job.id).trim()
    const { workplaceId, workplaceType } = resolveWorkplaceMeta(job)
    const workplace = resolveWorkplace(job)

    return {
      id,
      to: id ? `/jobs/${id}` : '',

      imageUrl: safeString((workplace as any)?.image_url),
      title: safeString(job.title),
      subtitle: resolveSubtitle(job),
      status: job.status,
      description: safeString(job.description),

      badges: [],

      workplaceId,
      workplaceType,
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
    const location = safeString(
      (job as any)?.workplace_label ?? (job as any)?.location_label ?? ''
    )
    const id = safeString(job.id)
    return `${title} ${status} ${location} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
