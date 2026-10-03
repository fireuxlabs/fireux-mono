import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { watch, type WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

/** Invalidate Menu editor continuations when their visible destination changes. */
export function useMenuEditorScope(sources: WatchSource[], reset: () => void = () => {}) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const context = [() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), ...sources]
  watch(context, reset, { flush: 'sync' })
  return useCommandScope(context)
}
