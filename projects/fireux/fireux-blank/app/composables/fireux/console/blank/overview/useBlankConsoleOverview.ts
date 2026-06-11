import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import type { Blank } from '../../../models/blank.model'
import { useBlankConsole } from '../core/useBlankConsole'

export function useBlankConsoleOverview() {
  const {
    liveBlanks,
    demoBlanks,
    testBlank,
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    canWrite,
    clearSelectedBlank,
  } = useBlankConsole()

  const overview = useConsoleOverview<Blank>({
    selectedEntity: selectedBlank,
    selectedMode,
    liveItems: liveBlanks,
    demoItems: demoBlanks,
    testItem: testBlank,
    getId: (blank) => normalizeString(blank?.id),
  })
  const debug = computed(() => ({
    selectedMode: selectedMode.value,
    blankId: blankId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedBlank,
    selectedMode,
    blankId,
    rootCollection,
    canWrite,
    clearSelectedBlank,
    debug,
  }
}
