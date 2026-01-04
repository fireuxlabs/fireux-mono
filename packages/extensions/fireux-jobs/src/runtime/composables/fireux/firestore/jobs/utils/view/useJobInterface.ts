import { computed } from 'vue'
import type { Ref } from 'vue'
import type { Job, JobStatus } from '../../../../../../models/job.model'

export namespace JobCard {
  export type Card = {
    id: string
    title: string
    subtitle: string
    status: JobStatus
    avatar: string | null
    badges: string[]
  }
}

export function useJobInterface(job?: Ref<Job | null>) {
  const mapToCardProps = (data: Partial<JobCard.Card>): JobCard.Card => {
    const status = (data.status ?? 'open') as JobStatus
    return {
      id: data.id ?? 'job-id',
      title: data.title ?? 'Job',
      status,
      subtitle: data.subtitle ?? status,
      avatar: data.avatar ?? null,
      badges: Array.isArray(data.badges) ? data.badges : [],
    }
  }

  function card(target: Job): JobCard.Card
  function card(target?: Job | null | undefined): JobCard.Card | null
  function card(target?: Job | null | undefined): JobCard.Card | null {
    const current = target ?? job?.value
    if (!current) return null
    return mapToCardProps({
      id: current.id,
      title: current.title,
      status: current.status,
    })
  }

  const cardFromJobRef = () => card(job?.value) ?? mapToCardProps({})

  const cardRef = job ? computed(() => card(job.value)) : null

  return { mapToCardProps, cardFromJobRef, card, cardRef }
}
