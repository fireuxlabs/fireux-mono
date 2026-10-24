import { computed, type ComputedRef, type Ref } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import type { PropertySurface } from '../firestore/utils/view/usePropertyInterface'
import { usePropertyWorkspace } from './usePropertyWorkspace'
import { usePropertyAccess } from '../usePropertyAccess'
import { PropertyStorage } from '../../models/property.model'

type WorkspaceDataType = 'live'

export type ActivePropertyRuntime = {
  dataType: ComputedRef<WorkspaceDataType | null>
  id: ComputedRef<string>
  entity: ComputedRef<PropertySurface | null>
  rootCollection: ComputedRef<string>
  targetOutcome: Readonly<Ref<WorkspaceTargetOutcome>>
  canRead: ComputedRef<boolean>
  canWrite: ComputedRef<boolean>
  propertyPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function requirePropertyWorkspaceWrite(
  runtimeProperty: Pick<ActivePropertyRuntime, 'id' | 'canWrite'>,
  namespace: string
) {
  const propertyId = normalizeString(runtimeProperty.id.value)
  const label = normalizeString(namespace) || 'fireux-property'

  if (!propertyId) {
    throw new Error(`[${label}] property id is required.`)
  }
  if (!runtimeProperty.canWrite.value) {
    throw new Error(`[${label}] current operator does not have write access.`)
  }

  return propertyId
}

export function useActiveProperty(): ActivePropertyRuntime {
  const workspace = usePropertyWorkspace()
  const access = usePropertyAccess()
  const id = computed(() => normalizeString(workspace.id.value))
  const rootCollection = computed(() => PropertyStorage.rootCollection)
  const propertyPath = computed(() => id.value ? `${rootCollection.value}/${id.value}` : '')
  const canRead = computed(() =>
    workspace.outcome.value === 'ready' && workspace.data.value?.id === id.value &&
    access.outcome.value === 'ready' && access.ids.value.includes(id.value)
  )
  return {
    dataType: computed(() => canRead.value ? 'live' : null),
    id,
    entity: computed(() => canRead.value ? workspace.data.value : null),
    rootCollection,
    targetOutcome: computed(() =>
      access.outcome.value !== 'ready'
        ? access.outcome.value
        : !access.ids.value.includes(id.value)
          ? 'missing'
          : workspace.outcome.value === 'ready' && !canRead.value
            ? 'missing' : workspace.outcome.value
    ),
    canRead,
    canWrite: canRead,
    propertyPath,
  }
}

export function usePropertyWorkspaceChildPath(
  runtimeProperty: Pick<ActivePropertyRuntime, 'propertyPath'>,
  childCollection: string
) {
  const childPath = normalizePath(childCollection)
  return computed(() => {
    const propertyPath = normalizePath(runtimeProperty.propertyPath.value)
    if (!propertyPath || !childPath) return ''
    return `${propertyPath}/${childPath}`
  })
}
