import { computed, ref, watch } from 'vue'
import type { KitchenOrderContactField } from '../../../kitchen/models/ordering.model'
import type { KitchenFulfilmentPaymentMethod } from '../../../kitchen/models/fulfilment.model'
import type { KitchenOrderType } from '../../../kitchen/utils/order'
import { type MenuOrderCheckoutInput } from '../../utils/menu-order-payment'

type MenuCheckoutOptions = {
  open: boolean
  orderType: KitchenOrderType
  paymentMethods: KitchenFulfilmentPaymentMethod[]
  requiredContactFields?: KitchenOrderContactField[]
}

export function useMenuCheckout(
  props: MenuCheckoutOptions,
  onSubmit: (input: MenuOrderCheckoutInput) => void
) {
  const name = ref('')
  const phone = ref('')
  const email = ref('')
  const allergyAcknowledged = ref(false)
  const validationError = ref('')
  const allergyValidationMessage =
    'Confirm the allergy check before sending the order.'
  const requiredContactFields = computed(
    () => new Set(props.requiredContactFields || [])
  )
  const nameRequired = computed(() => requiredContactFields.value.has('name'))
  const phoneRequired = computed(() => requiredContactFields.value.has('phone'))
  const emailRequired = computed(() => requiredContactFields.value.has('email'))

  watch(
    () => props.open,
    (open: boolean, wasOpen: boolean | undefined) => {
      if (open && !wasOpen) allergyAcknowledged.value = false
    }
  )

  watch(allergyAcknowledged, (acknowledged: boolean) => {
    if (acknowledged && validationError.value === allergyValidationMessage) {
      validationError.value = ''
    }
  })

  function submit() {
    validationError.value = ''
    const customerName = name.value.trim()
    const customerPhone = phone.value.trim()
    const customerEmail = email.value.trim()
    const missing = [
      nameRequired.value && !customerName ? 'name' : '',
      phoneRequired.value && !customerPhone ? 'mobile number' : '',
      emailRequired.value && !customerEmail ? 'email address' : '',
    ].filter(Boolean)
    if (missing.length) {
      validationError.value = `Add your ${missing.join(', ')} before sending the order.`
      return
    }
    if (!allergyAcknowledged.value) {
      validationError.value = allergyValidationMessage
      return
    }
    onSubmit({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    })
  }

  return {
    name,
    phone,
    email,
    allergyAcknowledged,
    validationError,
    allergyValidationMessage,
    submit,
  }
}
