import { type WatchSource, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

export function useBlogCommand(ownerSources: WatchSource[] = []) {
  const { currentUser } = useAuth(), config = useFireUXConfig(), route = useRoute()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const scopeEpoch = ref(0)
  const sources = [() => currentUser.value?.uid, () => config.appId, appUser, appPending, appError, appOutcome, () => route.fullPath, ...ownerSources]
  watch(sources, () => { scopeEpoch.value += 1 }, { flush: 'sync' })
  const captureIntent = useCommandScope(sources)
  async function command(slug: string, action: 'create' | 'update' | 'publish', input: unknown) {
    const isCurrent = captureIntent(), uid = currentUser.value?.uid, appId = config.appId
    const body = JSON.parse(JSON.stringify(input))
    const assertCurrent = () => { if (!uid || !isCurrent()) throw new Error('The account, App or page changed. Reopen Blog authoring.') }
    assertCurrent()
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Blog authoring.')
    const token = await user.getIdToken()
    assertCurrent()
    const path = action === 'create' ? '' : `/${encodeURIComponent(slug)}${action === 'publish' ? '/publish' : ''}`
    const result = await $fetch<{ ok: boolean; appId: string; slug: string }>(`/api/internal/blogs${path}`, { method: action === 'update' ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body })
    if (result?.ok !== true || result.appId !== appId || result.slug !== slug) throw new Error('Blog response did not match the requested App and post.')
    return result
  }
  return { command, captureIntent, scopeEpoch }
}
