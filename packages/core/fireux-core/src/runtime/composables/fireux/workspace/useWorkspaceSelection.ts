// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: validate persisted selection from authoritative target outcomes.
import { useCookie, useState } from '#imports'
import { computed, unref, watch, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from '../../../utils/string'
import {
  normalizeWorkspaceFamily,
  useWorkspace,
  type WorkspaceSource,
} from './useWorkspace'
import {
  normalizeWorkspaceDataType,
  type WorkspaceDataType,
} from './useWorkspaceData'
import type { WorkspaceTargetOutcome } from './useWorkspaceDirectoryIndex'

type WorkspaceSelectionState = {
  id?: string
  /** @deprecated Read only for bounded migration to `id`. */
  selectedId?: string
  type?: WorkspaceDataType
}

type ValueRef<T> = T | Ref<T> | ComputedRef<T>

export type UseWorkspaceSelectionOptions<TTarget> = {
  targetItems: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetOutcome: ValueRef<WorkspaceTargetOutcome>
  getId: (item: TTarget) => string
  getType?: (item: TTarget) => WorkspaceDataType
  enforcedTargetId?: ValueRef<string | null | undefined>
}

const isPresent = <T>(value: T | null | undefined): value is T => value != null

export function useWorkspaceSelection<TTarget = never>(
  family: string,
  options?: UseWorkspaceSelectionOptions<TTarget>
) {
  const normalizedFamily = normalizeWorkspaceFamily(family)
  const workspaceRoot = useWorkspace(normalizedFamily)
  const appScope = normalizeWorkspaceFamily(workspaceRoot.appId) || 'app'
  // Keep selection unset until there is a real target; tenant auto-select should
  // not write an empty cookie before writing the resolved target.
  const stateCookie = useCookie<WorkspaceSelectionState | null>(
    `fireux-workspace-${appScope}-${normalizedFamily}`,
    {
      sameSite: 'lax',
    }
  )
  const state = useState<WorkspaceSelectionState | null>(
    `fireux-workspace-${appScope}-${normalizedFamily}-selection-state`,
    () => stateCookie.value ?? null
  )
  const commitSelection = (value: WorkspaceSelectionState | null) => {
    state.value = value
    stateCookie.value = value
  }
  const selectedId = computed(() =>
    normalizeString(state.value?.id ?? state.value?.selectedId)
  )
  const selectedType = computed<WorkspaceDataType | null>(() =>
    normalizeWorkspaceDataType(state.value?.type)
  )
  const targetItems = computed<TTarget[]>(() => {
    const items = options ? unref(options.targetItems) : []
    return Array.isArray(items) ? items.filter(isPresent) : []
  })
  const targetOutcome = computed<WorkspaceTargetOutcome>(() =>
    options ? unref(options.targetOutcome) : 'idle'
  )

  const selectTarget = (id: string, type: WorkspaceSource = 'live') => {
    const nextId = normalizeString(id)
    if (!nextId) {
      clearSelection()
      return
    }

    const nextType = normalizeWorkspaceDataType(type) ?? 'live'
    workspaceRoot.setSource(nextType)
    commitSelection({
      id: nextId,
      type: nextType,
    })
  }

  const clearSelection = () => {
    commitSelection(null)
    workspaceRoot.resetSource()
  }

  const getTargetId = (item: TTarget | null | undefined) => {
    if (!item || !options) return ''
    return normalizeString(options.getId(item))
  }
  const getTargetType = (item: TTarget | null | undefined) =>
    item && options?.getType ? options.getType(item) : null

  const selectedTarget = computed<TTarget | null>(() => {
    const id = selectedId.value
    if (!id || !options) return null

    return (
      targetItems.value.find(
        (item) =>
          getTargetId(item) === id &&
          (!options.getType || getTargetType(item) === selectedType.value)
      ) ?? null
    )
  })

  // Selection owns only typed workspace state. Pending and failed target reads
  // never invalidate persisted state; a settled authoritative read may prove
  // that the typed target no longer exists.
  watch(
    selectedType,
    (type: WorkspaceDataType | null) => {
      if (type && workspaceRoot.source.value !== type) {
        workspaceRoot.setSource(type)
      }
    },
    { immediate: true }
  )

  watch(
    () => ({
      id: selectedId.value,
      type: selectedType.value,
      target: selectedTarget.value,
      outcome: targetOutcome.value,
    }),
    ({ id, target, outcome }) => {
      if (!id || target || (outcome !== 'ready' && outcome !== 'empty')) return
      clearSelection()
    },
    { immediate: true }
  )

  if (options?.enforcedTargetId) {
    watch(
      () => ({
        enforcedId: normalizeString(unref(options.enforcedTargetId)),
        items: targetItems.value,
        outcome: targetOutcome.value,
        currentId: selectedId.value,
        currentType: selectedType.value,
      }),
      ({
        enforcedId,
        items,
        outcome,
        currentId,
        currentType,
      }: {
        enforcedId: string
        items: TTarget[]
        outcome: WorkspaceTargetOutcome
        currentId: string
        currentType: WorkspaceDataType | null
      }) => {
        const enforcedTarget =
          outcome === 'ready' && enforcedId
            ? items.find((item) => getTargetId(item) === enforcedId)
            : null
        if (!enforcedTarget) return

        const type = getTargetType(enforcedTarget) ?? 'live'
        if (currentId !== enforcedId || currentType !== type) {
          selectTarget(enforcedId, type)
        }
      },
      { immediate: true }
    )
  }

  return {
    family: normalizedFamily,
    source: workspaceRoot.source,
    selectedId,
    selectedType,
    selectedTarget,
    selectTarget,
    clearSelection,
  }
}
