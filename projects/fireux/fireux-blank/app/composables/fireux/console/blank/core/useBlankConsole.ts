import { computed } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useBlankCollection } from '../../../firestore/blank/useBlank'
import type { Blank } from '../../../../../models/blank.model'

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations or child records.
 */
export function useBlankConsole() {
  const {
    blanks: blankRecords,
    pending,
    rootCollectionPath,
    appCollectionPath,
  } =
    useBlankCollection()
  const targetBlanks = computed(() => blankRecords.value)
  const {
    selectedTarget,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<Blank>('blank', {
    targetItems: targetBlanks,
    getId: (target) => normalizeString(target?.id),
  })
  const selectedBlank = computed<Blank | null>(() => selectedTarget.value)
  const blankId = computed(() => normalizeString(selectedBlank.value?.id))
  const rootCollection = computed(() => rootCollectionPath)
  const hasTargets = computed(() => targetBlanks.value.length > 0)
  const readOnly = computed(() => true)
  const canWrite = computed(() => false)
  const selectBlank = (blankId: string) => {
    selectTarget(blankId)
  }
  const clearSelectedBlank = () => {
    clearSelection()
  }

  const blanks = {
    targets: targetBlanks,
    count: computed(() => targetBlanks.value.length),
    pending,
    hasTargets,
  }
  const selection = {
    blank: selectedBlank,
    blankId,
    hasSelection: computed(() => Boolean(blankId.value)),
  }
  const runtime = {
    rootCollection,
    appCollectionPath,
    readOnly,
    canWrite,
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
