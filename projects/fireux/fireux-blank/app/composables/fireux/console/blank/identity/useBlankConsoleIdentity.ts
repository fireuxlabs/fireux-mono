import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useBlankConsole } from '../core/useBlankConsole'

export function useBlankConsoleIdentity() {
  const {
    selectedBlank,
    blankId,
    rootCollection,
    canWrite,
    clearSelectedBlank,
  } = useBlankConsole()
  const selectedId = computed(() => blankId.value)
  const name = computed(() => normalizeString(selectedBlank.value?.name))
  const slug = computed(() => normalizeString(selectedBlank.value?.slug))
  const debug = computed(() => ({
    blankId: blankId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    slug: slug.value,
    selectedBlank: selectedBlank.value,
  }))

  return {
    selectedBlank,
    blankId,
    selectedId,
    rootCollection,
    canWrite,
    clearSelectedBlank,
    name,
    slug,
    debug,
  }
}

export type BlankConsoleIdentityState = ReturnType<
  typeof useBlankConsoleIdentity
>
