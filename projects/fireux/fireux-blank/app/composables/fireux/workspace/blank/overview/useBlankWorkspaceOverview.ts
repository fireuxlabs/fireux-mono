// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Blank target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useBlankWorkspace } from '../core/useBlankWorkspace'

export function useBlankWorkspaceOverview() {
  const {
    blanks,
    selection,
    runtime,
    actions,
  } = useBlankWorkspace()

  const focus = computed(() => ({
    entity: selection.blank.value,
    id: normalizeString(selection.blank.value?.id),
    hasSelection: Boolean(selection.blank.value),
    outcome: blanks.outcome.value,
  }))
  const multiple = computed(() => ({
    items: blanks.targets.value,
    count: blanks.count.value,
    hasItems: blanks.count.value > 0,
    outcome: blanks.outcome.value,
  }))
  const debug = computed(() => ({
    blankId: selection.blankId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: focus.value,
    multiple: {
      count: multiple.value.count,
      ids: multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    focus,
    multiple,
    outcome: blanks.outcome,
    selectedBlank: selection.blank,
    blankId: selection.blankId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedBlank: actions.clearSelectedBlank,
    debug,
  }
}
