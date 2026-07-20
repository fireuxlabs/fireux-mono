// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: validate Property selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: request the explicit root-with-App-support read shape.
import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { PropertyStorage, type Property } from '../../../../../models/property.model'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../../firestore/property/fetch/usePropertyCollection'

type ConsoleTargetOutcomeRef =
  | Ref<ConsoleTargetOutcome>
  | ComputedRef<ConsoleTargetOutcome>

type UsePropertyConsoleOptions = {
  filter?: PropertyCollectionFilter | Ref<PropertyCollectionFilter | null | undefined> | null
  resolveTargetOutcome?: (
    sourceOutcome: ConsoleTargetOutcomeRef
  ) => ConsoleTargetOutcomeRef
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
    outcome: sourceTargetsOutcome,
  } = usePropertyCollection({
    source: consoleRoot.source,
    shape: 'root-with-app-support',
    filter: targetFilter,
  })
  const targetsOutcome = options.resolveTargetOutcome
    ? options.resolveTargetOutcome(sourceTargetsOutcome)
    : sourceTargetsOutcome

  const entity = useConsoleEntityRuntime<Property>({
    family: 'property',
    storageFamily: PropertyStorage.rootCollection,
    targetItems: targetProperties,
    targetOutcome: targetsOutcome,
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
    error: targetsError,
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
