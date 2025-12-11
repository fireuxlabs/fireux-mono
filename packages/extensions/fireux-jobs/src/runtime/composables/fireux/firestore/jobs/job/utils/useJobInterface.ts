import type { Ref } from 'vue'
import type { Job, JobStatus } from '../../../../../models/job.model.ts'

export interface JobCardProps {
  id: string
  title: string
  status: JobStatus
}

export function useJobInterface(job?: Ref<Job | null>) {
  const mapToCardProps = (data: Partial<JobCardProps>): JobCardProps => ({
    id: data.id ?? 'job-id',
    title: data.title ?? 'Job',
    status: data.status ?? 'open',
  })

  const cardFromJobRef = (): JobCardProps => {
    const current = job?.value
    return mapToCardProps({
      id: current?.id,
      title: current?.title,
      status: current?.status,
    })
  }

  return { mapToCardProps, cardFromJobRef }
}
