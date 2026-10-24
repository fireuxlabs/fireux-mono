import { computed, type Ref } from 'vue'
import type { WorkspaceOutcome } from '../../workspace/models/outcome'

/** Selected-entity state shared by domain-owned Overview controllers. */
export function useOverview<Entity>(options: {
  entity: Ref<Entity | null | undefined>
  id: Ref<string>
  outcome: Ref<WorkspaceOutcome>
}) {
  const focus = computed(() => ({
    entity: options.entity.value,
    id: options.id.value,
    hasSelection: Boolean(options.entity.value),
    outcome: options.outcome.value,
  }))
  return { focus, outcome: options.outcome }
}
