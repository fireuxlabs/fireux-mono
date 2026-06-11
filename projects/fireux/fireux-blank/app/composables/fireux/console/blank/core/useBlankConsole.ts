import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankCollection } from '../../../firestore/blank/useBlank'
import type { Blank } from '../../../../../models/blank.model'

type BlankConsoleMode = 'live'

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations, child records, demo mode, or test mode.
 */
export function useBlankConsole() {
  const { blanks, pending, rootCollectionPath, appCollectionPath } =
    useBlankCollection()
  const liveBlanks = computed(() => blanks.value)
  const {
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Blank>('blank', {
    liveItems: liveBlanks,
    getId: (target) => normalizeString(target?.id),
  })
  const selectedBlank = computed<Blank | null>(() => selectedEntity.value)
  const selectedMode = computed<BlankConsoleMode>(() => 'live')
  const blankId = computed(() => normalizeString(selectedBlank.value?.id))
  const rootCollection = computed(() => rootCollectionPath)
  const hasLiveBlanks = computed(() => liveBlanks.value.length > 0)
  const canWrite = computed(() => false)
  const selectBlank = (blankId: string, _mode: BlankConsoleMode = 'live') => {
    selectEntity(blankId, 'live')
  }
  const clearSelectedBlank = () => {
    clearSelection()
  }

  return {
    liveBlanks,
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    hasLiveBlanks,
    pending,
    rootCollectionPath,
    appCollectionPath,
    canWrite,
    selectBlank,
    clearSelectedBlank,
  }
}
