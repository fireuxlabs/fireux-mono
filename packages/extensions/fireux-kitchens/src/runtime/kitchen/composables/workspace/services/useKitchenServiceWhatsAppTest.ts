// Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: keep authenticated provider-test state out of the editable field component.
import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenServiceWhatsAppTest(options: {
  serviceId: MaybeRefOrGetter<string>
  appId: MaybeRefOrGetter<string | null | undefined>
  kitchenId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const error = ref('')
  const pending = ref(false)
  const sent = ref(false)

  async function sendTest() {
    requireWritableData()
    if (pending.value) return

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

      const token = await currentUser.value?.getIdToken()
      if (!token) throw new Error('Sign in before testing WhatsApp.')
      requireWritableData()
      if (
        text(toValue(options.serviceId)) !== serviceId ||
        text(toValue(options.appId)) !== appId ||
        text(toValue(options.kitchenId)) !== kitchenId
      ) {
        throw new Error(
          'The selected Kitchen changed before the WhatsApp test.'
        )
      }

      await $fetch('/api/workspace/kitchen/ordering/whatsapp-test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { appId, kitchenId, serviceId },
      })
      sent.value = true
    } catch (testError) {
      error.value = testErrorMessage(testError)
      throw testError
    } finally {
      pending.value = false
    }
  }

  return {
    error,
    pending,
    sent,
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
