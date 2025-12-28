import { computed, type Ref } from 'vue'
import type { Job } from '../../../../../../models/job.model'

export function useJobComputed(job: Ref<Job | null>, pending: Ref<boolean>) {
  const status = computed(() => job.value?.status ?? 'open')
  const isOpen = computed(() => status.value === 'open')
  const isClosed = computed(() => status.value === 'closed')
  const ownerId = computed(() => job.value?.created_by ?? null)
  const appId = computed(() => job.value?.app_id ?? null)
  const isLoaded = computed(() => !pending.value && job.value !== null)

  return { status, isOpen, isClosed, ownerId, appId, isLoaded }
}
