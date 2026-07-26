import { computed, type ComputedRef, type Ref } from 'vue'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Property } from '../../../../../models/property.model'
import { usePropertyConsole } from '../core/usePropertyConsole'

export type ActivePropertyRuntime = {
  source: ComputedRef<ConsoleSource>
  mode: ComputedRef<ConsoleSource>
  isDemo: ComputedRef<boolean>
  id: ComputedRef<string>
  entity: ComputedRef<Property | null>
  rootCollection: ComputedRef<string>
  consoleAppId: ComputedRef<string>
  targetOutcome: Readonly<Ref<ConsoleTargetOutcome>>
  canRead: ComputedRef<boolean>
  canWrite: ComputedRef<boolean>
  propertyPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizePath = (value: unknown) =>
  normalizeString(value).replace(/^\/+|\/+$/g, '')

export function requirePropertyConsoleWrite(
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
  const {
    properties,
    selection,
    runtime,
  } = usePropertyConsole()

  const id = computed(() =>
    normalizeString(selection.property.value?.id) ||
    normalizeString(selection.propertyId.value)
  )
  const source = runtime.source
  const rootCollection = computed(() =>
    normalizePath(runtime.canonicalRootCollection.value)
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
    source,
    mode: source,
    isDemo: computed(() => source.value === 'demo'),
    id,
    entity: selection.property,
    rootCollection,
    consoleAppId: runtime.appId,
    targetOutcome: properties.outcome,
    canRead,
    canWrite: runtime.canWrite,
    propertyPath,
  }
}

export function usePropertyConsoleChildPath(
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
