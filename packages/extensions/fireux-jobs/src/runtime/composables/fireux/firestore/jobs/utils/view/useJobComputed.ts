import { computed, type Ref } from 'vue'
import { useJobInterface, type JobView } from './useJobInterface'

export function useJobComputed(job: Ref<JobView | null>, pending: Ref<boolean>) {
  const { pill: jobInterface } = useJobInterface()

  const isPending = computed(() => Boolean(pending.value))
  const jobCard = computed(() => (job.value ? jobInterface(job.value) : null))
  const jobSearchText = computed(() =>
    jobCard.value ? JSON.stringify(jobCard.value).toLowerCase() : ''
  )

  return { isPending, jobCard, jobSearchText }
}
