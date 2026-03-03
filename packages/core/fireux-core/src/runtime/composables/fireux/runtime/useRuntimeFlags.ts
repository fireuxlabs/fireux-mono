import { computed, type Ref } from 'vue'

/**
 * Shared "isLoading / isReady" flags.
 * Keep it dumb and predictable.
 */
export function useRuntimeFlags(params: {
  id: Ref<string>
  pending?: Ref<boolean> | null
  hasDoc?: Ref<boolean> | null
}) {
  const isLoading = computed(() => Boolean(params.pending?.value))
  const isReady = computed(() => {
    if (!params.id.value) return false
    if (isLoading.value) return false
    if (params.hasDoc) return Boolean(params.hasDoc.value)
    return true
  })

  return { isLoading, isReady }
}
