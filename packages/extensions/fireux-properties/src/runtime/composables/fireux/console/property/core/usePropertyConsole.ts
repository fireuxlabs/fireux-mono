import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { PropertyStorage, type Property } from '../../../../../models/property.model'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../../firestore/property/fetch/usePropertyCollection'
import type { Ref } from 'vue'

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
  const targetFilter = computed<PropertyCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    if (Array.isArray(explicitFilter.ids)) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const { properties: targetProperties, pending: targetsPending } = usePropertyCollection({
    shape: 'both',
    filter: targetFilter,
  })

  const {
    selectedId,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Property>('property', {
    targetItems: targetProperties,
    getId: (property) => normalizeString(property?.id),
  })

  const selectedProperty = computed<Property | null>(() => selectedEntity.value)
  const propertyId = computed(() => normalizeString(selectedId.value))
  const activePropertyAppId = computed(() =>
    resolveConsoleEntityAppId(selectedProperty.value, appId)
  )
  const rootCollection = computed(() =>
    PropertyStorage.rootCollection
  )
  const readOnly = computed(() => false)
  const canWrite = computed(() =>
    !readOnly.value && targetHasOperator(selectedProperty.value, userId.value)
  )

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

  const selectProperty = (propertyId: string) => {
    selectEntity(propertyId)
  }
  const properties = {
    targets: targetProperties,
    count: computed(() => targetProperties.value.length),
    pending: targetsPending,
  }
  const selection = {
    property: selectedProperty,
    propertyId,
    hasSelection: computed(() => Boolean(propertyId.value)),
  }
  const runtime = {
    appId: activePropertyAppId,
    rootCollection,
    readOnly,
    canWrite,
  }
  const actions = {
    selectProperty,
    clearSelectedProperty,
  }

  return {
    properties,
    selection,
    runtime,
    actions,
  }
}
