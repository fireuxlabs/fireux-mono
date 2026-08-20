// Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: carry Blank target outcome.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt authoritative target outcomes.
// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: make Blank core own membership-aware exact targets.
import { computed } from 'vue'
import {
  useWorkspace,
  type WorkspaceSource,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { workspaceData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceEntityRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntityRuntime'
import { useWorkspaceFamilyRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime'
import { useWorkspaceTargets } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTargets'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useBlankCollection } from '../../../firestore/blank/useBlank'
import {
  BlankStorage,
  type BlankSurface,
} from '../../../../../models/blank.model'
import { useBlankWorkspaceDemoData } from './useBlankWorkspaceDemoData'

/**
 * Blank workspace harness.
 *
 * Blank has a root-target create/list seam so the workspace lifecycle can be
 * tested without domain operations or child records.
 */
function createBlankWorkspace() {
  const workspaceRoot = useWorkspace('blank')
  const workspaceTargets = useWorkspaceTargets({ family: 'blank' })
  const {
    blanks: blankRecords,
    outcome,
    pending,
    error,
    appCollectionPath,
  } = useBlankCollection({
    source: workspaceRoot.source,
  })
  const demoData = useBlankWorkspaceDemoData(
    computed(() => workspaceRoot.source.value === 'demo')
  )
  const liveTargetOutcome = workspaceTargets.resolveOutcome(outcome)
  const targetOutcome = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? demoData.outcome.value
      : liveTargetOutcome.value
  )
  const targetBlanks = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoData.data.value ?? [])
      : blankRecords.value
  )
  const targetData = computed(() =>
    workspaceRoot.source.value === 'demo'
      ? (demoData.data.value ?? []).map(blank => workspaceData('demo', blank))
      : blankRecords.value.map(blank => workspaceData('live', blank))
  )
  const entity = useWorkspaceEntityRuntime<BlankSurface>({
    family: 'blank',
    storageFamily: BlankStorage.rootCollection,
    targetData,
    targetOutcome,
    getId: (target) => normalizeString(target?.id),
    mode: workspaceRoot.source,
    readOnly: true,
    enforcedTargetId: workspaceTargets.singleTargetId,
  })
  const selectedBlank = computed<BlankSurface | null>(
    () => entity.selection.selectedTarget.value
  )
  const blankId = entity.selection.entityId
  const hasTargets = computed(() => targetBlanks.value.length > 0)
  const selectBlank = (
    blankId: string,
    source: WorkspaceSource = workspaceRoot.source.value
  ) => {
    entity.actions.selectTarget(blankId, source)
  }
  const clearSelectedBlank = () => {
    entity.actions.clearSelection()
  }

  const blanks = {
    targets: targetBlanks,
    count: computed(() => targetBlanks.value.length),
    pending: computed(() =>
      workspaceRoot.source.value === 'demo'
        ? demoData.pending.value
        : pending.value
    ),
    error: computed(() =>
      workspaceRoot.source.value === 'demo' ? demoData.error.value : error.value
    ),
    outcome: targetOutcome,
    hasTargets,
  }
  const selection = {
    blank: selectedBlank,
    blankId,
    hasSelection: entity.selection.hasSelection,
  }
  const runtime = {
    ...entity.runtime,
    appCollectionPath,
  }
  const actions = {
    selectBlank,
    clearSelectedBlank,
  }

  return {
    blanks,
    targeting: workspaceTargets,
    selection,
    runtime,
    actions,
  }
}

export function useBlankWorkspace() {
  return useWorkspaceFamilyRuntime('blank', createBlankWorkspace)
}
