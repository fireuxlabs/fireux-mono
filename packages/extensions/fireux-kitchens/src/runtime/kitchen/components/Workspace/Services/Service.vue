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
  <section
    v-else-if="service && selectedKitchen && setup"
    class="workspace-surface"
  >
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
    <UCard>
      <template #header
        ><h2 class="font-semibold">Online ordering setup</h2></template
      >
      <div class="grid gap-3 sm:grid-cols-3">
        <a
          v-for="check in setup.checks"
          :key="check.key"
          :href="check.href"
          class="flex items-center gap-3 rounded-xl border border-default p-3 text-sm hover:bg-elevated"
        >
          <UIcon
            :name="
              check.pending
                ? 'i-lucide-loader-circle'
                : check.done
                  ? 'i-lucide-circle-check'
                  : 'i-lucide-circle'
            "
            :class="check.done ? 'text-success' : 'text-muted'"
            class="size-5 shrink-0"
            aria-hidden="true"
          />
          <span
            >{{ check.label
            }}<span class="sr-only"
              >:
              {{
                check.pending
                  ? 'Checking'
                  : check.done
                    ? 'Configured'
                    : 'Needed'
              }}</span
            ></span
          >
        </a>
      </div>
      <p v-if="setup.configured" class="mt-3 text-sm text-muted">
        Menu and service settings are configured. Review payment methods and
        delivery zones before sharing customer links.
      </p>
    </UCard>
    <UCard :key="service.id">
      <MoleculesFormsEditableSimpleField
        label="Service name"
        :value="service.name"
        :disabled="!canWrite || busy"
        :update="updateName"
        :capture-intent="captureServiceIntent"
      />
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
          How customers order
        </h2>
        <p class="text-sm text-muted">
          Select an option to configure it. Each option has its own on/off
          switch.
        </p>
      </div>
      <nav
        aria-label="Customer ordering options"
        class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <button
          v-for="option in primaryOptions"
          :key="option.type"
          type="button"
          class="rounded-xl border p-4 text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
          :class="
            interactionType === option.type
              ? 'border-primary bg-primary/5'
              : 'border-default'
          "
          :aria-pressed="interactionType === option.type"
          :disabled="busy"
          @click="interactionType = option.type"
        >
          <span class="flex items-center justify-between gap-2"
            ><span class="font-semibold">{{ option.label }}</span
            ><span class="text-xs text-muted">{{
              interactionState(option.type)
            }}</span></span
          >
          <span class="mt-2 block text-sm text-muted">{{
            option.description
          }}</span>
        </button>
      </nav>
      <details class="rounded-xl border border-default p-4">
        <summary class="cursor-pointer text-sm font-medium">
          On-site & other options
        </summary>
        <nav
          aria-label="Other service options"
          class="mt-4 flex flex-wrap gap-2"
        >
          <UButton
            v-for="option in otherOptions"
            :key="option.type"
            :aria-pressed="interactionType === option.type"
            :variant="interactionType === option.type ? 'soft' : 'ghost'"
            color="neutral"
            :disabled="busy"
            @click="interactionType = option.type"
            >{{ option.label }}
            <span class="text-xs opacity-70">{{
              interactionState(option.type)
            }}</span></UButton
          >
        </nav>
      </details>
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
    <UCard>
      <template #header
        ><h2 class="font-semibold">Service availability</h2></template
      >
      <MoleculesFormsEditableCheckbox
        label="Offer this service to guests"
        checkbox-label="Enable this service"
        true-label="Enabled"
        false-label="Off"
        :value="service.enabled"
        :disabled="!canWrite || busy || (!service.enabled && !setup.canEnable)"
        :update="updateEnabled"
      />
      <p v-if="!service.enabled" class="mt-3 text-sm text-muted">
        This service is off. Configure the menus and ordering options above,
        then enable it when you are ready.
      </p>
      <p
        v-if="!setup.canEnable && !service.enabled"
        class="mt-2 text-sm text-muted"
      >
        Choose at least one menu and add serving hours for any enabled ordering
        option.
      </p>
    </UCard>
    <WorkspaceKitchenServicesCustomerLinks
      :service="service"
      :menus="menus"
      :menus-outcome="menusOutcome"
      :kitchen-slug="selectedKitchen.slug"
    />
  </section>
  <UAlert
    v-else
    title="Service not found"
    :actions="[{ label: 'Services', to: '/workspace/kitchen/orders/services' }]"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenServices } from '../../../composables/services/useKitchenServices'
import { KitchenOrderTypes } from '../../../models/order-lifecycle.model'
import type {
  KitchenServiceChanges,
  KitchenServiceInteraction,
  KitchenServiceInteractionChanges,
} from '../../../models/service.model'
import { newKitchenServiceInteraction } from '../../../utils/service-interaction'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import { serviceSetupSummary } from '../../../utils/service-setup-summary'
const {
  services,
  captureIntent,
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
const setup = computed(() =>
  service.value
    ? serviceSetupSummary(service.value, menus.value, menusOutcome.value)
    : null
)
const interactionType = ref<KitchenServiceInteraction['type']>('collection')
const primaryOptions = [
  {
    type: 'collection' as const,
    label: 'Collection',
    description: 'Customers collect from your venue.',
  },
  {
    type: 'delivery' as const,
    label: 'Delivery',
    description: 'Deliver to eligible addresses.',
  },
  {
    type: 'pre_order' as const,
    label: 'Pre-order',
    description: 'Guests request a meal in advance.',
  },
  {
    type: 'browse' as const,
    label: 'View menus',
    description: 'Browse without placing an order.',
  },
]
const otherOptions = KitchenOrderTypes.filter(
  (type) => !primaryOptions.some((option) => option.type === type)
).map((type) => ({ type, label: kitchenOrderTypeLabel(type) }))
watch(
  () => service.value?.id,
  () => {
    interactionType.value =
      primaryOptions.find(
        (option) =>
          option.type !== 'browse' &&
          service.value?.interactions.some(
            (row) => row.type === option.type && row.enabled
          )
      )?.type || 'collection'
  },
  { immediate: true }
)
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
const captureSurface = useCommandScope([serviceId, kitchenId, canWrite, interactionType])
watch([serviceId, kitchenId, canWrite, interactionType], () => {
  error.value = ''; busy.value = false
}, { flush: 'sync' })
function interactionState(type: KitchenServiceInteraction['type']) {
  const row = service.value?.interactions.find((row) => row.type === type)
  return !row?.enabled
    ? 'Off'
    : row.type !== 'browse' && row.availability?.paused
      ? 'Paused'
      : 'Enabled'
}
const captureServiceIntent = () => {
  const local = captureSurface(); const owner = captureIntent()
  return () => local() && owner()
}
async function run(command: () => Promise<unknown>) {
  if (busy.value || !canWrite.value || !service.value)
    throw new Error('This service cannot be edited right now.')
  const local = captureSurface()
  const owner = captureIntent()
  const isCurrent = () => local() && owner()
  busy.value = true
  error.value = ''
  try {
    await command()
  } catch (cause) {
    if (isCurrent()) error.value = cause instanceof Error ? cause.message : 'Please try again.'
    throw cause
  } finally {
    if (local()) busy.value = false
  }
}
const updateService = (changes: KitchenServiceChanges) =>
  run(() => update(serviceId.value, changes))
const updateName = (name: string) => updateService({ name })
const updateEnabled = (enabled: boolean) => updateService({ enabled })
const saveInteraction = (changes: KitchenServiceInteractionChanges) =>
  run(() => updateInteraction(serviceId.value, interactionType.value, changes))
</script>
