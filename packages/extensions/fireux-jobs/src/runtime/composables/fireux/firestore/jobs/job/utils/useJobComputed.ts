import { computed, type Ref } from 'vue'
import type { Job } from '../../../../../models/job.model.ts'

export function useJobComputed(job: Ref<Job | null>, pending: Ref<boolean>) {
  const status = computed(() => job.value?.status ?? 'draft')
  const isDraft = computed(() => status.value === 'draft')
  const isOpen = computed(() => status.value === 'open')
  const isClosed = computed(() => status.value === 'closed')
  const ownerId = computed(() => job.value?.created_by ?? null)
  const tenantId = computed(() => job.value?.tenant_id ?? null)
  const isLoaded = computed(() => !pending.value && job.value !== null)

  return { status, isDraft, isOpen, isClosed, ownerId, tenantId, isLoaded }
}
