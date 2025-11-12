import type { Ref } from 'vue'
import type { Job } from '../../types/job.model.ts'
import { useJobUpdate } from './main/useJobUpdate.ts'

export function useJob(job: Ref<Job | null>) {
  const { setTitle, setDescription, setPay, setStatus, isInitialized } =
    useJobUpdate(job)

  const pillProps = (target: Job | null) => {
    if (!target) {
      return {
        title: 'Job',
        subtitle: '',
        to: null,
        avatar: null,
        initials: 'J',
      }
    }

    return {
      title: target.title || 'Job',
      subtitle: target.status ? String(target.status).toUpperCase() : '—',
      to: target.id ? `/jobs/${target.id}` : null,
      avatar: null,
      initials: 'J',
    }
  }

  return {
    job,
    isInitialized,
    pillProps,
    setTitle,
    setDescription,
    setPay,
    setStatus,
  }
}
