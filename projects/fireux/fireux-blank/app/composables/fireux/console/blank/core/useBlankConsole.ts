// Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: carry Blank target outcome.
// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine project cleanup: adopt authoritative target outcomes.
import { computed } from 'vue'
import {
  useConsole,
  type ConsoleSource,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleEntityRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleEntityRuntime'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useBlankCollection } from '../../../firestore/blank/useBlank'
import { BlankStorage, type Blank } from '../../../../../models/blank.model'

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations or child records.
 */
export function useBlankConsole() {
  const consoleRoot = useConsole('blank')
  const {
    blanks: blankRecords,
    outcome,
    pending,
    error,
    appCollectionPath,
  } =
    useBlankCollection({ source: consoleRoot.source })
  const targetBlanks = computed(() => blankRecords.value)
  const entity = useConsoleEntityRuntime<Blank>({
    family: 'blank',
    storageFamily: BlankStorage.rootCollection,
    targetItems: targetBlanks,
    targetOutcome: outcome,
    getId: (target) => normalizeString(target?.id),
    mode: consoleRoot.source,
    readOnly: true,
  })
  const selectedBlank = computed<Blank | null>(
    () => entity.selection.selectedTarget.value
  )
  const blankId = entity.selection.entityId
  const hasTargets = computed(() => targetBlanks.value.length > 0)
  const selectBlank = (
    blankId: string,
    source: ConsoleSource = consoleRoot.source.value
  ) => {
    entity.actions.selectTarget(blankId, source)
  }
  const clearSelectedBlank = () => {
    entity.actions.clearSelection()
  }

  const blanks = {
    targets: targetBlanks,
    count: computed(() => targetBlanks.value.length),
    pending,
    error,
    outcome,
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
    selection,
    runtime,
    actions,
  }
}
