import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankConsole } from '../core/useBlankConsole'

export function useBlankConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = useBlankConsole()
  const selectedBlank = selection.blank
  const blankId = selection.blankId
  const selectedId = computed(() => blankId.value)
  const name = computed(() => normalizeString(selectedBlank.value?.name))
  const slug = computed(() => normalizeString(selectedBlank.value?.slug))
  const debug = computed(() => ({
    blankId: blankId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    name: name.value,
    slug: slug.value,
    selectedBlank: selectedBlank.value,
  }))

  return {
    selectedBlank,
    blankId,
    selectedId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedBlank: actions.clearSelectedBlank,
    name,
    slug,
    debug,
  }
}

export type BlankConsoleIdentityState = ReturnType<
  typeof useBlankConsoleIdentity
>
