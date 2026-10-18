<template>
  <section class="space-y-4">
    <h3 class="font-semibold">{{ kitchenOrderTypeLabel(type) }} settings</h3>
    <UCheckbox
      v-if="allowToggle"
      :model-value="config.enabled"
      :label="'Allow ' + kitchenOrderTypeLabel(type).toLowerCase()"
      :disabled="disabled"
      @update:model-value="emit('update', { enabled: $event === true })"
    />
    <WorkspaceKitchenOfferingsTiming
      :config="config"
      :allow-asap="type !== 'pre_order'"
      :disabled="disabled"
      :interaction-label="kitchenOrderTypeLabel(type)"
      :time-label="type === 'pre_order' ? 'Dining' : 'Serving'"
      customer-message-placeholder="Optional customer message"
      :update-function="update"
    />
    <div class="grid items-start gap-4 md:grid-cols-2">
      <WorkspaceKitchenOfferingsCustomerDetails
        :config="config"
        :disabled="disabled"
        handoff-label="Instructions"
        handoff-placeholder="Optional instructions"
        :update-function="update"
      />
      <WorkspaceKitchenOfferingsPayment
        :config="config"
        :kitchen-id="kitchenId"
      />
    </div>
    <WorkspaceKitchenOfferingsAvailability
      :config="{ ...config, enabled: !allowToggle || config.enabled }"
      :disabled="disabled"
      :interaction-label="kitchenOrderTypeLabel(type)"
      :update-function="update"
    />
  </section>
</template>
<script setup lang="ts">
import type { KitchenOrderType } from '../../../../models/offering-interaction-types.model'
import type { KitchenOrderTypeConfig } from '../../../../models/ordering.model'
import type { KitchenOfferingInteractionChanges } from '../../../../models/offering.model'
import { kitchenOrderTypeLabel } from '../../../../utils/kitchen-order-label'
defineProps<{
  type: KitchenOrderType
  config: KitchenOrderTypeConfig & { enabled: boolean }
  allowToggle: boolean
  kitchenId: string
  disabled: boolean
}>()
const emit = defineEmits<{
  update: [changes: KitchenOfferingInteractionChanges]
}>()
async function update(changes: KitchenOfferingInteractionChanges) {
  emit('update', changes)
}
</script>
