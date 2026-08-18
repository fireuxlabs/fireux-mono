// Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: carry Blank target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/console/useConsoleOverview'
import type { Blank } from '../../../../../models/blank.model'
import { useBlankConsole } from '../core/useBlankConsole'

export function useBlankConsoleOverview() {
  const {
    blanks,
    selection,
    runtime,
    actions,
  } = useBlankConsole()

  const overview = useConsoleOverview<Blank>({
    selectedEntity: selection.blank,
    targetItems: blanks.targets,
    targetOutcome: blanks.outcome,
    getId: (blank) => normalizeString(blank?.id),
  })
  const debug = computed(() => ({
    blankId: selection.blankId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedBlank: selection.blank,
    blankId: selection.blankId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedBlank: actions.clearSelectedBlank,
    debug,
  }
}
