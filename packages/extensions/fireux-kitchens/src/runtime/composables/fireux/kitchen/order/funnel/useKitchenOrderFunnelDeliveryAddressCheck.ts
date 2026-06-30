import {
  computed,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { MenuDeliveryZone } from '../../../../../models/menu/menu.model'

export type MenuDeliveryAddressCheckResult = {
  deliverable: boolean
  reason: string
  address?: {
    input: string
    formatted: string
    postal_code: string
    place_id: string
    lat: number
    lng: number
  }
  zone?: MenuDeliveryZone
  debug?: Record<string, unknown>
}

type DeliveryAddressCheckInput =
  | string
  | {
      address?: string
      place_id?: string
      placeId?: string
      lat?: number
      lng?: number
    }

type UseKitchenOrderFunnelDeliveryAddressCheckOptions = {
  kitchenSlug?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenOrderFunnelDeliveryAddressCheck(
  menuId: MaybeRefOrGetter<string>,
  options: UseKitchenOrderFunnelDeliveryAddressCheckOptions = {}
) {
  const id = computed(() => text(toValue(menuId)))
  const kitchenSlug = computed(() => text(toValue(options.kitchenSlug)))
  const pending = ref(false)
  const error = ref('')
  const result = ref<MenuDeliveryAddressCheckResult | null>(null)
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}/delivery-address${qs ? `?${qs}` : ''}`
  })

  const check = async (input: DeliveryAddressCheckInput) => {
    const body = typeof input === 'string'
      ? { address: text(input) }
      : {
          ...(text(input.address) ? { address: text(input.address) } : {}),
          ...(text(input.place_id || input.placeId)
            ? { place_id: text(input.place_id || input.placeId) }
            : {}),
          ...(Number.isFinite(input.lat) ? { lat: input.lat } : {}),
          ...(Number.isFinite(input.lng) ? { lng: input.lng } : {}),
        }
    if (!endpoint.value || (!body.address && !body.place_id && (body.lat === undefined || body.lng === undefined))) {
      result.value = null
      error.value = endpoint.value
        ? 'Delivery address is required.'
        : 'Menu path is missing.'
      return null
    }

    pending.value = true
    error.value = ''

    try {
      const checked = await $fetch<MenuDeliveryAddressCheckResult>(endpoint.value, {
        method: 'POST',
        body,
      })

      result.value = checked

      return checked
    } catch (err) {
      const statusMessage = err && typeof err === 'object' && 'statusMessage' in err
        ? text((err as { statusMessage?: unknown }).statusMessage)
        : ''
      error.value = statusMessage || 'Delivery address could not be checked.'
      result.value = null

      return null
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    error,
    result,
    check,
  }
}
