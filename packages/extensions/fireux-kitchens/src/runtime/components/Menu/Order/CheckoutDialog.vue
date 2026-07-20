<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: allow counter ordering to omit unused customer fields. -->
<template>
  <div
    class="menu-order-checkout__host"
    data-menu-order-checkout="shared"
  >
    <UModal
      v-model:open="openModel"
      description="Confirm the details before sending the order."
      :portal="false"
      title="Send order"
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

          <UFormField v-if="showContactFields" :label="fieldLabel('Name', nameRequired)" :required="nameRequired">
            <UInput
              v-model="name"
              autocomplete="name"
              :disabled="pending"
              :maxlength="120"
              placeholder="Your name"
            />
          </UFormField>

          <UFormField v-if="showContactFields" :label="fieldLabel('Mobile number', phoneRequired)" :required="phoneRequired">
            <UInput
              v-model="phone"
              autocomplete="tel"
              :disabled="pending"
              :maxlength="64"
              placeholder="079 123 45 67"
              type="tel"
            />
          </UFormField>

          <UFormField v-if="showContactFields" :label="fieldLabel('Email address', emailRequired)" :required="emailRequired">
            <UInput
              v-model="email"
              autocomplete="email"
              :disabled="pending"
              :maxlength="254"
              placeholder="you@example.com"
              type="email"
            />
          </UFormField>

          <UFormField label="Payment" required>
            <URadioGroup
              v-model="paymentMethod"
              :disabled="pending"
              :items="paymentOptions"
              label-key="label"
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

          <p v-if="validationError || error" class="menu-order-checkout__error" role="alert">
            {{ validationError || error }}
          </p>
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
          <UIcon v-if="pending" name="i-lucide-loader-circle" class="animate-spin" />
          <span>{{ pending ? 'Sending…' : 'Send to Kitchen' }}</span>
          <UIcon v-if="!pending" name="i-lucide-arrow-right" />
        </button>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 16:10 CEST — Pre-order planning pass: keep shared checkout focused on contact and payment.
import { computed, ref, watch } from 'vue'
import type {
  MenuOrderContactField,
  MenuPaymentMethod,
} from '../../../models/kitchen/menu/menu.model'
import type { KitchenOrderType } from '../../../models/kitchen/order.model'
import {
  menuOrderPaymentOptions,
  type MenuOrderCheckoutInput,
  type MenuOrderPaymentSelection,
} from '../../../utils/menu-order-payment'

const props = withDefaults(defineProps<{
  error?: string
  handoffInstructions?: string
  handoffTitle?: string
  open: boolean
  orderType: KitchenOrderType
  paymentMethods: MenuPaymentMethod[]
  pending?: boolean
  requiredContactFields?: MenuOrderContactField[]
  showContactFields?: boolean
  selectionLabel: string
  totalLabel: string
}>(), {
  showContactFields: true,
})
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
const name = ref('')
const phone = ref('')
const email = ref('')
const paymentMethod = ref<MenuOrderPaymentSelection | undefined>()
const validationError = ref('')
const openModel = computed({
  get: () => props.open,
  set: (open: boolean) => emit('update:open', open),
})
const paymentOptions = computed(() => menuOrderPaymentOptions({
  orderType: props.orderType,
  paymentMethods: props.paymentMethods,
}))
const orderTypeLabel = computed(() => props.orderType
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')
)
const requiredContactFields = computed(() => new Set(props.requiredContactFields || []))
const nameRequired = computed(() => requiredContactFields.value.has('name'))
const phoneRequired = computed(() => requiredContactFields.value.has('phone'))
const emailRequired = computed(() => requiredContactFields.value.has('email'))

watch(
  () => [props.open, props.orderType, props.paymentMethods] as const,
  () => {
    if (!props.open) return
    validationError.value = ''
    const values = paymentOptions.value.map(option => option.value)
    if (!paymentMethod.value || !values.includes(paymentMethod.value)) {
      paymentMethod.value = values[0]
    }
  },
  { immediate: true, deep: true }
)

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
  if (!paymentMethod.value) {
    validationError.value = 'Choose when you would like to pay.'
    return
  }

  emit('submit', {
    name: customerName,
    phone: customerPhone,
    email: customerEmail,
    paymentMethod: paymentMethod.value,
  })
}

function fieldLabel(label: string, required: boolean) {
  return required ? label : `${label} (optional)`
}
</script>

<style scoped>
.menu-order-checkout__host { display: contents; }
:deep(.menu-order-checkout__overlay) { z-index: 60; background: rgb(15 23 42 / 62%); backdrop-filter: blur(3px); }
:deep(.menu-order-checkout__content) { z-index: 61; width: min(calc(100vw - 2rem), 36rem); border: 1px solid color-mix(in srgb, var(--menu-primary) 28%, transparent); border-radius: var(--menu-radius); background: var(--menu-bg); color: var(--menu-text); }
:deep(.menu-order-checkout__header), :deep(.menu-order-checkout__footer) { border-color: color-mix(in srgb, var(--menu-text) 12%, transparent); }
:deep(.menu-order-checkout__title) { color: var(--menu-title); font-family: var(--menu-title-font); }
:deep(.menu-order-checkout__description), :deep(.menu-order-checkout__close) { color: var(--menu-muted); }
.menu-order-checkout { display: grid; gap: calc(var(--spacing) * 4); }
.menu-order-checkout__summary { display: flex; justify-content: space-between; gap: calc(var(--spacing) * 4); padding: 0.8rem calc(var(--spacing) * 4); border-radius: var(--menu-radius-control); background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg)); }
.menu-order-checkout__summary span { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--menu-muted); }
.menu-order-checkout__summary strong { color: var(--menu-primary); }
.menu-order-checkout__error { margin: 0; color: var(--ui-error); font-size: 0.9rem; font-weight: var(--font-weight-bold); }
.menu-order-checkout__submit { display: inline-flex; width: 100%; justify-content: center; align-items: center; gap: calc(var(--spacing) * 2); padding: 0.8rem calc(var(--spacing) * 4); border: 0; border-radius: var(--menu-radius-control); background: var(--menu-primary); color: var(--menu-primary-contrast); cursor: pointer; font: inherit; font-weight: var(--font-weight-black); }
.menu-order-checkout__submit:disabled { cursor: not-allowed; opacity: 0.55; }
</style>
