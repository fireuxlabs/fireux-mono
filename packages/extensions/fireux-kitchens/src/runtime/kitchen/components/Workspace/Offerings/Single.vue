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
    v-else-if="offering && selectedKitchen && setup"
    class="workspace-surface"
  >
    <UButton
      to="/workspace/kitchen/services"
      label="Services"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      class="self-start"
    />
    <div class="flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold">{{ offering.name }}</h1>
      <UBadge
        :color="offering.enabled ? 'success' : 'neutral'"
        variant="subtle"
        >{{ offering.enabled ? 'Enabled' : 'Off' }}</UBadge
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
    <UCard :key="offering.id">
      <MoleculesFormsEditableSimpleField
        label="Service name"
        :value="offering.name"
        :disabled="!canWrite || busy"
        :update="updateName"
        :capture-intent="captureOfferingIntent"
      />
    </UCard>
    <UCard
      v-if="offering.interactions.some((row) => row.type === 'collection')"
    >
      <MoleculesFormsEditableSelect
        label="Earliest collection"
        :value="offering.collection_timing || 'same_day'"
        :options="[
          { label: 'Same day', value: 'same_day' },
          { label: 'From tomorrow', value: 'next_day' },
        ]"
        :disabled="!canWrite || busy"
        :capture-intent="captureOfferingIntent"
        :update="updateCollectionTiming"
      />
    </UCard>
    <div class="grid items-start gap-4 lg:grid-cols-2">
      <WorkspaceKitchenOfferingsMenus
        :key="'menus:' + offering.id"
        :offering="offering"
        :menus="menus"
        :outcome="menusOutcome"
        :disabled="!canWrite || busy || menusPending"
        :update="updateOffering"
        :capture-intent="captureOfferingIntent"
      />
      <WorkspaceKitchenOfferingsHours
        :key="'hours:' + offering.id"
        :offering="offering"
        :timezone="timezone"
        :disabled="!canWrite || busy"
        :update="updateOffering"
        :capture-intent="captureOfferingIntent"
      />
    </div>
    <section class="space-y-4" aria-labelledby="offering-interactions">
      <div>
        <h2 id="offering-interactions" class="text-lg font-semibold">
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
      <WorkspaceKitchenOfferingsInteraction
        :key="offering.id + ':' + interactionType"
        :config="interaction"
        :offering="offering"
        :app-id="activeKitchenAppId"
        :kitchen-id="kitchenId"
        :disabled="!canWrite || busy"
        :update="saveInteraction"
        :capture-intent="captureOfferingIntent"
      />
    </section>
    <UCard>
      <template #header
        ><h2 class="font-semibold">Service availability</h2></template
      >
      <MoleculesFormsEditableCheckbox
        label="Make this service available to guests"
        checkbox-label="Enable this service"
        true-label="Enabled"
        false-label="Off"
        :value="offering.enabled"
        :disabled="!canWrite || busy || (!offering.enabled && !setup.canEnable)"
        :update="updateEnabled"
        :capture-intent="captureOfferingIntent"
      />
      <p v-if="!offering.enabled" class="mt-3 text-sm text-muted">
        This service is off. Configure the menus and ordering options above,
        then enable it when you are ready.
      </p>
      <p
        v-if="!setup.canEnable && !offering.enabled"
        class="mt-2 text-sm text-muted"
      >
        Select regular interactive menus, publish at least one, and add serving
        hours for any enabled ordering option.
      </p>
    </UCard>
    <WorkspaceKitchenOfferingsCustomerLinks
      :offering="offering"
      :menus="menus"
      :menus-outcome="menusOutcome"
      :kitchen-slug="selectedKitchen.identity.slug"
    />
  </section>
  <UAlert
    v-else
    title="Service not found"
    :actions="[{ label: 'Services', to: '/workspace/kitchen/services' }]"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import { KitchenOrderTypes } from '../../../models/offering-interaction-types.model'
