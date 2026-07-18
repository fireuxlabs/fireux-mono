import {
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderService(options: {
  appId: MaybeRefOrGetter<string | null | undefined>
  kitchenId: MaybeRefOrGetter<string | null | undefined>
}) {
  const { currentUser } = useAuth()
  const error = ref('')
  const pending = ref(false)

  async function endService() {
    if (pending.value) return

    error.value = ''
    pending.value = true
    try {
      const appId = text(toValue(options.appId))
      const kitchenId = text(toValue(options.kitchenId))
      const token = await currentUser.value?.getIdToken()
      if (!appId) throw new Error('App id is required.')
      if (!kitchenId) throw new Error('Kitchen id is required.')
      if (!token) throw new Error('Sign in before ending kitchen service.')

      return await $fetch('/api/console/kitchen/orders/end-service', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          app_id: appId,
          kitchen_id: kitchenId,
        },
      })
    } catch (serviceError) {
      error.value = errorMessage(serviceError)
      throw serviceError
    } finally {
      pending.value = false
    }
  }

  return {
    endService,
    error,
    pending,
  }
}

function errorMessage(error: unknown) {
  const source = error && typeof error === 'object'
    ? error as {
        data?: { statusMessage?: unknown }
        message?: unknown
        statusMessage?: unknown
      }
    : {}

  return text(
    source.data?.statusMessage || source.statusMessage || source.message
  ) || 'Kitchen service could not be ended.'
}
