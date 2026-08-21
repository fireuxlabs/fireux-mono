<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: add focused Menu Delivery policy configuration. -->
<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOperationsMenusWorkspaceHeader current-label="Delivery" />

    <UCard>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl space-y-1">
          <h1 class="text-lg font-semibold text-highlighted">Delivery</h1>
          <p class="text-sm leading-6 text-dimmed">
            Configure this Menu’s delivery timing and customer-facing policy.
            Zones and accepted payment methods remain Kitchen settings.
          </p>
        </div>

        <UBadge :color="deliveryConfig ? 'success' : 'neutral'" variant="soft">
          {{ deliveryConfig ? 'Enabled' : 'Disabled' }}
        </UBadge>
      </div>
    </UCard>

    <UAlert
      v-if="!menu"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Menu unavailable"
      description="Return to Menus and choose a Menu before configuring Delivery."
    />

    <UCard v-else-if="!deliveryConfig">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Delivery is not enabled
          </h2>
          <p class="text-sm text-dimmed">
            Enable it to create a Delivery policy for this Menu.
          </p>
        </div>

        <UButton
          icon="i-lucide-truck"
          :disabled="!canWrite"
          :loading="enabling"
          @click="enableDelivery"
        >
          Enable Delivery
        </UButton>
      </div>
    </UCard>

    <UCard v-if="deliveryConfig">
      <template #header>
        <div>
          <h3 class="text-sm font-semibold text-highlighted">
            Kitchen foundation
          </h3>
          <p class="text-sm text-dimmed">
            Shared operational truth used by every Delivery-enabled Menu.
          </p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UPageCard
          title="Delivery zones"
          :description="`${deliveryZones.length} configured`"
          icon="i-lucide-map-pinned"
          variant="subtle"
        />
        <UPageCard
          title="Delivery payments"
          :description="paymentSummary"
          icon="i-lucide-wallet-cards"
          variant="subtle"
        />
      </div>

      <template #footer>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-settings-2"
          to="/workspace/kitchen/identity"
        >
          Configure Kitchen fulfilment
        </UButton>
      </template>
    </UCard>

    <WorkspaceKitchenOperationsMenusOrderingTiming
      v-if="deliveryConfig"
      :config="deliveryConfig"
      customer-message-placeholder="Delivery is available within the listed areas."
      :disabled="!canWrite"
      :menu-hours="menuServiceHours"
      surface-label="Delivery"
      time-label="Delivery"
      :update-function="updateDelivery"
    />

    <WorkspaceKitchenOperationsMenusOrderingDetails
      v-if="deliveryConfig"
      :config="deliveryConfig"
      description="Tell customers how delivery is handed over and which contact details the Kitchen needs."
      :disabled="!canWrite"
      handoff-label="Delivery handoff"
      handoff-placeholder="Meet the driver at the main entrance."
      surface-label="Delivery"
      :update-function="updateDelivery"
    />

    <WorkspaceKitchenOperationsMenusOrderingAvailability
      v-if="deliveryConfig"
      :config="deliveryConfig"
      :disabled="!canWrite"
      surface-label="Delivery"
      :update-function="updateDelivery"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../menu/models/menu.model.ts'
import { useKitchenWorkspaceMenuOrdering } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenuOrdering'
import {
  kitchenPaymentMethodsForOrderType,
  readKitchenFulfilmentConfig,
} from '../../../../../utils/kitchen-spine'

const {
  canWrite,
  deliveryConfig,
  menuServiceHours,
  menu,
  patchOrderTypeConfig,
  selectedKitchen,
  setOrderType,
} = useKitchenWorkspaceMenuOrdering()
const enabling = ref(false)
const fulfilment = computed(() =>
  readKitchenFulfilmentConfig(
    selectedKitchen.value as Record<string, unknown> | null
  )
)
const deliveryZones = computed(() => fulfilment.value.delivery_zones)
const paymentMethods = computed(() =>
  kitchenPaymentMethodsForOrderType(fulfilment.value, 'delivery')
)
const paymentSummary = computed(() =>
  paymentMethods.value.length
    ? paymentMethods.value
        .map((method) => method.replaceAll('_', ' '))
        .join(', ')
    : 'No compatible methods configured'
)

async function enableDelivery() {
  if (enabling.value) return
  enabling.value = true
  try {
    await setOrderType('delivery', true)
  } finally {
    enabling.value = false
  }
}

const updateDelivery = (patch: Partial<MenuOrderTypeConfig>) =>
  patchOrderTypeConfig('delivery', patch)
</script>
