import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useKitchenAccess } from '../useKitchenAccess'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { onScopeDispose, watch, type WatchSource } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

/** Invalidate Recipe editor continuations when their visible destination changes. */
export function useRecipeScope(
  sources: WatchSource[],
  reset: () => void = () => {}
) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const access = useKitchenAccess()
  const context = [
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
    ...sources,
  ]
  const capture = useCommandScope(context)
  watch(context, reset, { flush: 'sync' })
  onScopeDispose(reset)
  return () => {
    const current = capture()
    return () =>
      current() &&
      !appPending.value &&
      !appError.value &&
      appOutcome.value === 'ready' &&
      access.outcome.value === 'ready'
  }
}
