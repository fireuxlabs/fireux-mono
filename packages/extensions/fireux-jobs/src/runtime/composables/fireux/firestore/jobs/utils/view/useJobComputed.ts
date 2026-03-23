import { computed, type Ref } from 'vue'
import type { JobResolved } from '../../../../../../models/job.model'
import { useJobInterface } from './useJobInterface'

export function useJobComputed(job: Ref<JobResolved | null>, pending: Ref<boolean>) {
  const { interface, searchText } = useJobInterface()

  const isPending = computed(() => Boolean(pending.value))
  const jobCard = computed(() => (job.value ? interface(job.value) : null))
  const jobSearchText = computed(() => (job.value ? searchText(job.value) : ''))

  return { isPending, jobCard, jobSearchText }
}
