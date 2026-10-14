import { ref, watch, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readOrderSubmission } from '../utils/order-submission'

/** Authenticated transport; each consumer owns its order and polling lifetime. */
export function useOrderExchange(kitchenId: Ref<string>, ownerScope?: Ref<string>) {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const sources = [kitchenId, () => currentUser.value?.uid, () => config.appId, () => ownerScope?.value]
  const captureIntent = useCommandScope(sources)
  const pending = ref(false)
  const error = ref('')
  const version = ref(0)
  watch(sources, () => { pending.value = false; error.value = ''; version.value++ }, { flush: 'sync' })
  async function request(path: string, payload: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
    if (!kitchenId.value || !currentUser.value || pending.value) return null
    const isCurrent = captureIntent()
    const actor = currentUser.value
    const body: Record<string, unknown> = structuredClone({ ...payload, kitchenId: kitchenId.value })
    pending.value = true
    error.value = ''
    try {
      let credentialTimer: ReturnType<typeof setTimeout> | undefined
      const token = await Promise.race([
        actor.getIdToken(),
        new Promise<never>((_, reject) => {
          credentialTimer = setTimeout(() => reject(new Error('Your ordering session is taking too long. Please try again.')), 15000)
        }),
      ]).finally(() => { if (credentialTimer) clearTimeout(credentialTimer) })
      if (!isCurrent()) return null
      const response = await $fetch<{ ok: boolean; kitchen_id: string; submission?: unknown; submissions?: unknown[] }>(path, { method, headers: { Authorization: `Bearer ${token}` }, ...(method === 'GET' ? { query: body } : { body }), retry: 0, timeout: 15000 })
      if (!response.ok || response.kitchen_id !== body.kitchenId) throw new Error('Order response is invalid.')
      const result = response.submissions ? response.submissions.map(readOrderSubmission) : readOrderSubmission(response.submission)
      if (!Array.isArray(result)) {
        const expected = typeof body.orderId === 'string' ? body.orderId : (body.order as { id?: string } | undefined)?.id
        if (expected && result.order.id !== expected) throw new Error('Order response belongs to another order.')
      }
      return isCurrent() ? result : null
    } catch (caught: any) {
      if (isCurrent()) error.value = caught?.data?.statusMessage || caught?.message || 'The order could not be updated.'
      return null
    } finally { if (isCurrent()) pending.value = false }
  }
  return { request, pending, error, version }
}
