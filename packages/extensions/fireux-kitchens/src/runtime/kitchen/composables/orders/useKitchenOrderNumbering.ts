import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenAccess } from '../useKitchenAccess'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderNumbering(options: {
  appId: MaybeRefOrGetter<string | null | undefined>
  kitchenId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()
  const { appUser } = useUserSession()
  const access = useKitchenAccess()
  const error = ref('')
  const pending = ref(false)

  const sources = [() => currentUser.value?.uid, () => toValue(options.appId),
    () => toValue(options.kitchenId), () => JSON.stringify(appUser.value),
    () => JSON.stringify(access.ids.value), () => access.outcome.value]
  const captureIntent = useCommandScope(sources)
  watch(sources, () => { pending.value = false; error.value = '';  }, { flush: 'sync' })

  async function resetNumbering() {
    if (pending.value) throw new Error('This action is already pending.')
    const isCurrent = captureIntent()
    const user = currentUser.value

    error.value = ''
    pending.value = true
    try {
      const appId = text(toValue(options.appId))
      const kitchenId = text(toValue(options.kitchenId))
      const token = await user?.getIdToken()
      if (!appId) throw new Error('App id is required.')
      if (!kitchenId) throw new Error('Kitchen id is required.')
      if (!token) throw new Error('Sign in before resetting order numbering.')
        if (!isCurrent() || !['ready', 'empty'].includes(access.outcome.value) || !access.ids.value.includes(kitchenId)) throw new Error('The account or Kitchen association changed.')
      if (
        text(toValue(options.appId)) !== appId ||
        text(toValue(options.kitchenId)) !== kitchenId
      ) {
        throw new Error(
          'The selected Kitchen changed before order numbering could reset.'
        )
      }

      const result = await $fetch<{ ok: boolean; app_id: string; kitchen_id: string; numbering: { service_id: string; previous_service_id: string; previous_order_count: number } }>('/api/workspace/kitchen/orders/reset-numbering', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          app_id: appId,
          kitchen_id: kitchenId,
        },
      })
      if (result?.ok !== true || result.app_id !== appId || result.kitchen_id !== kitchenId || !text(result.numbering?.service_id) || typeof result.numbering?.previous_service_id !== 'string' || !Number.isSafeInteger(result.numbering?.previous_order_count) || result.numbering.previous_order_count < 0) throw new Error('Order numbering response did not match the requested Kitchen.')
      return result
    } catch (numberingError) {
      if (isCurrent()) error.value = errorMessage(numberingError)
      throw numberingError
    } finally {
      if (isCurrent()) pending.value = false
    }
  }

  return {
    captureIntent,
    resetNumbering,
    error,
    pending,
  }
}

function errorMessage(error: unknown) {
  const source =
    error && typeof error === 'object'
      ? (error as {
          data?: { statusMessage?: unknown }
          message?: unknown
          statusMessage?: unknown
        })
      : {}

  return (
    text(
      source.data?.statusMessage || source.statusMessage || source.message
    ) || 'Order numbering could not be reset.'
  )
}
