import { onBeforeUnmount, watch, type WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

/** Invalidate Recipe editor continuations when their visible destination changes. */
export function useRecipeScope(sources: WatchSource[], reset: () => void = () => {}) {
  const { currentUser } = useAuth()
  let epoch = 0
  const invalidate = () => { epoch += 1; reset() }
  watch([() => currentUser.value?.uid, ...sources], invalidate, { flush: 'sync' })
  onBeforeUnmount(invalidate)
  return () => {
    const expected = epoch
    return () => expected === epoch
  }
}
