import {
  computed,
  toValue,
  type MaybeRefOrGetter,
  type ComputedRef,
  type Ref,
} from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import type { PropertySurface } from './firestore/utils/view/usePropertyInterface'
import { usePropertyFetch } from './firestore/fetch/usePropertyFetch'
import { usePropertyAccess } from './usePropertyAccess'
import { PropertyStorage } from '../models/property.model'

type WorkspaceDataType = 'live'

export type PropertyScope = {
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

export function requirePropertyWrite(
  runtimeProperty: Pick<PropertyScope, 'id' | 'canWrite'>,
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

export function usePropertyScope(
  requestedId: MaybeRefOrGetter<string>
): PropertyScope {
  const access = usePropertyAccess()
  const requested = computed(() => String(toValue(requestedId) || '').trim())
  const readId = computed(() =>
    access.outcome.value === 'ready' &&
    access.ids.value.includes(requested.value)
      ? requested.value
      : ''
  )
  const source = usePropertyFetch(readId)
  const workspace = {
    id: requested,
    data: source.property,
    outcome: computed<WorkspaceTargetOutcome>(() =>
      access.outcome.value !== 'ready'
        ? access.outcome.value
        : !requested.value
          ? 'idle'
          : !readId.value
            ? 'missing'
            : source.outcome.value
    ),
  }
  const id = computed(() => normalizeString(workspace.id.value))
  const rootCollection = computed(() => PropertyStorage.rootCollection)
  const propertyPath = computed(() =>
    id.value ? `${rootCollection.value}/${id.value}` : ''
  )
  const canRead = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      workspace.data.value?.id === id.value &&
      access.outcome.value === 'ready' &&
      access.ids.value.includes(id.value)
  )
  return {
    dataType: computed(() => (canRead.value ? 'live' : null)),
    id,
    entity: computed(() => (canRead.value ? workspace.data.value : null)),
    rootCollection,
    targetOutcome: computed(() =>
      access.outcome.value !== 'ready'
        ? access.outcome.value
        : !access.ids.value.includes(id.value)
          ? 'missing'
          : workspace.outcome.value === 'ready' && !canRead.value
            ? 'missing'
            : workspace.outcome.value
    ),
    canRead,
    canWrite: canRead,
    propertyPath,
  }
}

export function usePropertyChildPath(
  runtimeProperty: Pick<PropertyScope, 'propertyPath'>,
  childCollection: string
) {
  const childPath = normalizePath(childCollection)
  return computed(() => {
    const propertyPath = normalizePath(runtimeProperty.propertyPath.value)
    if (!propertyPath || !childPath) return ''
    return `${propertyPath}/${childPath}`
  })
}
