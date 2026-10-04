import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { ref, watch, type WatchSource } from 'vue'

export function useJobCommand(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const sources = [() => currentUser.value?.uid, () => config.appId, appUser, appPending, appError, appOutcome, () => route.fullPath, ...ownerSources]
  const captureIntent = useCommandScope(sources), scopeEpoch = ref(0)
  watch(sources, () => { scopeEpoch.value += 1 }, { flush: 'sync' })
  async function command<T>(path: string, method: 'POST' | 'PATCH', input?: unknown): Promise<T> {
    const uid = currentUser.value?.uid, isCurrent = captureIntent()
    const body = input === undefined ? undefined : JSON.parse(JSON.stringify(input))
    const assertCurrent = () => { if (!uid || !isCurrent()) throw new Error('The account, App or page changed. Reopen this Job action.') }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen this Job action.')
    const token = await user.getIdToken()
    assertCurrent()
    return $fetch<T>(path, { method, headers: { Authorization: `Bearer ${token}` }, ...(body === undefined ? {} : { body }) })
  }
  return { command, captureIntent, scopeEpoch }
}
