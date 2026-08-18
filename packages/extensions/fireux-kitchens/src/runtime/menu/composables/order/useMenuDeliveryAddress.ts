// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: use the shared customer autofill seam.
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { formatCurrencyAmount } from '../../../utils/currency-display'
import {
  useCustomerDeliveryAddressAutocomplete,
  type CustomerDeliveryAddressPrediction,
} from '../../../user/composables/customer/useCustomerDeliveryAddressAutocomplete'
import { useCustomerAutofill } from '../../../user/composables/customer/useCustomerAutofill'
import type { MenuDeliveryZone } from '../../models/menu.model.ts'

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

type UseMenuDeliveryAddressOptions = {
  currencyCode: MaybeRefOrGetter<string>
  kitchenSlug?: MaybeRefOrGetter<string>
  menuId: MaybeRefOrGetter<string>
  subtotal: MaybeRefOrGetter<number>
}

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuDeliveryAddress(options: UseMenuDeliveryAddressOptions) {
  const address = ref('')
  const selectedAddress = ref<CustomerDeliveryAddressPrediction | null>(null)
  const result = ref<MenuDeliveryAddressCheckResult | null>(null)
  const checkPending = ref(false)
  const checkError = ref('')
  const autofillApplied = ref(false)
  const { customer } = useCustomerAutofill()
  const {
    predictions,
    pending: suggestionsPending,
    error: suggestionsError,
  } = useCustomerDeliveryAddressAutocomplete(address)
  const endpoint = computed(() => {
    const menuId = text(toValue(options.menuId))
    if (!menuId) return ''
    const query = new URLSearchParams()
    const kitchenSlug = text(toValue(options.kitchenSlug))
    if (kitchenSlug) query.set('kitchenSlug', kitchenSlug)
    const suffix = query.toString()

    return `/api/menus/${encodeURIComponent(menuId)}/delivery-address${suffix ? `?${suffix}` : ''}`
  })
  const subtotal = computed(() =>
    Math.max(0, Number(toValue(options.subtotal)) || 0)
  )
  const minimum = computed(() =>
    Math.max(0, Number(result.value?.zone?.min_order_chf) || 0)
  )
  const fee = computed(() =>
    Math.max(0, Number(result.value?.zone?.fee_chf) || 0)
  )
  const total = computed(() => subtotal.value + fee.value)
  const minimumMet = computed(
    () => !result.value?.zone || subtotal.value >= minimum.value
  )
  const label = computed(
    () =>
      text(result.value?.address?.formatted) ||
      text(selectedAddress.value?.description) ||
      text(address.value)
  )
  const placeId = computed(
    () =>
      text(result.value?.address?.place_id) ||
      text(selectedAddress.value?.place_id)
  )
  const zoneLabel = computed(
    () => text(result.value?.zone?.label) || text(result.value?.zone?.id)
  )
  const ready = computed(() =>
    Boolean(
      label.value &&
        result.value?.deliverable &&
        minimumMet.value &&
        !checkPending.value
    )
  )
  const status = computed(() => {
    if (checkPending.value) return 'Checking delivery area…'
    if (checkError.value) return checkError.value
    if (!result.value) return 'Choose an address to check delivery.'
    if (!result.value.deliverable) return result.value.reason
    if (!minimumMet.value) {
      return `Minimum order is ${money(minimum.value)} for ${zoneLabel.value || 'this area'}.`
    }

    return [
      zoneLabel.value,
      fee.value ? `${money(fee.value)} delivery` : 'Free delivery',
    ]
      .filter(Boolean)
      .join(' · ')
  })
  const totalLabel = computed(() => money(total.value))

  async function selectAddress(prediction: CustomerDeliveryAddressPrediction) {
    selectedAddress.value = prediction
    address.value = prediction.description
    predictions.value = []
    await check({ place_id: prediction.place_id })
  }

  async function check(
    input: string | { address?: string; place_id?: string }
  ) {
    const body =
      typeof input === 'string'
        ? { address: text(input) }
        : {
            ...(text(input.address) ? { address: text(input.address) } : {}),
            ...(text(input.place_id) ? { place_id: text(input.place_id) } : {}),
          }
    if (!endpoint.value || (!body.address && !body.place_id)) {
      result.value = null
      checkError.value = endpoint.value
        ? 'Delivery address is required.'
        : 'Menu path is missing.'
      return null
    }

    checkPending.value = true
    checkError.value = ''
    try {
      const checked = await $fetch<MenuDeliveryAddressCheckResult>(
        endpoint.value,
        {
          method: 'POST',
          body,
        }
      )
      result.value = checked
      return checked
    } catch (caught) {
      const source = caught as {
        data?: { statusMessage?: unknown }
        statusMessage?: unknown
      } | null
      checkError.value =
        text(source?.data?.statusMessage) ||
        text(source?.statusMessage) ||
        'Delivery address could not be checked.'
      result.value = null
      return null
    } finally {
      checkPending.value = false
    }
  }

  function clear() {
    address.value = ''
    selectedAddress.value = null
    result.value = null
    predictions.value = []
    checkError.value = ''
  }

  function money(value: number) {
    return formatCurrencyAmount(value, {
      currencyCode: text(toValue(options.currencyCode)) || 'CHF',
      format: 'code',
    })
  }

  watch(address, (value: string) => {
    const input = text(value)
    if (!input) {
      selectedAddress.value = null
      result.value = null
      return
    }
    const selected = text(selectedAddress.value?.description)
    const checked = text(
      result.value?.address?.formatted || result.value?.address?.input
    )
    if (result.value && input !== selected && input !== checked) {
      selectedAddress.value = null
      result.value = null
    }
  })

  watch(
    customer,
    async (value: { address: string; address_place_id: string }) => {
      const savedAddress = text(value.address)
      if (autofillApplied.value || !savedAddress || text(address.value)) return
      autofillApplied.value = true
      address.value = savedAddress
      selectedAddress.value = {
        place_id: text(value.address_place_id),
        description: savedAddress,
      }
      await check(
        value.address_place_id
          ? { address: savedAddress, place_id: value.address_place_id }
          : savedAddress
      )
    },
    { immediate: true }
  )

  return {
    address,
    check,
    checkError,
    checkPending,
    clear,
    fee,
    label,
    minimum,
    minimumMet,
    placeId,
    predictions,
    ready,
    result,
    selectAddress,
    status,
    suggestionsError,
    suggestionsPending,
    total,
    totalLabel,
    zoneLabel,
  }
}
