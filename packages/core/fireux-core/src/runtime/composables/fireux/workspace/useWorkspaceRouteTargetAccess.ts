import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { normalizeString } from '../../../utils/string'
import { normalizeWorkspaceFamily, useWorkspace } from './useWorkspace'
import { useWorkspaceSelection } from './useWorkspaceSelection'
import { useWorkspaceTargetRequest } from './useWorkspaceTargetRequest'

export function useWorkspaceRouteTargetAccess(input: {
  family: MaybeRefOrGetter<string>
  requiresSelection: MaybeRefOrGetter<boolean>
}) {
  const workspaceRoot = useWorkspace()
  const familyNames = workspaceRoot.families
    .map((value) => normalizeWorkspaceFamily(value))
    .filter(Boolean)
  const selections = new Map(
    familyNames.map(
      (family) => [family, useWorkspaceSelection(family)] as const
    )
  )
  const activeFamily = computed(() =>
    normalizeWorkspaceFamily(toValue(input.family))
  )
  const requiresSelection = computed(() =>
    Boolean(toValue(input.requiresSelection))
  )
  const requests = new Map(
    familyNames.map(
      (family) =>
        [
          family,
          useWorkspaceTargetRequest(family, {
            enabled: computed(() => {
              const selection = selections.get(family)
              const type = selection?.selectedType.value
              return (
                requiresSelection.value &&
                activeFamily.value === family &&
                Boolean(selection?.selectedId.value) &&
                type !== 'demo' &&
                type !== 'test'
              )
            }),
          }),
        ] as const
    )
  )
  const activeSelection = computed(() => selections.get(activeFamily.value))
  const selectedId = computed(() =>
    normalizeString(activeSelection.value?.selectedId.value)
  )
  const selectedType = computed(
    () => activeSelection.value?.selectedType.value ?? null
  )
  const activeRequest = computed(() => requests.get(activeFamily.value))
  const requiresLiveAccess = computed(
    () =>
      requiresSelection.value &&
      Boolean(selectedId.value) &&
      selectedType.value !== 'demo' &&
      selectedType.value !== 'test'
  )
  const pending = computed(
    () =>
      requiresLiveAccess.value &&
      (activeRequest.value?.outcome.value === 'idle' ||
        activeRequest.value?.outcome.value === 'pending')
  )
  const error = computed(
    () =>
      requiresLiveAccess.value && activeRequest.value?.outcome.value === 'error'
  )
  const authorized = computed(() => {
    if (!requiresLiveAccess.value) return true
    return Boolean(
      selectedId.value &&
        activeRequest.value?.items.value.some(
          (item) => normalizeString(item.id) === selectedId.value
        )
    )
  })
  const blocked = computed(
    () =>
      requiresSelection.value &&
      (!selectedId.value ||
        (!pending.value && !error.value && !authorized.value))
  )

  watch(
    () => ({
      family: activeFamily.value,
      id: selectedId.value,
      requiresLiveAccess: requiresLiveAccess.value,
      outcome: activeRequest.value?.outcome.value,
      authorized: authorized.value,
    }),
    ({ family, id, requiresLiveAccess, outcome, authorized }) => {
      if (
        !family ||
        !id ||
        !requiresLiveAccess ||
        authorized ||
        (outcome !== 'ready' && outcome !== 'empty')
      ) {
        return
      }
      selections.get(family)?.clearSelection()
    }
  )

  return {
    pending,
    error,
    blocked,
    refresh: () => activeRequest.value?.refresh(),
  }
}
