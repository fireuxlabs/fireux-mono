// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: make overview state outcome-authoritative.
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../utils/string'
import type { WorkspaceTargetOutcome } from './useWorkspaceIndex'

type ValueRef<T> = Ref<T> | ComputedRef<T>

type UseWorkspaceOverviewOptions<T> = {
  selectedEntity: ValueRef<T | null | undefined>
  targetItems: ValueRef<(T | null | undefined)[] | null | undefined>
  targetOutcome: ValueRef<WorkspaceTargetOutcome>
  getId: (item: T) => string
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useWorkspaceOverview<T>(
  options: UseWorkspaceOverviewOptions<T>
) {
  const outcome = computed<WorkspaceTargetOutcome>(() =>
    unref(options.targetOutcome)
  )
  const focus = computed(() => {
    const entity = unref(options.selectedEntity) ?? null

    return {
      entity,
      id: entity ? normalizeString(options.getId(entity)) : '',
      hasSelection: Boolean(entity),
      outcome: outcome.value,
    }
  })

  const multipleItems = computed<T[]>(() => {
    const items = unref(options.targetItems)

    return Array.isArray(items) ? items.filter(isPresent) : []
  })

  const multiple = computed(() => ({
    items: multipleItems.value,
    count: multipleItems.value.length,
    hasItems: multipleItems.value.length > 0,
    outcome: outcome.value,
  }))

  return {
    focus,
    multiple,
    outcome,
  }
}
