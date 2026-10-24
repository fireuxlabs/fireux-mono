import { computed, type Ref } from 'vue'
import { useIdentity } from '../../composables/fireux/useIdentity'

/** Management availability for an identity supplied by its domain owner. */
export function useWorkspaceIdentity<Fields>(options: {
  id: Ref<string>
  fields: Ref<Fields>
  status: Ref<string>
  canWrite: Ref<boolean>
}) {
  const identity = useIdentity(options)
  const canWrite = computed(
    () => options.status.value === 'ready' && options.canWrite.value
  )
  const availableActions = computed(() =>
    options.status.value !== 'ready'
      ? []
      : canWrite.value
        ? ['read', 'update']
        : ['read']
  )
  return { ...identity, canWrite, availableActions }
}