import type {
  KitchenOfferingChanges,
  KitchenOfferingInteraction,
  KitchenOfferingInteractionChanges,
} from '../../../models/offering.model'
import { newKitchenOfferingInteraction } from '../../../utils/offering-interaction'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import { offeringSetupSummary } from '../../../utils/offering-setup-summary'
const {
  offerings,
  captureIntent,
  ownerScope,
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
} = useKitchenOfferings()
const offeringId = useRouteParam('offering')
const offering = computed(() =>
  offerings.value.find((row) => row.id === offeringId.value)
)
const setup = computed(() =>
  offering.value
    ? offeringSetupSummary(offering.value, menus.value, menusOutcome.value)
    : null
)
const interactionType = ref<KitchenOfferingInteraction['type']>('collection')
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
let interactionInitialized = false
watch(
  [ownerScope, offeringId],
  () => {
    interactionInitialized = false
    interactionType.value = 'collection'
  },
  { immediate: true, flush: 'sync' }
)
watch(
  offering,
  (current) => {
    if (!current || interactionInitialized) return
    interactionType.value =
      primaryOptions.find(
        (option) =>
          option.type !== 'browse' &&
          current.interactions.some(
            (row) => row.type === option.type && row.enabled
          )
      )?.type || 'collection'
    interactionInitialized = true
  },
  { immediate: true, flush: 'sync' }
)
const interaction = computed<KitchenOfferingInteraction>(
  () =>
    offering.value?.interactions.find(
      (row) => row.type === interactionType.value
    ) || {
      ...newKitchenOfferingInteraction(interactionType.value),
      enabled: false,
    }
)
const busy = ref(false),
  error = ref('')
const captureSurface = useCommandScope([
  offeringId,
  ownerScope,
  interactionType,
])
watch(
  [offeringId, ownerScope, interactionType],
  () => {
    error.value = ''
    busy.value = false
  },
  { flush: 'sync' }
)
function interactionState(type: KitchenOfferingInteraction['type']) {
  const row = offering.value?.interactions.find((row) => row.type === type)
  return !row?.enabled
    ? 'Off'
    : row.type !== 'browse' && row.availability?.paused
      ? 'Paused'
      : 'Enabled'
}
const captureOfferingIntent = () => {
  const local = captureSurface()
  const owner = captureIntent()
  return () => local() && owner()
}
async function run(
  command: (isCurrent: () => boolean) => Promise<unknown>,
  isSurfaceCurrent: () => boolean = () => true
) {
  if (busy.value || !canWrite.value || !offering.value || !isSurfaceCurrent())
    throw new Error('This service cannot be edited right now.')
  const local = captureSurface()
  const owner = captureIntent()
  const isCurrent = () => local() && owner() && isSurfaceCurrent()
  busy.value = true
  error.value = ''
  try {
    await command(isCurrent)
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : 'Please try again.'
    throw cause
  } finally {
    if (local()) busy.value = false
  }
}
const updateOffering = (
  changes: KitchenOfferingChanges,
  isSurfaceCurrent?: () => boolean
) => {
  const id = offeringId.value
  return run((isCurrent) => update(id, changes, isCurrent), isSurfaceCurrent)
}
const updateCollectionTiming = (value: string, current?: () => boolean) =>
  updateOffering(
    { collection_timing: value as 'same_day' | 'next_day' },
    current
  )
const updateName = (name: string, isSurfaceCurrent?: () => boolean) =>
  updateOffering({ name }, isSurfaceCurrent)
const updateEnabled = (enabled: boolean, isSurfaceCurrent?: () => boolean) =>
  updateOffering({ enabled }, isSurfaceCurrent)
const saveInteraction = (
  changes: KitchenOfferingInteractionChanges,
  isSurfaceCurrent?: () => boolean
) => {
  const id = offeringId.value
  const type = interactionType.value
  return run(
    (isCurrent) => updateInteraction(id, type, changes, isCurrent),
    isSurfaceCurrent
  )
}
</script>
