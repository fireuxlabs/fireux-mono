import { computed, type Ref } from 'vue'
import type { Job, JobStatus } from '../../types/job.model.ts'
import { useJobUpdate } from './main/useJobUpdate.ts'

const sanitizeString = (value: unknown) =>
  value == null ? '' : String(value).trim()

export function useJob(job: Ref<Job | null>) {
  const { updateJob } = useJobUpdate()

  const ensureId = () => {
    const id = job.value?.id
    if (!id) {
      throw new Error('[useJob] job id is required before updating')
    }
    return id
  }

  const setTitle = async (title: string) => {
    const value = sanitizeString(title)
    await updateJob(ensureId(), { title: value || 'Untitled Job' })
  }

  const setDescription = async (description: string | null) => {
    const value = sanitizeString(description)
    await updateJob(ensureId(), { description: value.length ? value : null })
  }

  const setPay = async (pay: string | number | null) => {
    const numeric = typeof pay === 'string' ? pay.trim() : pay
    await updateJob(ensureId(), {
      pay: numeric === '' ? null : numeric ?? null,
    })
  }

  const setStatus = async (status: JobStatus) => {
    await updateJob(ensureId(), { status })
  }

  const isInitialized = computed(() => job.value !== undefined)

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
