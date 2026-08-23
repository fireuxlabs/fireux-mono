import { computed, type ComputedRef, type Ref } from 'vue'
import type { WorkspaceDataType } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDirectoryIndex'
import type { PropertySurface } from '../../firestore/utils/view/usePropertyInterface'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export type ActivePropertyRuntime = {
  dataType: ComputedRef<WorkspaceDataType | null>
  isDemo: ComputedRef<boolean>
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
  const { properties, selection, runtime } = usePropertyWorkspace()

  const id = computed(
    () =>
      normalizeString(selection.property.value?.id) ||
      normalizeString(selection.propertyId.value)
  )
  const rootCollection = computed(() =>
    normalizePath(runtime.rootCollection.value)
  )
  const propertyPath = computed(() => {
    if (!rootCollection.value || !id.value) return ''
    return `${rootCollection.value}/${id.value}`
  })
  const canRead = computed(
    () =>
      properties.outcome.value === 'ready' &&
      Boolean(normalizeString(selection.property.value?.id))
  )

  return {
    dataType: runtime.dataType,
    isDemo: runtime.isDemo,
    id,
    entity: selection.property,
    rootCollection,
    targetOutcome: properties.outcome,
    canRead,
    canWrite: runtime.canWrite,
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
