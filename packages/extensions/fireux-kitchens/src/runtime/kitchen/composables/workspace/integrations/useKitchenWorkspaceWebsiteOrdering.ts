import { resolveHttpDocumentOutcome } from 'fireux-core/runtime/utils/http-document-outcome'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'

import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenWorkspaceIdentity } from '../useKitchenWorkspaceIdentity'
import {
  normalizeAllowedWebsites,
  readAllowedWebsites,
} from '../../../utils/allowed-websites'

export function useKitchenWorkspaceWebsiteOrdering() {
  const identity = useKitchenWorkspaceIdentity()
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const access = useKitchenAccess()
  const disposed = ref(false)
  const ownerSources = [
    currentUser,
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    access.pending,
    access.error,
    access.outcome,
    identity.kitchenId,
    identity.outcome,
    identity.canWrite,
    () => identity.selectedKitchen.value?.id,
  ]
  const ownerEpoch = ref(0)
  watch(
    ownerSources,
    () => {
      ownerEpoch.value++
    },
    { flush: 'sync' }
  )
  onScopeDispose(() => {
    disposed.value = true
    ownerEpoch.value++
  })
  const ownerScope = computed(() => ownerEpoch.value)
  const captureIntent = useCommandScope(ownerSources)
  const ownerOutcome = computed(() => {
    if (disposed.value || !currentUser.value) return 'idle'
    if (appError.value || appOutcome.value === 'error') return 'error'
    if (appPending.value || ['idle', 'pending'].includes(appOutcome.value))
      return 'pending'
    if (
      !config.appId ||
      !appUser.value ||
      appUser.value.id !== currentUser.value.uid ||
      appOutcome.value !== 'ready'
    )
      return 'idle'
    if (access.error.value || access.outcome.value === 'error') return 'error'
    if (
      access.pending.value ||
      ['idle', 'pending'].includes(access.outcome.value)
    )
      return 'pending'
    if (identity.outcome.value !== 'ready') return identity.outcome.value
    const id = identity.kitchenId.value
    if (
      !isFirestoreDocumentId(id) ||
      access.outcome.value !== 'ready' ||
      !access.ids.value.includes(id)
    )
      return 'idle'
    return identity.selectedKitchen.value?.id === id ? 'ready' : 'pending'
  })
  const storageKitchenId = computed(() =>
    ownerOutcome.value === 'ready' ? identity.kitchenId.value : ''
  )
  const requestEpoch = ref(-1)
  const source = useLiveAsyncData<{
    scope: number
    kitchenId: string
    allowed_origins: string[]
  } | null>(
    computed(
      () =>
        `kitchen-websites-${config.appId}-${currentUser.value?.uid || 'none'}-${identity.kitchenId.value || 'none'}-${ownerEpoch.value}`
    ),
    async (liveFetch) => {
      if (!storageKitchenId.value) return null
      const isCurrent = captureIntent()
      const epoch = ownerEpoch.value
      requestEpoch.value = epoch
      const user = currentUser.value!
      const kitchenId = storageKitchenId.value
      try {
        const token = await user.getIdToken()
        if (!isCurrent() || !storageKitchenId.value || !token) return null
        const response = await liveFetch<{
          kitchenId: string
          allowed_origins: string[]
        }>('/api/workspace/kitchen/website-ordering', {
          query: { kitchenId },
          headers: { authorization: `Bearer ${token}` },
        })
        if (!isCurrent() || storageKitchenId.value !== kitchenId) return null
        if (response?.kitchenId !== kitchenId)
          throw new Error(
            'Website settings response did not match the requested Kitchen.'
          )
        return {
          scope: epoch,
          kitchenId,
          allowed_origins: readAllowedWebsites(response),
        }
      } catch (error) {
        if (!isCurrent() || !storageKitchenId.value) return null
        throw error
      }
    },
    { server: false, watch: [ownerScope] }
  )
  const outcome = computed(() => {
    if (ownerOutcome.value !== 'ready') {
      return ownerOutcome.value
    }
    if (!storageKitchenId.value) return 'idle'
    const responseCurrent =
      source.status.value === 'error'
        ? requestEpoch.value === ownerEpoch.value
        : source.data.value?.scope === ownerEpoch.value &&
          source.data.value?.kitchenId === storageKitchenId.value
    if (!responseCurrent) return 'pending'
    return resolveHttpDocumentOutcome({
      enabled: Boolean(storageKitchenId.value),
      pending: source.pending.value || source.status.value !== 'success',
      error: source.error.value,
      present: Boolean(source.data.value),
    })
  })
  const error = computed(() =>
    outcome.value === 'error'
      ? 'Website settings could not be loaded. Please try again.'
      : ''
  )
  const canWrite = computed(
    () =>
      Boolean(storageKitchenId.value) &&
      identity.canWrite.value &&
      outcome.value === 'ready'
  )
  const captureCommand = useCommandScope([...ownerSources, outcome])

  async function update(
    allowed_origins: string[],
    isSurfaceCurrent: () => boolean = () => true
  ) {
    if (!canWrite.value || !isSurfaceCurrent())
      throw new Error('Website settings cannot be edited right now.')
    const ownerCurrent = captureCommand()
    const origins = normalizeAllowedWebsites(allowed_origins, import.meta.dev)
    const kitchenId = storageKitchenId.value
    const user = currentUser.value!
    const token = await user.getIdToken()
    if (
      !ownerCurrent() ||
      !isSurfaceCurrent() ||
      !token ||
      user !== currentUser.value ||
      kitchenId !== storageKitchenId.value ||
      !canWrite.value
    )
      throw new Error(
        'The selected Kitchen or account changed. Please try again.'
      )
    const result = await $fetch<{ ok: true; kitchenId: string }>(
      '/api/workspace/kitchen/website-ordering',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { kitchenId, allowed_origins: origins },
        retry: 0,
      }
    )
    if (result?.ok !== true || result.kitchenId !== kitchenId)
      throw new Error(
        'Website settings response did not match the requested Kitchen.'
      )
    return result
  }

  return {
    captureIntent,
    ownerScope,
    kitchenId: identity.kitchenId,
    storageKitchenId,
    origins: computed(() =>
      outcome.value === 'ready' ? source.data.value!.allowed_origins : []
    ),
    outcome,
    error,
    canWrite,
    update,
  }
}
