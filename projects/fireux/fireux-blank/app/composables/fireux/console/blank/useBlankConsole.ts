import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankCollection } from '../../firestore/blank/useBlank'
import type { Blank } from '../../../../models/blank.model'

type BlankConsoleMode = ConsoleMode

const demoBlanks: Blank[] = [
  {
    id: 'demo-blank-console',
    app_scope_state: 'root_only',
    app_scope_app_id: 'fireux-blank',
    name: 'Demo Blank Console',
    slug: 'demo-blank-console',
    status: 'active',
    operator_ids: [],
  },
]

/**
 * Blank console harness.
 *
 * Blank has a root-target create/list seam so the console lifecycle can be
 * tested without domain operations or child records. Demo targets are static,
 * selectable, and read-only.
 */
export function useBlankConsole() {
  const { blanks, pending, rootCollectionPath, appCollectionPath } =
    useBlankCollection()
  const liveBlanks = computed(() => blanks.value)
  const demoBlanksRef = computed(() => demoBlanks)
  const testBlank = computed<Blank | null>(() => null)
  const {
    selectedEntity,
    selectedMode,
    selectedId,
    selectEntity,
    clearSelection,
  } = useConsole<Blank, Blank, Blank>('blank', {
    liveItems: liveBlanks,
    demoItems: demoBlanksRef,
    testItem: testBlank,
    getId: (target) => normalizeString(target?.id),
  })
  const selectedBlank = computed<Blank | null>(() => selectedEntity.value)
  const blankId = computed(() => normalizeString(selectedId.value))
  const rootCollection = computed(() => rootCollectionPath)
  const hasLiveBlanks = computed(() => liveBlanks.value.length > 0)
  const canWrite = computed(() => false)
  const selectBlank = (blankId: string, mode: BlankConsoleMode = 'live') => {
    selectEntity(blankId, mode)
  }
  const clearSelectedBlank = () => {
    clearSelection()
  }

  return {
    liveBlanks,
    demoBlanks: demoBlanksRef,
    testBlank,
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
