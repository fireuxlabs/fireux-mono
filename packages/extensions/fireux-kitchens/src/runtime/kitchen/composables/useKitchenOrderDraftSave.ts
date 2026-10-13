import { computed, ref, watch, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenAccess } from './useKitchenAccess'
import { readOrder } from '../utils/ordering'
import type { Order, SavedOrderDraft } from '../models/order.model'

export function useKitchenOrderDraftSave(
  kitchenId: Ref<string>,
  active: Ref<boolean>
) {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const access = useKitchenAccess()
  const pending = ref(false)
  const error = ref('')
  const scopeVersion = ref(0)
  const sources = [
    kitchenId,
    active,
    () => currentUser.value?.uid,
    () => config.appId,
    () => session.uid.value,
    () => session.pending.value,
    () => session.error.value,
    () => JSON.stringify(session.appUser.value),
    () => JSON.stringify(access.ids.value),
    () => access.outcome.value,
  ]
  const captureIntent = useCommandScope(sources)
  watch(
    sources,
    () => {
      pending.value = false
      error.value = ''
      scopeVersion.value++
    },
    { flush: 'sync' }
  )
  const canSave = computed(
    () =>
      active.value &&
      !session.pending.value &&
      !session.error.value &&
      Boolean(currentUser.value?.uid && session.appUser.value) &&
      session.uid.value === currentUser.value?.uid &&
      access.outcome.value === 'ready' &&
      access.ids.value.includes(kitchenId.value)
  )
  async function save(
    order: Order,
    expectedRevision: number
  ): Promise<SavedOrderDraft | null> {
    if (!canSave.value || pending.value) return null
    const isCurrent = captureIntent()
    const id = kitchenId.value
    const actor = currentUser.value!
    pending.value = true
    error.value = ''
    try {
      const snapshot = readOrder(order)
      const token = await actor.getIdToken()
      if (!isCurrent()) return null
      const response = await $fetch<{
        ok: boolean
        kitchen_id: string
        draft: SavedOrderDraft
      }>('/api/workspace/kitchen/order-drafts/save', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId: id, order: snapshot, expectedRevision },
        retry: 0,
      })
      const saved = readOrder(response.draft?.order)
      if (
        !response.ok ||
        response.kitchen_id !== id ||
        saved.id !== snapshot.id ||
        response.draft.revision !== expectedRevision + 1 ||
        JSON.stringify(saved) !== JSON.stringify(snapshot)
      )
        throw new Error('Draft save returned an invalid response.')
      return isCurrent()
        ? { order: saved, revision: response.draft.revision }
        : null
    } catch (caught: any) {
      if (isCurrent())
        error.value =
          caught?.data?.statusMessage ||
          'Draft could not be saved. Your edits are still here.'
      return null
    } finally {
      if (isCurrent()) pending.value = false
    }
  }
  return { save, pending, error, canSave, captureIntent, scopeVersion }
}
