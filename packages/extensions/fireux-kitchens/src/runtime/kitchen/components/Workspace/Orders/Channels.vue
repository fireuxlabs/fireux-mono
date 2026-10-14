<template>
  <section class="workspace-surface">
    <UPageHeader
      title="Channels"
      description="Configure ordering entrances, menus and serving hours."
    />
    <UButton
      to="/workspace/kitchen/settings/integrations"
      label="Set up ordering"
      icon="i-lucide-list-checks"
      color="neutral"
      variant="outline"
    />
    <MoleculesStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Kitchen offerings"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen offerings"
      state="error"
    />
    <template v-else-if="selectedKitchen">
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
              <h2 class="text-lg font-semibold">{{ entry.option.key === 'table_service' ? 'POS' : entry.option.key === 'qr_tables' ? 'Table ordering' : entry.option.label }}</h2>
            </div>
            <USwitch
              v-if="entry.offerings.length < 2 || !entry.enabled"
              :model-value="entry.enabled"
              :aria-label="entry.option.label + ' availability'"
              :disabled="!canWrite"
              @update:model-value="(value) => openSetup(entry.option, value)"
            />
            <UBadge
              v-else
              :color="entry.enabled ? 'success' : 'neutral'"
              variant="subtle"
              >{{ entry.enabled ? 'On' : 'Off' }}</UBadge
            >
          </div>
          <p class="mt-3 text-sm text-muted">{{ entry.option.description }}</p>
          <template v-if="entry.enabled">
            <p
              v-if="entry.offerings.length > 1"
              class="mt-4 text-sm font-medium"
            >
              {{ entry.offerings.filter(row => offeringOptionEnabled(row, entry.option)).length }} serving schedules
            </p>
            <div
              v-for="offering in entry.offerings.filter(row => offeringOptionEnabled(row, entry.option))"
              :key="offering.id"
              class="mt-3 border-t border-default pt-3 text-sm"
            >
              <div class="flex flex-wrap items-center gap-2">
<span class="text-muted">{{ menuNames(offering) }}</span>
              </div>
              <p class="mt-1 whitespace-pre-line text-muted">
                {{
                  formatWeekdayTimeText(offering.hours) ||
                  'Serving hours needed'
                }}
              </p>
            </div>
            <UButton
              label="Configure"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              class="mt-5"
              :disabled="!canWrite"
              @click="openSetup(entry.option)"
            />
          </template>
          <WorkspaceKitchenFulfilment v-if="entry.option.key === 'delivery'" section="delivery" class="mt-5" />
        </UCard>
      </div>
    </template>
    <UAlert v-else title="Choose a Kitchen to configure channels" />
    <UModal
      v-model:open="setupOpen"
      :title="selectedOption?.label || 'Offering'"
      :description="
        selectedOption?.types.some((type) => type === 'dine_in')
          ? 'Configure this offering below. Table-count changes are saved separately and shared by all dine-in offerings.'
          : 'Choose menus, serving hours and ordering settings. Changes apply together when you save.'
      "
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <template v-if="selectedOption">
          <UFormField
            v-if="optionOfferings.length > 1"
            label="Serving schedule"
            class="mb-5"
            ><USelect
              v-model="selectedOfferingId"
              @update:model-value="requestedEnabled = undefined"
              :items="
                optionOfferings.map((offering) => ({
                  value: offering.id,
                  label: offering.name,
                }))
              "
              class="w-full"
          /></UFormField>
          <MoleculesDisclosurePanel
            v-if="selectedOption.types.some((type) => type === 'dine_in')"
            title="Dine-in tables"
            description="Configure the table numbers used by staff and QR ordering."
            :default-open="false"
          >
            <WorkspaceKitchenTablesWrite :key="kitchenId" />
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
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import {
  kitchenOfferingOptions,
  offeringsForOption,
  offeringOptionEnabled,
  type KitchenOfferingOption,
} from '../../../utils/offering-options'
import { formatWeekdayTimeText } from '../../../../utils/weekday-time'
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
  kitchenOfferingOptions.map((option) => ({
    option,
    offerings: offeringsForOption(offerings.value, option),
    enabled: offeringsForOption(offerings.value, option).some((offering) =>
      offeringOptionEnabled(offering, option)
    ),
  }))
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
function openSetup(option: KitchenOfferingOption, enabled?: boolean) {
  selectedOption.value = option
  const matching = offeringsForOption(offerings.value, option)
  selectedOfferingId.value =
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
