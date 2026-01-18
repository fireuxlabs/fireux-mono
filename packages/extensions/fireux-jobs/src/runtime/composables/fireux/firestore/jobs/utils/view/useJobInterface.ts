import type { Job } from '../../../../../../models/objects/job.model'

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
  function map(job: Job): JobCard.Card {
    return {
      id: job.id,
      to: `/jobs/${job.id}`,

      avatarUrl: '',
      subtitle: String(job.status ?? ''),

      title: job.title,
      status: job.status,
      description: job.description ?? '',

      badges: [],
    }
  }

  function card(target?: Job | null | undefined): JobCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(job: Job): string {
    // keep it simple; add company/place names later once jobs are hydrated
    return `${job.title} ${job.status} ${job.id}`.toLowerCase()
  }

  return { card, searchText }
}
