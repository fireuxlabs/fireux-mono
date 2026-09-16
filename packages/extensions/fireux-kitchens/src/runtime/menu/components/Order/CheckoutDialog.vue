<template>
  <div class="menu-order-checkout__host" data-menu-order-checkout="shared">
    <UModal
      v-model:open="openModel"
      description="Check the allergy information and payment, then place your order."
      :portal="false"
      title="Complete your order"
      :ui="modalUi"
    >
      <template #body>
        <form
          id="menu-order-checkout-form"
          class="menu-order-checkout"
          @submit.prevent="submit"
        >
          <div class="menu-order-checkout__summary">
            <span><UIcon name="i-lucide-clock-3" /> {{ selectionLabel }}</span>
            <strong>{{ totalLabel }}</strong>
          </div>

          <UAlert
            v-if="handoffInstructions"
            color="neutral"
            variant="soft"
            icon="i-lucide-map-pin"
            :title="handoffTitle || `${orderTypeLabel} details`"
            :description="handoffInstructions"
          />

          <MenuOrderAllergyAcknowledgement
            v-model="allergyAcknowledged"
            :disabled="pending"
            :invalid="validationError === allergyValidationMessage"
          />

          <CheckoutContactFields
            v-if="showContactFields"
            v-model:name="name"
            v-model:phone="phone"
            v-model:email="email"
            :pending="pending"
            :required-fields="requiredContactFields"
          />

          <UFormField label="2. Payment" required :ui="paymentFieldUi">
            <URadioGroup
              v-model="paymentMethod"
              :disabled="pending"
              :items="paymentOptions"
              label-key="label"
              :ui="paymentRadioUi"
              value-key="value"
            />
          </UFormField>

          <UAlert
            v-if="!paymentOptions.length"
            color="warning"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="Payment is not configured"
            description="The Kitchen needs to enable a pay-now or pay-later method before this order can be sent."
          />

          <div
            v-if="validationError || error"
            class="menu-order-checkout__error"
            role="alert"
          >
            <MoleculesCopyError :message="validationError || error || ''" />
          </div>
        </form>
      </template>

      <template #footer>
        <button
          type="submit"
          form="menu-order-checkout-form"
          class="menu-order-checkout__submit"
          data-menu-action="send-order"
          :disabled="pending || !paymentOptions.length"
        >
          <UIcon
            v-if="pending"
            name="i-lucide-loader-circle"
            class="animate-spin"
          />
          <span>{{ pending ? 'Placing order…' : 'Place order' }}</span>
          <UIcon v-if="!pending" name="i-lucide-arrow-right" />
        </button>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CheckoutContactFields from './CheckoutContactFields.vue'
import { useMenuCheckout } from '../../composables/order/useMenuCheckout'
import type { KitchenOrderContactField } from '../../../kitchen/models/ordering.model'
import type { KitchenFulfilmentPaymentMethod } from '../../../kitchen/models/fulfilment.model'
import type { KitchenOrderType } from '../../../kitchen/utils/order.ts'
import type { MenuOrderCheckoutInput } from '../../utils/menu-order-payment'

const props = withDefaults(
  defineProps<{
    error?: string
    handoffInstructions?: string
    handoffTitle?: string
    open: boolean
    orderType: KitchenOrderType
    paymentMethods: KitchenFulfilmentPaymentMethod[]
    pending?: boolean
    requiredContactFields?: KitchenOrderContactField[]
    showContactFields?: boolean
    selectionLabel: string
    totalLabel: string
  }>(),
  {
    showContactFields: true,
  }
)
const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
  (event: 'submit', input: MenuOrderCheckoutInput): void
}>()
const modalUi = {
  overlay: 'menu-order-checkout__overlay',
  content: 'menu-order-checkout__content',
  header: 'menu-order-checkout__header',
  title: 'menu-order-checkout__title',
  description: 'menu-order-checkout__description',
  close: 'menu-order-checkout__close',
  body: 'menu-order-checkout__body',
  footer: 'menu-order-checkout__footer',
}
const paymentFieldUi = { label: 'menu-order-checkout__field-label' }
const paymentRadioUi = {
  label: 'menu-order-checkout__payment-label',
  description: 'menu-order-checkout__payment-description',
}
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const orderTypeLabel = computed(() =>
  props.orderType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
)
const {
  name,
  phone,
  email,
  paymentMethod,
  paymentOptions,
  allergyAcknowledged,
  validationError,
  allergyValidationMessage,
  submit,
} = useMenuCheckout(props, (input) => emit('submit', input))
</script>

<style scoped src="./checkout-dialog.css" />
