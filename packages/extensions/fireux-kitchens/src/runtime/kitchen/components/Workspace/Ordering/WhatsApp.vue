<!-- Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: verify the stored recipient through the authenticated provider seam. -->
<template>
  <MoleculesDisclosurePanel
    title="WhatsApp alerts"
    description="Optional Kitchen notifications."
    icon="i-lucide-message-circle"
    :default-open="false"
  >
    <div class="grid gap-5">
      <MoleculesFormsEditableSimpleField
        label="Recipient WhatsApp number"
        type="tel"
        :maxlength="24"
        :value="recipientPhone"
        placeholder="+41 79 123 45 67"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :validation-function="validateRecipientPhone"
        :update="updateRecipientPhone"
      />

      <MoleculesFormsEditableCheckbox
        label="WhatsApp Pre-order alerts"
        display-label="Current alert state"
        checkbox-label="Send new Pre-orders to this number"
        true-label="Alerts enabled"
        false-label="Alerts disabled"
        :value="enabled"
        :disabled="disabled || !recipientPhone"
        :disabled-message="
          disabled
            ? 'This Kitchen is read-only.'
            : 'Add a valid international number first.'
        "
        :update="updateEnabled"
      />

      <UButton
        icon="i-lucide-send"
        :disabled="testDisabled"
        :loading="testPending"
        @click="runTest"
      >
        Send WhatsApp test
      </UButton>

      <UAlert
        v-if="testSent"
        color="success"
        variant="soft"
        icon="i-lucide-circle-check"
        title="Test sent"
        description="Check the configured WhatsApp recipient."
      />

      <UAlert
        v-else-if="testError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Test not sent"
      >
        <template #description
          ><MoleculesCopyError :message="testError"
        /></template>
      </UAlert>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationResult } from 'fireux-core/runtime/composables/forms/useEditableStringField'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
import { normalizeKitchenOrderWhatsAppPhone } from '../../../utils/ordering-whatsapp'
import { useKitchenOrderingWhatsAppTest } from '../../../composables/workspace/ordering/useKitchenOrderingWhatsAppTest'

type UpdateFn = (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  appId?: string
  config: KitchenOrderTypeConfig
  disabled?: boolean
  kitchenId?: string
  updateFunction: UpdateFn
}>()
const whatsapp = computed(() => props.config.notifications?.whatsapp)
const recipientPhone = computed(() => whatsapp.value?.recipient_phone || '')
const enabled = computed(() => whatsapp.value?.enabled === true)
const {
  error: testError,
  pending: testPending,
  sent: testSent,
  sendTest,
} = useKitchenOrderingWhatsAppTest({
  appId: computed(() => props.appId),
  kitchenId: computed(() => props.kitchenId),
})
const testDisabled = computed(
  () =>
    props.disabled ||
    !enabled.value ||
    !recipientPhone.value ||
    !props.appId ||
    !props.kitchenId
)

const validateRecipientPhone = (value: string): ValidationResult => {
  if (!value.trim() || normalizeKitchenOrderWhatsAppPhone(value)) {
    return { isValid: true }
  }

  return {
    isValid: false,
    message:
      'Use an international number beginning with + and its country code.',
  }
}

const updateRecipientPhone = (value: string) => {
  const recipient = normalizeKitchenOrderWhatsAppPhone(value)

  return props.updateFunction({
    notifications: {
      whatsapp: {
        enabled: Boolean(recipient) && enabled.value,
        recipient_phone: recipient,
      },
    },
  })
}

const updateEnabled = (value: boolean) =>
  props.updateFunction({
    notifications: {
      whatsapp: {
        enabled: value && Boolean(recipientPhone.value),
        recipient_phone: recipientPhone.value,
      },
    },
  })

const runTest = () => sendTest().catch(() => undefined)
</script>
