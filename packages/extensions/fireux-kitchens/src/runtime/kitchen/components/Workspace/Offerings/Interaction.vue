<template>
  <div class="space-y-4">
    <UCard>
      <template #header
        ><h3 class="font-semibold">{{ label }} settings</h3></template
      >
      <MoleculesFormsEditableCheckbox
        :capture-intent="captureIntent"
        :label="label"
        :checkbox-label="'Enable ' + label.toLowerCase()"
        true-label="Enabled"
        false-label="Off"
        :value="config.enabled"
        :disabled="
          disabled || (!config.enabled && config.type !== 'browse' && !hasHours)
        "
        :update="updateEnabled"
      />
      <p
        v-if="config.type !== 'browse' && !hasHours"
        class="mt-3 text-sm text-muted"
      >
        Add serving hours above before enabling {{ label.toLowerCase() }}.
      </p>
      <p v-if="!offering.enabled" class="mt-3 text-sm text-muted">
        {{ offering.name }} is off. These settings take effect when the offering
        is enabled.
      </p>
      <p v-if="config.type === 'browse'" class="mt-3 text-sm text-muted">
        Guests can view the published Menus linked to this offering. Public Menu
        pages remain available independently.
      </p>
      <p v-if="diagnostic" class="mt-3 text-sm text-muted">
        The customer flow for this interaction is not ready.
      </p>
    </UCard>
    <template v-if="orderConfig">
      <WorkspaceKitchenOfferingsAvailability
        :config="orderConfig"
        :disabled="disabled"
        :interaction-label="label"
        :update-function="update"
        :capture-intent="captureIntent"
      />
      <WorkspaceKitchenOfferingsTiming
        :config="orderConfig"
        :allow-asap="config.type !== 'pre_order'"
        :disabled="disabled"
        :interaction-label="label"
        :time-label="config.type === 'pre_order' ? 'Dining' : 'Offering'"
        customer-message-placeholder="Optional customer message"
        :update-function="update"
        :capture-intent="captureIntent"
      />
      <div class="grid items-start gap-4 lg:grid-cols-2">
        <WorkspaceKitchenOfferingsCustomerDetails
          :config="orderConfig"
          :disabled="disabled"
          handoff-label="Instructions"
          handoff-placeholder="Optional instructions"
          :update-function="update"
          :capture-intent="captureIntent"
        />
        <WorkspaceKitchenOfferingsPayment
          :config="orderConfig"
          :kitchen-id="kitchenId"
        />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenOffering,
  KitchenOfferingInteraction,
  KitchenOfferingInteractionChanges,
} from '../../../models/offering.model'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
const props = defineProps<{
  config: KitchenOfferingInteraction
  offering: KitchenOffering
  appId?: string
  kitchenId: string
  disabled?: boolean
  captureIntent?: () => () => boolean
  update: (
    changes: KitchenOfferingInteractionChanges,
    isSurfaceCurrent?: () => boolean
  ) => Promise<void>
}>()
const label = computed(() =>
  props.config.type === 'browse'
    ? 'View menus'
    : kitchenOrderTypeLabel(props.config.type)
)
const orderConfig = computed(() =>
  props.config.type === 'browse' ? null : props.config
)
const hasHours = computed(() =>
  Boolean(props.offering.hours?.timezone && props.offering.hours.windows.length)
)
const diagnostic = computed(() =>
  ['dine_in', 'room_service'].includes(props.config.type)
)
const updateEnabled = (enabled: boolean, isSurfaceCurrent?: () => boolean) =>
  props.update({ enabled }, isSurfaceCurrent)
</script>
