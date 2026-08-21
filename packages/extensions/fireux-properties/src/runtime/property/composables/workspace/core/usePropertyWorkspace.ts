// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: validate Property selection only after membership and collection outcomes are composed.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: request the explicit root-with-App-support read shape.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: make Property core own target ids and membership outcome.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  useWorkspace,
  type WorkspaceSource,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { workspaceData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceEntityRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntityRuntime'
import { useWorkspaceFamilyRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime'
import { useWorkspaceTargets } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTargets'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { PropertyStorage } from '../../../models/property.model.ts'
import { usePropertyCollection } from '../../firestore/fetch/usePropertyCollection'
import type { PropertySurface } from '../../firestore/utils/view/usePropertyInterface'
import { usePropertyWorkspaceDemoData } from './usePropertyWorkspaceDemoData'

/**
 * FireUX stack family: Workspace-backed root entity.
 * Entity: Property.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-properties/docs/contract.md
 *
 * This file adapts Property root/app authority sources into the private /workspace/property selected runtime.
 * It should not become a Portfolio management seam or a public property info page helper.
 */
function createPropertyWorkspace() {
  const workspaceRoot = useWorkspace('property')
  const workspaceTargets = useWorkspaceTargets({ family: 'property' })
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const targetFilter = computed(() => {
    if (workspaceRoot.source.value === 'demo') return {}
    return workspaceTargets.filter({
      operatorId: userId.value,
    })
  })
  const liveCollection = usePropertyCollection({
    source: workspaceRoot.source,
    filter: targetFilter,
  })
  const demoData = usePropertyWorkspaceDemoData(
    computed(() => workspaceRoot.source.value === 'demo')
  )
  const targetProperties = computed<PropertySurface[]>(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.properties.value
      : liveCollection.properties.value
  )
  const targetData = computed(() => {
    const type =
      workspaceRoot.source.value === 'demo'
        ? 'demo'
        : workspaceRoot.source.value === 'test'
          ? 'test'
          : 'live'
    return targetProperties.value.map((property) =>
      workspaceData(type, property)
    )
  })
  const targetsPending = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.pending.value
      : liveCollection.pending.value
  )
  const targetsError = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.error.value
      : liveCollection.error.value
  )
  const sourceTargetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.outcome.value
      : liveCollection.outcome.value
  )
  const membershipAwareTargetsOutcome =
    workspaceTargets.resolveOutcome(sourceTargetsOutcome)
  const targetsOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? sourceTargetsOutcome.value
      : membershipAwareTargetsOutcome.value
  )

  const entity = useWorkspaceEntityRuntime<PropertySurface>({
    family: 'property',
    storageFamily: PropertyStorage.rootCollection,
    targetData,
    targetOutcome: targetsOutcome,
    getId: (property) => normalizeString(property?.id),
    mode: workspaceRoot.source,
    userId,
    enforcedTargetId: workspaceTargets.singleTargetId,
  })

  const selectedProperty = computed<PropertySurface | null>(
    () => entity.selection.selectedTarget.value
  )
  const propertyId = entity.selection.entityId

  const clearSelectedProperty = () => {
    entity.actions.clearSelection()
  }

  const selectProperty = (
    propertyId: string,
    source: WorkspaceSource = workspaceRoot.source.value
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
    targeting: workspaceTargets,
    selection,
    runtime: entity.runtime,
    actions,
  }
}

export function usePropertyWorkspace() {
  return useWorkspaceFamilyRuntime('property', createPropertyWorkspace)
}
