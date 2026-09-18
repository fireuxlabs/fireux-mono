<template>
  <div class="space-y-4">
    <UCard>
      <template #header
        ><h3 class="font-semibold">{{ label }} settings</h3></template
      >
      <MoleculesFormsEditableCheckbox
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
      <p v-if="!service.enabled" class="mt-3 text-sm text-muted">
        {{ service.name }} is off. These settings take effect when the service
        is enabled.
      </p>
      <p v-if="config.type === 'browse'" class="mt-3 text-sm text-muted">
        Guests can view the published Menus linked to this service. Public Menu
        pages remain available independently.
      </p>
      <p v-if="diagnostic" class="mt-3 text-sm text-muted">
        The customer flow for this interaction is not ready.
      </p>
    </UCard>
    <template v-if="orderConfig">
      <WorkspaceKitchenServicesAvailability
        :config="orderConfig"
        :disabled="disabled"
        :service-label="label"
        :update-function="update"
      />
      <WorkspaceKitchenServicesTiming
        :config="orderConfig"
        :allow-asap="config.type !== 'pre_order'"
        :disabled="disabled"
        :service-label="label"
        :time-label="config.type === 'pre_order' ? 'Dining' : 'Service'"
        customer-message-placeholder="Optional customer message"
        :update-function="update"
      />
      <div class="grid items-start gap-4 lg:grid-cols-2">
        <WorkspaceKitchenServicesCustomerDetails
          :config="orderConfig"
          :disabled="disabled"
          handoff-label="Instructions"
          handoff-placeholder="Optional instructions"
          :update-function="update"
        />
        <WorkspaceKitchenServicesPayment :config="orderConfig" />
      </div>
      <WorkspaceKitchenServicesWhatsApp
        v-if="config.type === 'pre_order'"
        :app-id="appId"
        :kitchen-id="kitchenId"
        :service-id="service.id"
        :config="orderConfig"
        :disabled="disabled"
        :update-function="update"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type {
  KitchenService,
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../../../models/service.model'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
const props = defineProps<{
  config: KitchenServiceInteraction
  service: KitchenService
  appId?: string
  kitchenId?: string
  disabled?: boolean
  update: (changes: KitchenServiceInteractionChanges) => Promise<void>
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
  Boolean(props.service.hours?.timezone && props.service.hours.windows.length)
)
const diagnostic = computed(() =>
  ['dine_in', 'room_service'].includes(props.config.type)
)
const updateEnabled = (enabled: boolean) => props.update({ enabled })
</script>
