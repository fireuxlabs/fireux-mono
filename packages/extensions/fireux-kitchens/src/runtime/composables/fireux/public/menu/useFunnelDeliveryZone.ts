import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { useMenuCustomerAutofill } from './useMenuCustomerAutofill'
import { useMenuDeliveryAddressAutocomplete } from './useMenuDeliveryAddressAutocomplete'
import { useMenuDeliveryAddressCheck } from './useMenuDeliveryAddressCheck'
import type {
  MenuDeliveryAddressPrediction,
} from './useMenuDeliveryAddressAutocomplete'
import type { MenuDeliveryZone } from '../../../../models/menu/menu.model'
import type { MenuOrderingFunnelState } from '../../../../models/menu/menu-ordering.model'

const text = (value: unknown) => String(value ?? '').trim()

export function useFunnelDeliveryZone(
  order: MaybeRefOrGetter<MenuOrderingFunnelState>
) {
  const address = ref('')
  const autofillApplied = ref(false)
  const selectedAddress = ref<MenuDeliveryAddressPrediction | null>(null)
  const menuId = computed(() => toValue(order).menuId)
  const kitchenSlug = computed(() => toValue(order).kitchenSlug)
  const { customer: autofillCustomer } = useMenuCustomerAutofill()
  const zones = computed(() =>
    toValue(order).policy?.fulfilment?.delivery_zones || []
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
  } = useMenuDeliveryAddressAutocomplete(address)
  const {
    pending: checkPending,
    error: checkError,
    result,
    check,
  } = useMenuDeliveryAddressCheck(menuId, { kitchenSlug })
  const matchedZone = computed(() => result.value?.zone || null)
  const minimum = computed(() => Number(matchedZone.value?.min_order_chf || 0))
  const fee = computed(() => Number(matchedZone.value?.fee_chf || 0))
  const minimumMet = computed(() =>
    !matchedZone.value || total.value >= minimum.value
  )
  const selectedAddressLabel = computed(() =>
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

  async function selectAddress(prediction: MenuDeliveryAddressPrediction) {
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

  watch(address, (value) => {
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
    async (customer) => {
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

  return {
    address,
    checkPending,
    clearAddress,
    fee,
    hasSelectedAddress,
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
