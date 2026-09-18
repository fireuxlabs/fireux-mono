<template>
  <MoleculesStateCard
    v-if="outcome === 'pending' || outcome === 'idle'"
    entity="Kitchen services"
    loading
  />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    entity="Kitchen services"
    state="error"
  />
  <section v-else-if="service && selectedKitchen" class="workspace-surface">
    <UButton
      to="/workspace/kitchen/orders/services"
      label="Services"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      class="self-start"
    />
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold">{{ service.name }}</h1>
      <UBadge
        :color="service.enabled ? 'success' : 'neutral'"
        variant="subtle"
        >{{ service.enabled ? 'Enabled' : 'Off' }}</UBadge
      >
    </div>
    <UAlert
      v-if="error"
      title="Could not update service"
      :description="error"
      color="error"
      ><template #actions><MoleculesCopyError :message="error" /></template
    ></UAlert>
    <UCard :key="service.id">
      <div class="grid gap-5 md:grid-cols-2">
        <MoleculesFormsEditableSimpleField
          label="Service name"
          :value="service.name"
          :disabled="!canWrite || busy"
          :update="updateName"
        />
        <MoleculesFormsEditableCheckbox
          label="Service"
          checkbox-label="Enable this service"
          true-label="Enabled"
          false-label="Off"
          :value="service.enabled"
          :disabled="!canWrite || busy"
          :update="updateEnabled"
        />
      </div>
      <p v-if="!service.enabled" class="mt-4 text-sm text-muted">
        This service is off. Its Menus and interaction settings are retained.
      </p>
    </UCard>
    <div class="grid items-start gap-4 lg:grid-cols-2">
      <WorkspaceKitchenServicesMenus
        :key="'menus:' + service.id"
        :service="service"
        :menus="menus"
        :outcome="menusOutcome"
        :disabled="!canWrite || busy || menusPending"
        :update="updateService"
      />
      <WorkspaceKitchenServicesHours
        :key="'hours:' + service.id"
        :service="service"
        :timezone="timezone"
        :disabled="!canWrite || busy"
        :update="updateService"
      />
    </div>
    <section class="space-y-4" aria-labelledby="service-interactions">
      <div>
        <h2 id="service-interactions" class="text-lg font-semibold">
          Guest interactions
        </h2>
        <p class="text-sm text-muted">
          Choose how guests can use {{ service.name }}.
        </p>
      </div>
      <nav aria-label="Service interactions" class="flex flex-wrap gap-2">
        <UButton
          v-for="option in options"
          :key="option.type"
          :label="option.label"
          :aria-pressed="interactionType === option.type"
          :variant="interactionType === option.type ? 'soft' : 'ghost'"
          color="neutral"
          :disabled="busy"
          @click="interactionType = option.type"
        >
          {{ option.label }}
          <span class="text-xs opacity-70">{{
            interactionState(option.type)
          }}</span>
        </UButton>
      </nav>
      <WorkspaceKitchenServicesInteraction
        :key="service.id + ':' + interactionType"
        :config="interaction"
        :service="service"
        :app-id="activeKitchenAppId"
        :kitchen-id="kitchenId"
        :disabled="!canWrite || busy"
        :update="saveInteraction"
      />
    </section>
  </section>
  <UAlert
    v-else
    title="Service not found"
    :actions="[{ label: 'Services', to: '/workspace/kitchen/orders/services' }]"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenServices } from '../../../composables/workspace/services/useKitchenServices'
import { KitchenOrderTypes } from '../../../models/order-lifecycle.model'
import type {
  KitchenServiceChanges,
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../../../models/service.model'
import { newKitchenServiceInteraction } from '../../../utils/service-interaction'
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
  timezone,
  update,
  updateInteraction,
} = useKitchenServices()
const serviceId = useRouteParam('service')
const service = computed(() =>
  services.value.find((row) => row.id === serviceId.value)
)
const interactionType = ref<KitchenServiceInteraction['type']>('browse')
const options = [
  { type: 'browse' as const, label: 'Browse' },
  ...KitchenOrderTypes.map((type) => ({
    type,
    label: kitchenOrderTypeLabel(type),
  })),
]
const interaction = computed<KitchenServiceInteraction>(
  () =>
    service.value?.interactions.find(
      (row) => row.type === interactionType.value
    ) || {
      ...newKitchenServiceInteraction(interactionType.value),
      enabled: false,
    }
)
const busy = ref(false),
  error = ref('')
watch([serviceId, kitchenId], () => {
  interactionType.value = 'browse'
  error.value = ''
})
function interactionState(type: KitchenServiceInteraction['type']) {
  const row = service.value?.interactions.find((row) => row.type === type)
  return !row?.enabled
    ? 'Off'
    : row.type !== 'browse' && row.availability?.paused
      ? 'Paused'
      : 'Enabled'
}
async function run(command: () => Promise<unknown>) {
  if (busy.value || !canWrite.value || !service.value)
    throw new Error('This service cannot be edited right now.')
  busy.value = true
  error.value = ''
  try {
    await command()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
    throw cause
  } finally {
    busy.value = false
  }
}
const updateService = (changes: KitchenServiceChanges) =>
  run(() => update(serviceId.value, changes))
const updateName = (name: string) => updateService({ name })
const updateEnabled = (enabled: boolean) => updateService({ enabled })
const saveInteraction = (changes: KitchenServiceInteractionChanges) =>
  run(() => updateInteraction(serviceId.value, interactionType.value, changes))
</script>
