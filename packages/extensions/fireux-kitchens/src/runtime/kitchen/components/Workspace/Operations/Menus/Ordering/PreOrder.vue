<!-- Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: bind the focused Menu identity into the provider test. -->
<!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: define Pre-order configuration as advance table service with asynchronous confirmation. -->
<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOperationsMenusWorkspaceHeader current-label="Pre-order" />

    <UCard>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl space-y-1">
          <h1 class="text-lg font-semibold text-highlighted">Pre-order</h1>
          <p class="text-sm leading-6 text-dimmed">
            Accept advance dine-in orders for larger tables. Guests can send a
            request at any time and choose a dining time for the Kitchen to
            confirm.
          </p>
        </div>

        <UBadge :color="preOrderConfig ? 'success' : 'neutral'" variant="soft">
          {{ preOrderConfig ? 'Enabled' : 'Disabled' }}
        </UBadge>
      </div>
    </UCard>

    <UAlert
      v-if="!menu"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Menu unavailable"
      description="Return to Menus and choose a Menu before configuring Pre-order."
    />

    <UCard v-else-if="!preOrderConfig">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Pre-order is not enabled
          </h2>
          <p class="text-sm text-dimmed">
            Enable it to create an independent future-order policy for this
            Menu.
          </p>
        </div>

        <UButton
          icon="i-lucide-calendar-clock"
          :disabled="!canWrite"
          :loading="enabling"
          @click="enablePreOrder"
        >
          Enable Pre-order
        </UButton>
      </div>
    </UCard>

    <WorkspaceKitchenOperationsMenusOrderingTiming
      v-if="preOrderConfig"
      :allow-asap="false"
      :config="preOrderConfig"
      customer-message-placeholder="Order ahead for a larger table and choose when you would like to dine."
      description="Pre-order requests stay open at all times. Define the future dining times guests may request."
      :disabled="!canWrite"
      :menu-hours="menuServiceHours"
      notice-label="Minimum notice (minutes)"
      surface-label="Pre-order"
      time-label="Dining"
      :update-function="updatePreOrder"
    />

    <WorkspaceKitchenOperationsMenusOrderingDetails
      v-if="preOrderConfig"
      :config="preOrderConfig"
      description="Tell the table what happens after the Kitchen confirms its requested dining time."
      :disabled="!canWrite"
      handoff-label="Table service"
      handoff-placeholder="The Kitchen will confirm the dining time and serve the order at the table."
      surface-label="Pre-order"
      :update-function="updatePreOrder"
    />

    <WorkspaceKitchenOperationsMenusOrderingAvailability
      v-if="preOrderConfig"
      :config="preOrderConfig"
      :disabled="!canWrite"
      surface-label="Pre-order"
      :update-function="updatePreOrder"
    />

    <WorkspaceKitchenOperationsMenusOrderingWhatsApp
      v-if="preOrderConfig"
      :app-id="activeKitchenAppId"
      :config="preOrderConfig"
      :disabled="!canWrite"
      :kitchen-id="kitchenId"
      :menu-id="menuId"
      :update-function="updatePreOrder"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../menu/utils/menu.ts'
import { useKitchenWorkspaceMenuOrdering } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenuOrdering'

const {
  activeKitchenAppId,
  canWrite,
  kitchenId,
  menu,
  menuId,
  menuServiceHours,
  patchOrderTypeConfig,
  preOrderConfig,
  setOrderType,
} = useKitchenWorkspaceMenuOrdering()
const enabling = ref(false)

async function enablePreOrder() {
  if (enabling.value) return
  enabling.value = true
  try {
    await setOrderType('pre_order', true)
  } finally {
    enabling.value = false
  }
}

const updatePreOrder = (patch: Partial<MenuOrderTypeConfig>) =>
  patchOrderTypeConfig('pre_order', patch)
</script>
