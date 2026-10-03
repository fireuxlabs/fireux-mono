// Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: keep authenticated provider-test state out of the editable field component.
import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import { useUserSession } from 'fireux-core/runtime/user/composables/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenAccess } from '../../useKitchenAccess'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenServiceWhatsAppTest(options: {
  serviceId: MaybeRefOrGetter<string>
  appId: MaybeRefOrGetter<string | null | undefined>
  kitchenId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()
  const { appUser } = useUserSession()
  const access = useKitchenAccess()
  const error = ref('')
  const pending = ref(false)
  const sent = ref(false)

  const sources = [() => currentUser.value?.uid, () => toValue(options.appId),
    () => toValue(options.kitchenId), () => JSON.stringify(appUser.value),
    () => JSON.stringify(access.ids.value), () => access.outcome.value, () => toValue(options.serviceId)]
  const captureIntent = useCommandScope(sources)
  watch(sources, () => { pending.value = false; error.value = ''; sent.value = false }, { flush: 'sync' })

  async function sendTest() {
    if (pending.value) throw new Error('This action is already pending.')
    const isCurrent = captureIntent()
    const user = currentUser.value

    error.value = ''
    sent.value = false
    pending.value = true
    try {
      const serviceId = text(toValue(options.serviceId))
      const appId = text(toValue(options.appId))
      const kitchenId = text(toValue(options.kitchenId))
      if (!appId || !kitchenId || !serviceId) {
        throw new Error('Select the Kitchen before testing WhatsApp.')
      }

      const token = await user?.getIdToken()
      if (!token) throw new Error('Sign in before testing WhatsApp.')
        if (!isCurrent() || !['ready', 'empty'].includes(access.outcome.value) || !access.ids.value.includes(kitchenId)) throw new Error('The account or Kitchen association changed.')
      if (
        text(toValue(options.serviceId)) !== serviceId ||
        text(toValue(options.appId)) !== appId ||
        text(toValue(options.kitchenId)) !== kitchenId
      ) {
        throw new Error(
          'The selected Kitchen changed before the WhatsApp test.'
        )
      }

      const result = await $fetch<{ ok: boolean; app_id: string; kitchen_id: string; service_id: string; provider_message_id: string }>('/api/workspace/kitchen/ordering/whatsapp-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { appId, kitchenId, serviceId },
      })
      if (result?.ok !== true || result.app_id !== appId || result.kitchen_id !== kitchenId || result.service_id !== serviceId || !text(result.provider_message_id)) throw new Error('WhatsApp response did not match the requested Kitchen and Service.')
      if (isCurrent()) sent.value = true
      return result
    } catch (testError) {
      if (isCurrent()) error.value = testErrorMessage(testError)
      throw testError
    } finally {
      if (isCurrent()) pending.value = false
    }
  }

  return {
    error,
    pending,
    sent,
    captureIntent,
    sendTest,
  }
}

function testErrorMessage(error: unknown) {
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
    ) || 'The WhatsApp test could not be sent.'
  )
}
