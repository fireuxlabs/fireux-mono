<template>
  <MoleculesStateCard
    v-if="outcome === 'pending'"
    entity="Kitchen ordering"
    kind="document"
    loading
  />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    entity="Kitchen ordering"
    kind="document"
    state="error"
  />
  <section v-else-if="validType && selectedKitchen" class="workspace-surface">
    <UButton
      to="/workspace/kitchen/orders/ordering"
      label="Ordering"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
    />
    <UPageHeader :title="label" />
    <UAlert v-if="error" title="Could not update service" color="error"
      ><template #description><MoleculesCopyError :message="error" /></template
    ></UAlert>
    <WorkspaceKitchenOrderingAvailability
      :config="service"
      :disabled="!canWrite || busy"
      :service-label="label"
      :update-function="updateService"
    />
    <WorkspaceKitchenOrderingMenus
      :service="service"
      :menus="menus"
      :outcome="menusOutcome"
      :disabled="!canWrite || busy || menusPending"
      :update="updateService"
    />
    <WorkspaceKitchenOrderingTiming
      :config="service"
      :allow-asap="type !== 'pre_order'"
      :disabled="!canWrite || busy"
      :kitchen-hours="hours"
      :hours-outcome="hoursOutcome"
      :service-label="label"
      :time-label="type === 'pre_order' ? 'Dining' : 'Service'"
      customer-message-placeholder="Optional customer message"
      :update-function="updateService"
    />
    <WorkspaceKitchenOrderingCustomerDetails
      :config="service"
      :disabled="!canWrite || busy"
      handoff-label="Instructions"
      handoff-placeholder="Optional instructions"
      :update-function="updateService"
    />
    <WorkspaceKitchenOrderingPayment :config="service" />
    <WorkspaceKitchenOrderingWhatsApp
      v-if="type === 'pre_order'"
      :app-id="activeKitchenAppId"
      :kitchen-id="kitchenId"
      :config="service"
      :disabled="!canWrite || busy"
      :update-function="updateService"
    />
  </section>
  <UAlert v-else title="Ordering service unavailable" />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenOrdering } from '../../../composables/workspace/ordering/useKitchenOrdering'
import {
  KitchenOrderTypes,
  type KitchenOrderType,
} from '../../../models/order-lifecycle.model'
import { newKitchenOrderingService } from '../../../utils/ordering-service'
import type { KitchenOrderingService } from '../../../models/ordering.model'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
const {
  services,
  outcome,
  selectedKitchen,
  activeKitchenAppId,
  kitchenId,
  canWrite,
  menus,
  menusPending,
  menusOutcome,
  hours,
  hoursOutcome,
  update,
} = useKitchenOrdering()
const routeType = useRouteParam('service')
const type = computed(() => routeType.value as KitchenOrderType)
const validType = computed(() => KitchenOrderTypes.includes(type.value))
const label = computed(() => kitchenOrderTypeLabel(type.value))
const service = computed<KitchenOrderingService>(
  () =>
    services.value.find((row) => row.type === type.value) ||
    newKitchenOrderingService(type.value)
)
const busy = ref(false)
const error = ref('')
async function updateService(changes: Partial<KitchenOrderingService>) {
  busy.value = true
  error.value = ''
  try {
    await update(type.value, changes)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
    throw cause
  } finally {
    busy.value = false
  }
}
</script>
