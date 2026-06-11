import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { PropertyStorage, type Property } from '../../../../models/property.model'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../firestore/property/fetch/usePropertyCollection'
import type { Ref } from 'vue'

type PropertyConsoleMode = ConsoleMode
type UsePropertyConsoleOptions = {
  filter?: PropertyCollectionFilter | Ref<PropertyCollectionFilter | null | undefined> | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Property.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-properties/docs/contract.md
 *
 * This file adapts Property root/app authority sources into the private /console/property selected runtime.
 * It should not become a Portfolio management seam or a public property info page helper.
 */
export function usePropertyConsole(options: UsePropertyConsoleOptions = {}) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<PropertyCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { properties: liveProperties } = usePropertyCollection({
    shape: 'both',
    source: 'live',
    filter: liveFilter,
  })
  const { properties: demoProperties } = usePropertyCollection({ source: 'demo' })
  const { properties: testProperties } = usePropertyCollection({ source: 'test' })
  const testProperty = computed<Property | null>(() => testProperties.value[0] ?? null)

  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Property, Property, Property>('property', {
    liveItems: liveProperties,
    demoItems: demoProperties,
    testItem: testProperty,
    getId: (property) => normalizeString(property?.id),
  })

  const selectedProperty = computed<Property | null>(() => selectedEntity.value)
  const propertyId = computed(() => normalizeString(selectedId.value))
  const activePropertyAppId = computed(() =>
    selectedMode.value === 'live'
      ? resolveConsoleEntityAppId(selectedProperty.value, appId)
      : ''
  )
  const rootCollection = computed(() =>
    resolveConsoleRootCollection(PropertyStorage.rootCollection, selectedMode.value)
  )
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') return Boolean(userId.value && propertyId.value === userId.value)
    return targetHasOperator(selectedProperty.value, userId.value)
  })

  const header = computed<ConsoleHeaderData>(() => {
    const property = selectedProperty.value
    if (!property) return null

    return {
      title: normalizeString(property.identity?.name) || normalizeString(property.id),
      subtitle: [
        property.identity?.city,
        property.identity?.country,
      ].map((part) => normalizeString(part)).filter(Boolean).join(', ') || undefined,
      imageUrl: normalizeString(property.identity?.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('property', header)

  const clearSelectedProperty = () => {
    clearSelection()
  }

  const selectProperty = (propertyId: string, mode: PropertyConsoleMode = 'live') => {
    selectEntity(propertyId, mode)
  }

  return {
    liveProperties,
    demoProperties,
    testProperty,
    selectedProperty,
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
    selectProperty,
  }
}
