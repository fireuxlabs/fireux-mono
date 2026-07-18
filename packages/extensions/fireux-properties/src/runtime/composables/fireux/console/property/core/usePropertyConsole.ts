import { computed, isRef } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
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
  const consoleRoot = useConsole('property')
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<PropertyCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    if (
      consoleRoot.source.value !== 'live' ||
      Array.isArray(explicitFilter.ids)
    ) return explicitFilter

    return {
      ...explicitFilter,
      operatorId: userId.value,
    }
  })
  const {
    properties: targetProperties,
    pending: targetsPending,
    error: targetsError,
    outcome: targetsOutcome,
  } = usePropertyCollection({
    source: consoleRoot.source,
    shape: 'both',
    filter: targetFilter,
  })

  const entity = useConsoleEntityRuntime<Property>({
    family: 'property',
    storageFamily: PropertyStorage.rootCollection,
    targetItems: targetProperties,
    targetPending: targetsPending,
    targetError: targetsError,
    getId: (property) => normalizeString(property?.id),
    mode: consoleRoot.source,
    userId,
  })

  const selectedProperty = computed<Property | null>(
    () => entity.selection.selectedTarget.value
  )
  const propertyId = entity.selection.entityId

  const clearSelectedProperty = () => {
    entity.actions.clearSelection()
  }

  const selectProperty = (
    propertyId: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    entity.actions.selectTarget(propertyId, source)
  }
  const properties = {
    targets: targetProperties,
    count: computed(() => targetProperties.value.length),
    pending: targetsPending,
    outcome: targetsOutcome,
  }
  const selection = {
    property: selectedProperty,
    propertyId,
    hasSelection: entity.selection.hasSelection,
  }
  const actions = {
    selectProperty,
    clearSelectedProperty,
  }

  return {
    properties,
    selection,
    runtime: entity.runtime,
    actions,
  }
}
