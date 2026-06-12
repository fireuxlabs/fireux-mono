import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
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
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Blank>('blank', {
    targetItems: targetBlanks,
    getId: (target) => normalizeString(target?.id),
  })
  const selectedBlank = computed<Blank | null>(() => selectedEntity.value)
  const blankId = computed(() => normalizeString(selectedBlank.value?.id))
  const rootCollection = computed(() => rootCollectionPath)
  const hasTargets = computed(() => targetBlanks.value.length > 0)
  const readOnly = computed(() => true)
  const canWrite = computed(() => false)
  const header = computed<ConsoleHeaderData>(() => {
    const blank = selectedBlank.value
    if (!blank) return null

    return {
      title: normalizeString(blank.name) || normalizeString(blank.id),
      subtitle: normalizeString(blank.slug) || undefined,
    }
  })

  usePublishConsoleHeader('blank', header)

  const selectBlank = (blankId: string) => {
    selectEntity(blankId)
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
