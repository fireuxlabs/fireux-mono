<!-- Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: verify the stored recipient through the authenticated provider seam. -->
<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">WhatsApp alert</h3>
        <p class="text-sm text-dimmed">
          Send a Kitchen alert when a Pre-order reaches intake. Pay-now orders
          notify after payment.
        </p>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsFirestoreSimpleField
        label="Recipient WhatsApp number"
        type="tel"
        :maxlength="24"
        :firebase-value="recipientPhone"
        placeholder="+41 79 123 45 67"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :validation-function="validateRecipientPhone"
        :update-function="updateRecipientPhone"
      />

      <MoleculesFormsFirestoreCheckbox
        label="WhatsApp Pre-order alerts"
        display-label="Current alert state"
        checkbox-label="Send new Pre-orders to this number"
        true-label="Alerts enabled"
        false-label="Alerts disabled"
        :firebase-value="enabled"
        :disabled="disabled || !recipientPhone"
        :disabled-message="
          disabled
            ? 'This menu is read-only.'
            : 'Add a valid international number first.'
        "
        :update-function="updateEnabled"
      />

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-message-circle"
        title="Server delivery"
        description="The deployment supplies the WhatsApp Business sender, approved template, and access token. These credentials are never stored on the Menu."
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
        :description="testError"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationResult } from 'fireux-core/runtime/composables/forms/useEditableStringField'
import type { MenuOrderTypeConfig } from '../../../../../menu/utils/kitchen-menu.ts'
import { normalizeMenuOrderWhatsAppPhone } from '../../../../../menu/utils/menu-order-whatsapp'
import { useKitchenWorkspaceMenuWhatsAppTest } from '../../../../composables/workspace/Menus/useKitchenWorkspaceMenuWhatsAppTest'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  appId?: string
  config: MenuOrderTypeConfig
  disabled?: boolean
  kitchenId?: string
  menuId?: string
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
} = useKitchenWorkspaceMenuWhatsAppTest({
  appId: computed(() => props.appId),
  kitchenId: computed(() => props.kitchenId),
  menuId: computed(() => props.menuId),
})
const testDisabled = computed(
  () =>
    props.disabled ||
    !enabled.value ||
    !recipientPhone.value ||
    !props.appId ||
    !props.kitchenId ||
    !props.menuId
)

const validateRecipientPhone = (value: string): ValidationResult => {
  if (!value.trim() || normalizeMenuOrderWhatsAppPhone(value)) {
    return { isValid: true }
  }

  return {
    isValid: false,
    message:
      'Use an international number beginning with + and its country code.',
  }
}

const updateRecipientPhone = (value: string) => {
  const recipient = normalizeMenuOrderWhatsAppPhone(value)

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
