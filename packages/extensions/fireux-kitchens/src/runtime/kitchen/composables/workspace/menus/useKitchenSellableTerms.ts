import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenWorkspaceSelection } from '../useKitchenWorkspaceSelection'
import { readSellableTerms } from '../../../utils/sellable'
import type { KitchenSellable } from '../../../models/sellable.model'

type SellableRecord = KitchenSellable & { id: string }

export function useKitchenSellableTerms(input: {
  kitchenId: MaybeRefOrGetter<string>
  sellableId: MaybeRefOrGetter<string>
  canWrite: MaybeRefOrGetter<boolean>
}) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const { appUser, appPending, appError, appOutcome } = useUserSession()
  const access = useKitchenAccess()
  const { selectedId } = useKitchenWorkspaceSelection()
  const disposed = ref(false)
  const readSources = [
    () => currentUser.value?.uid,
    () => config.appId,
    () => JSON.stringify(appUser.value),
    appPending,
    appError,
    appOutcome,
    () => JSON.stringify(access.ids.value),
    access.outcome,
    selectedId,
    () => toValue(input.kitchenId),
    () => toValue(input.sellableId),
  ]
  const contextSources = [...readSources, () => toValue(input.canWrite)]
  const captureRead = useCommandScope(readSources)
  const captureWrite = useCommandScope(contextSources)
  const scope = computed(() => JSON.stringify(readSources.map(toValue)))
  const enabled = computed(
    () =>
      !disposed.value &&
      Boolean(
        currentUser.value && !currentUser.value.isAnonymous && appUser.value
      ) &&
      !appPending.value &&
      !appError.value &&
      appOutcome.value === 'ready' &&
      access.outcome.value === 'ready' &&
      access.ids.value.includes(toValue(input.kitchenId)) &&
      selectedId.value === toValue(input.kitchenId) &&
      isFirestoreDocumentId(toValue(input.sellableId))
  )
  const requestScope = ref('')
  watch(
    readSources,
    () => {
      requestScope.value = ''
    },
    { flush: 'sync' }
  )
  const source = useLiveAsyncData<{
    scope: string
    record: SellableRecord
  } | null>(
    computed(() => `kitchen-sellable-${scope.value}`),
    async (liveFetch) => {
      if (!enabled.value) return null
      const isCurrent = captureRead()
      const savedScope = scope.value
      requestScope.value = savedScope
      const kitchenId = toValue(input.kitchenId)
      const sellableId = toValue(input.sellableId)
      const user = currentUser.value!
      try {
        const token = await user.getIdToken()
        if (!isCurrent() || !enabled.value) return null
        const record = await liveFetch<SellableRecord>(
          '/api/workspace/kitchen/sellables',
          {
            query: { kitchenId, sellableId },
            headers: { authorization: `Bearer ${token}` },
          }
        )
        return isCurrent() && enabled.value
          ? { scope: savedScope, record }
          : null
      } catch (error) {
        if (!isCurrent() || !enabled.value) return null
        throw error
      }
    },
    { server: false, watch: [scope] }
  )
  const outcome = computed(() => {
    if (
      disposed.value ||
      !currentUser.value ||
      currentUser.value.isAnonymous ||
      !toValue(input.kitchenId) ||
      !isFirestoreDocumentId(toValue(input.sellableId))
    )
      return 'idle'
    if (appError.value) return 'error'
    if (appPending.value || appOutcome.value === 'pending') return 'pending'
    if (appOutcome.value === 'ready' && appUser.value) {
      if (access.outcome.value === 'error') return 'error'
      if (access.outcome.value === 'pending') return 'pending'
    }
    return resolveReadOutcome({
      active: enabled.value,
      kind: 'document',
      current:
        source.status.value === 'error'
          ? requestScope.value === scope.value
          : source.data.value?.scope === scope.value,
      pending: source.status.value !== 'success',
      error: source.error.value,
      present: Boolean(source.data.value?.record),
    })
  })
  const record = computed(() =>
    outcome.value === 'ready' ? (source.data.value?.record ?? null) : null
  )
  const busy = ref(false)
  const saveError = ref('')
  let operation = 0
  const reset = () => {
    operation++
    busy.value = false
    saveError.value = ''
  }
  watch(contextSources, reset, { flush: 'sync' })
  onScopeDispose(() => {
    disposed.value = true
    reset()
  })
  const captureIntent = () => {
    const isCurrent = captureWrite()
    return () => isCurrent() && enabled.value && toValue(input.canWrite)
  }
  const canEdit = computed(
    () =>
      enabled.value &&
      toValue(input.canWrite) &&
      record.value?.status === 'active' &&
      !busy.value
  )

  async function update(
    terms: KitchenSellable['terms'],
    isSurfaceCurrent: () => boolean = () => true
  ) {
    if (!canEdit.value || !record.value || !isSurfaceCurrent())
      throw new Error('Shared prices cannot be edited right now.')
    const ownerCurrent = captureIntent()
    const isCurrent = () => ownerCurrent() && isSurfaceCurrent()
    const revision = record.value.revision
    const kitchenId = toValue(input.kitchenId)
    const sellableId = toValue(input.sellableId)
    const user = currentUser.value!
    const body = {
      kitchenId,
      sellableId,
      expectedRevision: revision,
      terms: readSellableTerms(
        terms,
        record.value.variants.map((variant) => variant.id)
      ),
    }
    const request = ++operation
    busy.value = true
    saveError.value = ''
    try {
      const token = await user.getIdToken()
      if (
        !isCurrent() ||
        request !== operation ||
        record.value?.revision !== revision
      )
        throw new Error(
          'The selection or shared prices changed. Review the current values before saving.'
        )
      const result = await $fetch<{
        ok: true
        kitchenId: string
        sellableId: string
        revision: number
      }>('/api/workspace/kitchen/sellables/terms', {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body,
      })
      if (
        result?.ok !== true ||
        result.kitchenId !== kitchenId ||
        result.sellableId !== sellableId ||
        result.revision !== revision + 1
      )
        throw new Error(
          'Shared prices response did not match the requested Kitchen and Sellable.'
        )
      // Live invalidation observes the committed revision; obsolete UI intent does not undo success.
      return result
    } catch (error) {
      const code = Number(
        (error as { statusCode?: number; status?: number })?.statusCode ??
          (error as { status?: number })?.status
      )
      const message =
        code === 409
          ? 'Shared prices changed elsewhere. Review the latest values and try again.'
          : 'Shared prices could not be saved. Review the current values and try again.'
      if (isCurrent() && request === operation) saveError.value = message
      throw new Error(message)
    } finally {
      if (request === operation) busy.value = false
    }
  }

  return {
    scope,
    record,
    outcome,
    busy,
    canEdit,
    saveError,
    update,
    captureIntent,
  }
}
