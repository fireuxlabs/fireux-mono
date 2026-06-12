import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankCollection } from '../../../firestore/blank/useBlank'
import type { Blank } from '../../../../../models/blank.model'

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations or child records.
 */
export function useBlankConsole() {
  const { blanks, pending, rootCollectionPath, appCollectionPath } =
    useBlankCollection()
  const targetBlanks = computed(() => blanks.value)
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
  const canWrite = computed(() => false)
  const selectBlank = (blankId: string) => {
    selectEntity(blankId)
  }
  const clearSelectedBlank = () => {
    clearSelection()
  }

  return {
    targetBlanks,
    selectedBlank,
    blankId,
    rootCollection,
    hasTargets,
    pending,
    rootCollectionPath,
    appCollectionPath,
    canWrite,
    selectBlank,
    clearSelectedBlank,
  }
}
