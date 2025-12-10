import type { Ref } from 'vue'
import type { Job } from '../../../../../models/job.model.ts'

// Placeholder for job UI interfaces; extend when card/list props are defined
export interface JobCardProps {
  id: string
  title: string
  location?: string
  company?: string
  description?: string
}

export function useJobInterface(job?: Ref<Job | null>) {
  const mapToCardProps = (data: Partial<JobCardProps>): JobCardProps => ({
    id: data.id ?? 'job-id',
    title: data.title ?? 'Job',
    location: data.location,
    company: data.company,
    description: data.description,
  })

  const cardFromJobRef = (): JobCardProps => {
    const current = job?.value
    return mapToCardProps({
      id: current?.id,
      title: current?.title,
      description: current?.description,
      location: (current as any)?.location,
      company: (current as any)?.company,
    })
  }

  return { mapToCardProps, cardFromJobRef }
}
