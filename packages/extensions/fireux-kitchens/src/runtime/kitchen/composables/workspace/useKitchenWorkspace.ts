import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useKitchenInterface } from '../useKitchenInterface'
import { useKitchenRead } from '../firestore/useKitchenRead'
import { computed } from 'vue'
import { useKitchenAccess } from '../useKitchenAccess'

export function useKitchenWorkspace() {
  const { selectedId: id } = useWorkspace('kitchen')
  const access = useKitchenAccess()
  const readId = computed(() =>
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
      ? id.value
      : ''
  )
  const source = useKitchenRead(readId)
  const { kitchen, place } = source
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && kitchen.value?.id !== readId.value)
      return 'pending'
    return source.outcome.value
  })
  const { surface } = useKitchenInterface()
  const data = computed(() =>
    outcome.value === 'ready' && kitchen.value?.id === readId.value
      ? surface({
          kitchen: kitchen.value,
          place: place.value,
          routeScope: 'live',
        })
      : null
  )
  return { data, id, outcome }
}
