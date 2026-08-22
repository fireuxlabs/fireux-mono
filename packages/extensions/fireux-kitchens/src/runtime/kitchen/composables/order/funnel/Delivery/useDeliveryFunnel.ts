// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: consume the shared customer autofill seam after its move.
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  useCustomerDeliveryAddressAutocomplete,
  type CustomerDeliveryAddressPrediction,
} from '../../../../../user/composables/customer/useCustomerDeliveryAddressAutocomplete'
import { useCustomerAutofill } from '../../../../../user/composables/customer/useCustomerAutofill'
import type { MenuDeliveryZone } from '../../../../../menu/utils/menu.ts'
import type {
  MenuOrderingDeliveryState,
  MenuOrderingFunnelState,
} from '../../../../../menu/models/menu-ordering.model.ts'

export type DeliveryAddressCheckResult = {
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

type UseDeliveryOptions = {
  delivery?: MaybeRefOrGetter<MenuOrderingDeliveryState | null | undefined>
  driverWatchingCount?: MaybeRefOrGetter<number | null | undefined>
  orderId?: MaybeRefOrGetter<string | null | undefined>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useDeliveryFunnel(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>,
  options: UseDeliveryOptions = {}
) {
  const address = ref('')
  const autofillApplied = ref(false)
  const selectedAddress = ref<CustomerDeliveryAddressPrediction | null>(null)
  const menuId = computed(() => toValue(order).menuId)
  const kitchenSlug = computed(() => toValue(order).kitchenSlug)
  const { customer: autofillCustomer } = useCustomerAutofill()
  const zones = computed(
    () => toValue(order).policy?.fulfilment?.delivery_zones || []
  )
  const total = computed(() =>
    toValue(order).selection.items.reduce(
      (sum, item) =>
        sum +
        Math.max(0, Number(item.unitPrice || 0)) *
          Math.max(0, Number(item.quantity || 0)),
      0
    )
  )
  const {
    predictions,
    pending: suggestionsPending,
    error: suggestionsError,
  } = useCustomerDeliveryAddressAutocomplete(address)
  const checkPending = ref(false)
  const checkError = ref('')
  const result = ref<DeliveryAddressCheckResult | null>(null)
  const checkEndpoint = computed(() => {
    if (!menuId.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(menuId.value)}/delivery-address${qs ? `?${qs}` : ''}`
  })
  const matchedZone = computed(() => result.value?.zone || null)
  const minimum = computed(() => Number(matchedZone.value?.min_order_chf || 0))
  const fee = computed(() => Number(matchedZone.value?.fee_chf || 0))
  const minimumMet = computed(
    () => !matchedZone.value || total.value >= minimum.value
  )
  const selectedAddressLabel = computed(
    () =>
      text(selectedAddress.value?.description) ||
      text(result.value?.address?.formatted) ||
      text(address.value)
  )
  const hasSelectedAddress = computed(() =>
    Boolean(selectedAddress.value && selectedAddressLabel.value)
  )
  const ready = computed(() => {
    if (toValue(order).orderType !== 'delivery') return true

    return Boolean(
      text(address.value) &&
        result.value?.deliverable &&
        minimumMet.value &&
        !suggestionsPending.value &&
        !checkPending.value
    )
  })
  const status = computed(() => {
    if (toValue(order).orderType !== 'delivery') {
      return 'Delivery zone checks are only needed for delivery orders.'
    }
    if (checkPending.value) return 'Checking delivery zone...'
    if (checkError.value) return checkError.value
    if (!result.value) return 'Choose a delivery address to check the zone.'
    if (!result.value.deliverable) return result.value.reason
    if (!minimumMet.value) {
      return `Minimum order for ${zoneLabel(matchedZone.value)} is ${chf(minimum.value)}.`
    }

    return `${zoneLabel(matchedZone.value)} · minimum order ${chf(minimum.value)} · fee ${chf(fee.value)}`
  })
  const watchingCount = computed(() =>
    Math.max(0, Number(toValue(options.driverWatchingCount)) || 0)
  )
  const resolvedOrderId = computed(() => text(toValue(options.orderId)))
  const kitchen = computed(() => {
    if (toValue(order).orderType !== 'delivery') {
      return {
        title: 'Contacting kitchen',
        status: 'Checking kitchen timing.',
      }
    }

    return {
      title: 'Contacting kitchen',
      status: 'Sending the basket and delivery address.',
    }
  })
  const driverStatus = computed(() => {
    if (toValue(order).orderType !== 'delivery') {
      return 'Driver watching is only needed for delivery orders.'
    }
    if (!toValue(options.delivery)?.ready) {
      return 'Waiting for a checked delivery address.'
    }
    if (!resolvedOrderId.value) return 'Waiting for the order to be created.'
    if (watchingCount.value > 0) {
      return `${watchingCount.value} driver${watchingCount.value === 1 ? '' : 's'} watching.`
    }

    return 'Order created. Waiting for drivers to watch.'
  })

  async function selectAddress(prediction: CustomerDeliveryAddressPrediction) {
    selectedAddress.value = prediction
    address.value = prediction.description
    predictions.value = []
    await check({ place_id: prediction.place_id })
  }

  function clearAddress() {
    selectedAddress.value = null
    address.value = ''
    result.value = null
    predictions.value = []
  }

  watch(address, (value: string) => {
    const input = text(value)
    if (!input) {
      selectedAddress.value = null
      result.value = null
      return
    }

    const selectedText = text(selectedAddress.value?.description)
    const checkedText = text(
      result.value?.address?.formatted || result.value?.address?.input
    )
    if (result.value && input !== selectedText && input !== checkedText) {
      selectedAddress.value = null
      result.value = null
    }
  })

  watch(
    autofillCustomer,
    async (customer: { address: string; address_place_id: string }) => {
      const savedAddress = text(customer.address)
      if (
        autofillApplied.value ||
        toValue(order).orderType !== 'delivery' ||
        !savedAddress ||
        text(address.value)
      ) {
        return
      }

      autofillApplied.value = true
      address.value = savedAddress
      selectedAddress.value = {
        place_id: text(customer.address_place_id),
        description: savedAddress,
      }
      await check(
        customer.address_place_id
          ? { address: savedAddress, place_id: customer.address_place_id }
          : savedAddress
      )
    },
    { immediate: true }
  )

  async function check(input: DeliveryAddressCheckInput) {
    const body =
      typeof input === 'string'
        ? { address: text(input) }
        : {
            ...(text(input.address) ? { address: text(input.address) } : {}),
            ...(text(input.place_id || input.placeId)
              ? { place_id: text(input.place_id || input.placeId) }
              : {}),
            ...(Number.isFinite(input.lat) ? { lat: input.lat } : {}),
            ...(Number.isFinite(input.lng) ? { lng: input.lng } : {}),
          }
    const missingCoordinates = body.lat === undefined || body.lng === undefined
    if (
      !checkEndpoint.value ||
      (!body.address && !body.place_id && missingCoordinates)
    ) {
      result.value = null
      checkError.value = checkEndpoint.value
        ? 'Delivery address is required.'
        : 'Menu path is missing.'
      return null
    }

    checkPending.value = true
    checkError.value = ''

    try {
      const checked = await $fetch<DeliveryAddressCheckResult>(
        checkEndpoint.value,
        {
          method: 'POST',
          body,
        }
      )

      result.value = checked

      return checked
    } catch (err) {
      const statusMessage =
        err && typeof err === 'object' && 'statusMessage' in err
          ? text((err as { statusMessage?: unknown }).statusMessage)
          : ''
      checkError.value =
        statusMessage || 'Delivery address could not be checked.'
      result.value = null

      return null
    } finally {
      checkPending.value = false
    }
  }

  return {
    address,
    checkPending,
    clearAddress,
    driverStatus,
    fee,
    hasSelectedAddress,
    kitchen,
    minimum,
    minimumMet,
    predictions,
    ready,
    result,
    selectedAddress,
    selectedAddressLabel,
    selectAddress,
    status,
    suggestionsError,
    suggestionsPending,
    total,
    watchingCount,
    zones,
  }
}

function zoneLabel(zone: MenuDeliveryZone | null) {
  return zone?.label || zone?.id || 'Delivery zone'
}

function chf(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(Math.max(0, value))
}
