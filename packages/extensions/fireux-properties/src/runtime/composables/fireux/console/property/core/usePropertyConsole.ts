// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: validate Property selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: request the explicit root-with-App-support read shape.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: make Property core own target ids and membership outcome.
import { computed, isRef, type Ref } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  PropertyStorage,
  type Property,
} from '../../../../../models/property.model'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../../firestore/property/fetch/usePropertyCollection'
import { usePropertyConsoleDemoData } from './usePropertyConsoleDemoData'

type UsePropertyConsoleOptions = {
  filter?:
    | PropertyCollectionFilter
    | Ref<PropertyCollectionFilter | null | undefined>
    | null
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
  const consoleTargets = useConsoleTargets({ family: 'property' })
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed<PropertyCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? (options.filter.value ?? {})
      : (options.filter ?? {})

    if (consoleRoot.source.value === 'demo') return explicitFilter
    return consoleTargets.filter(explicitFilter)
  })
  const liveCollection = usePropertyCollection({
    source: consoleRoot.source,
    shape: 'root-with-app-support',
    filter: targetFilter,
  })
  const demoData = usePropertyConsoleDemoData(
    computed(() => consoleRoot.source.value === 'demo')
  )
  const targetProperties = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.properties.value
      : liveCollection.properties.value
  )
  const targetsPending = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.error.value
      : liveCollection.error.value
  )
  const sourceTargetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? demoData.outcome.value
      : liveCollection.outcome.value
  )
  const membershipAwareTargetsOutcome =
    consoleTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    consoleRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

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
    targeting: consoleTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}
