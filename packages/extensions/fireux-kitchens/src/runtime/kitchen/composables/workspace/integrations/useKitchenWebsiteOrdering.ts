import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { computed } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenWorkspaceIdentity } from '../identity/useKitchenWorkspaceIdentity'
import { readAllowedWebsites } from '../../../utils/allowed-websites'

export function useKitchenWebsiteOrdering() {
  const identity = useKitchenWorkspaceIdentity()
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser } = useUserSession()
  const captureIntent = useCommandScope([() => currentUser.value?.uid, () => config.appId, () => JSON.stringify(appUser.value), identity.kitchenId, identity.canWrite])
  const source = useLiveAsyncData<{
    kitchenId: string
    allowed_origins: string[]
  }>(
    computed(
      () =>
        `kitchen-websites-${currentUser.value?.uid || 'none'}-${identity.kitchenId.value || 'none'}`
    ),
    async (liveFetch) => {
      const user = currentUser.value
      const kitchenId = identity.kitchenId.value
      if (!user || !kitchenId) return { kitchenId: '', allowed_origins: [] }
      return liveFetch('/api/workspace/kitchen/website-ordering', {
        query: { kitchenId },
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    { server: false, watch: [currentUser, identity.kitchenId] }
  )
  const outcome = computed(() => {
    if (source.status.value === 'error') return 'error'
    if (source.status.value === 'idle') return 'idle'
    if (
      source.status.value === 'pending' ||
      source.data.value?.kitchenId !== identity.kitchenId.value
    )
      return 'pending'
    return 'ready'
  })
  const parsed = computed(() => {
    try {
      return { origins: readAllowedWebsites(source.data.value), error: '' }
    } catch {
      return {
        origins: [],
        error: 'Website settings could not be read. Please try again.',
      }
    }
  })
  const error = computed(() =>
    source.error.value
      ? 'Website settings could not be loaded. Please try again.'
      : parsed.value.error
  )
  const canWrite = computed(
    () => identity.canWrite.value && outcome.value === 'ready' && !error.value
  )
  async function update(allowed_origins: string[]) {
    if (!canWrite.value)
      throw new Error('Website settings cannot be edited right now.')
    const isCurrent = captureIntent()
    const origins = [...allowed_origins]
    const kitchenId = identity.kitchenId.value
    const user = currentUser.value
    const token = await user?.getIdToken()
    if (
      !isCurrent() || !token ||
      user?.uid !== currentUser.value?.uid ||
      kitchenId !== identity.kitchenId.value ||
      !canWrite.value
    )
      throw new Error(
        'The selected Kitchen or account changed. Please try again.'
      )
    const result = await $fetch<{ ok: true; kitchenId: string }>('/api/workspace/kitchen/website-ordering', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: { kitchenId, allowed_origins: origins },
      retry: 0,
    })
    if (result?.ok !== true || result.kitchenId !== kitchenId) throw new Error('Website settings response did not match the requested Kitchen.')
  }
  return {
    captureIntent,
    kitchenId: identity.kitchenId,
    origins: computed(() => parsed.value.origins),
    outcome,
    error,
    canWrite,
    update,
  }
}
