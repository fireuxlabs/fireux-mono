import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenSellable } from '../../../models/sellable.model'

type SellableRecord = KitchenSellable & { id: string }
export function useKitchenSellableTerms(input: {
  kitchenId: MaybeRefOrGetter<string>
  sellableId: MaybeRefOrGetter<string>
  canWrite: MaybeRefOrGetter<boolean>
}) {
  const { currentUser } = useAuth()
  const scope = computed(() =>
    JSON.stringify([
      currentUser.value?.uid || '',
      toValue(input.kitchenId),
      toValue(input.sellableId),
    ])
  )
  const enabled = computed(() =>
    Boolean(
      currentUser.value && toValue(input.kitchenId) && toValue(input.sellableId)
    )
  )
  const source = useLiveAsyncData<{
    scope: string
    record: SellableRecord
  } | null>(
    computed(() => `kitchen-sellable-${scope.value}`),
    async (liveFetch) => {
      if (!enabled.value) return null
      const requestScope = scope.value
      const kitchenId = toValue(input.kitchenId),
        sellableId = toValue(input.sellableId)
      const user = currentUser.value!
      const token = await user.getIdToken()
      if (scope.value !== requestScope) return null
      const record = await liveFetch<SellableRecord>(
        '/api/workspace/kitchen/sellables',
        {
          query: { kitchenId, sellableId },
          headers: { authorization: `Bearer ${token}` },
        }
      )
      return { scope: requestScope, record }
    },
    { server: false, watch: [scope] }
  )
  const outcome = computed(() => {
    if (!enabled.value) return 'idle'
    if (source.status.value === 'error') return 'error'
    if (
      source.status.value !== 'success' ||
      source.data.value?.scope !== scope.value
    )
      return 'pending'
    return 'ready'
  })
  const record = computed(() =>
    outcome.value === 'ready' ? (source.data.value?.record ?? null) : null
  )
  const busy = ref(false)
  const saveError = ref('')
  let operation = 0
  watch(
    scope,
    () => {
      operation++
      busy.value = false
      saveError.value = ''
    },
    { flush: 'sync' }
  )
  const canEdit = computed(
    () =>
      toValue(input.canWrite) &&
      record.value?.status === 'active' &&
      !busy.value
  )
  async function update(terms: KitchenSellable['terms']) {
    if (!canEdit.value || !record.value)
      throw new Error('Shared prices cannot be edited right now.')
    const savedScope = scope.value,
      revision = record.value.revision
    const kitchenId = toValue(input.kitchenId),
      sellableId = toValue(input.sellableId)
    const user = currentUser.value!
    const body = {
      kitchenId,
      sellableId,
      expectedRevision: revision,
      terms: JSON.parse(JSON.stringify(terms)),
    }
    const request = ++operation
    busy.value = true
    saveError.value = ''
    try {
      const token = await user.getIdToken()
      if (
        scope.value !== savedScope ||
        !toValue(input.canWrite) ||
        record.value?.revision !== revision
      )
        throw new Error(
          'The selection or shared prices changed. Review the current values before saving.'
        )
      await $fetch('/api/workspace/kitchen/sellables/terms', {
        method: 'PATCH',
        headers: { authorization: `Bearer ${token}` },
        body,
      })
      if (scope.value === savedScope) await source.refresh()
    } catch (error) {
      const code = Number(
        (error as { statusCode?: number; status?: number })?.statusCode ||
          (error as { status?: number })?.status
      )
      const message =
        code === 409
          ? 'Shared prices changed elsewhere. Review the latest values and try again.'
          : 'Shared prices could not be saved. Review the current values and try again.'
      if (request === operation) {
        saveError.value = message
        if (code === 409) await source.refresh()
      }
      throw new Error(message)
    } finally {
      if (request === operation) busy.value = false
    }
  }
  return { record, outcome, busy, canEdit, saveError, update }
}
