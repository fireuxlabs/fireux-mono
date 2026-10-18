<template>
  <section class="workspace-surface">
    <p class="text-muted">
      Enable the services you offer, then choose their menus and serving times.
    </p>
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
    <template v-else-if="selectedKitchen">
      <section class="space-y-4">
        <div>
          <h2 class="text-xl font-semibold">Services</h2>
          <p class="text-sm text-muted">
            Table service uses staff; QR table ordering and Kiosk let customers
            order themselves. Pre-order is for advance meal requests.
          </p>
        </div>
        <div class="grid items-start gap-4 lg:grid-cols-2">
          <UCard v-for="entry in entries" :key="entry.option.key">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <UIcon
                  :name="entry.option.icon"
                  class="size-6 shrink-0"
                  :class="entry.enabled ? 'text-primary' : 'text-muted'"
                  aria-hidden="true"
                />
                <h2 class="text-lg font-semibold">
                  {{ entry.option.label }}
                </h2>
              </div>
              <UBadge
                :color="entry.status === 'Enabled' ? 'success' : 'neutral'"
                variant="subtle"
                >{{ entry.status }}</UBadge
              >
            </div>
            <p class="mt-3 text-sm text-muted">
              {{ entry.option.description }}
            </p>
            <div
              v-if="entry.offerings.length"
              class="mt-3 divide-y divide-default"
            >
              <WorkspaceKitchenOfferingsRow
                v-for="offering in entry.offerings"
                :key="offering.id"
                :offering="offering"
                :option="entry.option"
                :menus-label="menuNames(offering)"
                :disabled="!canWrite"
                @configure="
                  openSetup(
                    entry.option,
                    offeringOptionEnabled(offering, entry.option)
                      ? undefined
                      : true,
                    offering.id
                  )
                "
              />
            </div>
            <UButton
              v-else
              label="Enable & set up"
              :aria-label="
                'Enable and set up ' + entry.option.label.toLowerCase()
              "
              color="neutral"
              variant="soft"
              class="mt-4"
              :disabled="!canWrite"
              @click="openSetup(entry.option)"
            />
            <WorkspaceKitchenOrdersDelivery
              v-if="entry.option.key === 'delivery'"
              class="mt-5"
            />
          </UCard>
        </div>
      </section>
    </template>
    <UAlert v-else title="Choose a Kitchen to configure services" />
    <UModal
      v-model:open="setupOpen"
      :title="selectedOffering?.name || selectedOption?.label || 'Service'"
      :description="
        selectedOption?.types.some((type) => type === 'dine_in')
          ? 'Configure this service below. Table-count changes are saved separately and shared by Table service and QR table ordering.'
          : 'Choose menus, serving hours and ordering settings. Changes apply together when you save.'
      "
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <template v-if="selectedOption">
          <MoleculesDisclosurePanel
            v-if="selectedOption.types.some((type) => type === 'dine_in')"
            title="Tables"
            description="Configure the table numbers used by staff and QR ordering."
            :default-open="false"
          >
            <WorkspaceKitchenTablesEdit :key="kitchenId" />
          </MoleculesDisclosurePanel>
          <WorkspaceKitchenOfferingsSetup
            :key="
              kitchenId + ':' + selectedOption.key + ':' + selectedOfferingId
            "
            :option="selectedOption"
            :kitchen-id="kitchenId"
            :offering="selectedOffering"
            :offering-id="selectedOfferingId || undefined"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :timezone="timezone"
            :requested-enabled="requestedEnabled"
            :disabled="!canWrite"
            :save="configure"
            :active="setupOpen"
            :capture-intent="captureIntent"
            @saved="setupOpen = false"
          />
        </template>
      </template>
    </UModal>
    <DiagnosticsDebugPanel
      title="Kitchen Services"
      scope="workspace"
      object-origin="passed"
      :objects="{ services: snapshot.services }"
      :derived="snapshot.derived"
      include-route
      launcher
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch, watchEffect, onScopeDispose } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { serviceOverviewSnapshot } from '../../../utils/service-overview'
import { serviceOptionStatus } from '../../../utils/offering-options'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import {
  kitchenOfferingOptions,
  offeringsForOption,
  offeringOptionEnabled,
  type KitchenOfferingOption,
} from '../../../utils/offering-options'
import type { KitchenOffering } from '../../../models/offering.model'
const {
  selectedKitchen,
  kitchenId,
  outcome,
  offerings,
  captureIntent,
  ownerScope,
  canWrite,
  menus,
  menusOutcome,
  timezone,
  configure,
} = useKitchenOfferings()
const entries = computed(() =>
  kitchenOfferingOptions.map((option) => {
    const matching = offeringsForOption(offerings.value, option)
    return {
      option,
      offerings: matching,
      enabled: matching.some((row) => offeringOptionEnabled(row, option)),
      status: serviceOptionStatus(matching, option),
    }
  })
)
const page = useWorkspacePageState('kitchen')
const snapshot = computed(() =>
  serviceOverviewSnapshot({
    kitchenId: kitchenId.value,
    outcome: outcome.value,
    menusOutcome: menusOutcome.value,
    canWrite: canWrite.value,
    offerings: offerings.value,
    menus: menus.value,
  })
)
watchEffect(() => page.publish(snapshot.value))
onScopeDispose(() =>
  page.publish({ derived: { outcome: 'idle' }, services: [] })
)
const setupOpen = ref(false)
const selectedOption = ref<KitchenOfferingOption>()
const selectedOfferingId = ref('')
const requestedEnabled = ref<boolean>()
const optionOfferings = computed(() =>
  selectedOption.value
    ? offeringsForOption(offerings.value, selectedOption.value)
    : []
)
const selectedOffering = computed(() =>
  optionOfferings.value.find(
    (offering) => offering.id === selectedOfferingId.value
  )
)
function openSetup(
  option: KitchenOfferingOption,
  enabled?: boolean,
  offeringId?: string
) {
  selectedOption.value = option
  const matching = offeringsForOption(offerings.value, option)
  if (offeringId && !matching.some((row) => row.id === offeringId)) return
  selectedOfferingId.value =
    offeringId ||
    matching.find((offering) => offeringOptionEnabled(offering, option))?.id ||
    matching[0]?.id ||
    ''
  requestedEnabled.value = enabled ?? (matching.length ? undefined : true)
  setupOpen.value = true
}
watch(
  ownerScope,
  () => {
    setupOpen.value = false
    selectedOfferingId.value = ''
    selectedOption.value = undefined
    requestedEnabled.value = undefined
  },
  { flush: 'sync' }
)
function menuNames(offering: KitchenOffering) {
  if (menusOutcome.value === 'error') return 'Menus unavailable'
  if (!['ready', 'empty'].includes(menusOutcome.value)) return 'Loading menus…'
  return (
    menus.value
      .filter((menu) => offering.menu_ids.includes(menu.id))
      .map((menu) => menu.name)
      .join(', ') || 'Choose menus'
  )
}
</script>
