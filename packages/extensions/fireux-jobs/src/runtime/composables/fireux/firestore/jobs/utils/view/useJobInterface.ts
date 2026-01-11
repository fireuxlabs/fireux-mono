import type { Ref } from 'vue'
import type { Job } from '../../../../../../models/job.model'

export namespace JobCard {
  export type Card = {
    id: string
    to: string
    title: string
    status: Job['status']
    description: string

    badges: string[]
  }
}

export function useJobInterface(jobRef?: Ref<Job | null | undefined>) {
  function map(job: Job): JobCard.Card {
    return {
      id: job.id,
      to: `/jobs/${job.id}`,

      title: job.title,
      status: job.status,
      description: job.description ?? '',

      badges: [],
    }
  }

  function card(target?: Job | null | undefined): JobCard.Card | null {
    const job = target ?? jobRef?.value ?? null
    return job ? map(job) : null
  }

  function searchText(job: Job): string {
    return `${job.title} ${job.status} ${job.id}`.toLowerCase()
  }

  return { card, searchText }
}
