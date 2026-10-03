import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { onScopeDispose, watch, type WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

/** Invalidate Recipe editor continuations when their visible destination changes. */
export function useRecipeScope(sources: WatchSource[], reset: () => void = () => {}) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const context = [() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), ...sources]
  const capture = useCommandScope(context)
  let epoch = 0
  const invalidate = () => { epoch += 1; reset() }
  watch(context, invalidate, { flush: 'sync' })
  onScopeDispose(invalidate)
  return () => {
    const expected = epoch
    const current = capture()
    return () => current() && expected === epoch
  }
}
