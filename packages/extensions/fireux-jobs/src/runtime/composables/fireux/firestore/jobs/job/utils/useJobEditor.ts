import { computed, type Ref } from 'vue'
import type { Job, JobStatus } from '../../../../../models/job.model.ts'
import { useJobUpdate } from '../mutations/useJobUpdate'

const sanitizeString = (value: unknown) =>
  value == null ? '' : String(value).trim()

export function useJobEditor(job: Ref<Job | null>) {
  const { updateJob } = useJobUpdate()

  const ensureId = () => {
    const id = job.value?.id
    if (!id) {
      throw new Error('[useJobEditor] job id is required before updating')
    }
    return id
  }

  const setTitle = async (title: string) => {
    const value = sanitizeString(title)
    await updateJob(ensureId(), { title: value || 'Untitled Job' })
  }

  const setStatus = async (status: JobStatus) => {
    await updateJob(ensureId(), { status })
  }

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

  const isInitialized = computed(() => job.value !== undefined)

  return {
    job,
    isInitialized,
    pillProps,
    setTitle,
    setStatus,
  }
}
