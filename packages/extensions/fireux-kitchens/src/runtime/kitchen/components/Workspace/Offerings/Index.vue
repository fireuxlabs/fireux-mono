<template>
  <section class="workspace-surface">
    <p class="text-muted">
      Choose how customers can get food, then set the eligible menus and serving
      times.
    </p>
    <UButton
      label="Add offering"
      icon="i-lucide-plus"
      :disabled="!canWrite"
      @click="createOpen = true"
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
            <p class="mt-3 text-sm text-muted">
              {{ entry.option.description }}
            </p>
            <template v-if="entry.enabled">
              <p
                v-if="entry.offerings.length > 1"
                class="mt-4 text-sm font-medium"
              >
                {{
                  entry.offerings.filter((row) =>
                    offeringOptionEnabled(row, entry.option)
                  ).length
                }}
                serving schedules
              </p>
              <div
                v-for="offering in entry.offerings.filter((row) =>
                  offeringOptionEnabled(row, entry.option)
                )"
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
            <WorkspaceKitchenOrdersDelivery
              v-if="entry.option.key === 'delivery'"
              class="mt-5"
            />
          </UCard>
        </div>
      </section>
    </template>
    <UAlert v-else title="Choose a Kitchen to configure services" />
    <section
      v-if="separateOfferings.length"
      class="divide-y divide-default"
      aria-label="Named offerings"
    >
      <NuxtLink
        v-for="offering in separateOfferings"
        :key="offering.id"
        :to="`/workspace/kitchen/services/${offering.id}`"
        class="flex items-center justify-between gap-3 py-4"
      >
        <span
          ><span class="font-medium">{{ offering.name }}</span
          ><span class="ml-2 text-sm text-muted"
            >{{
              offering.collection_timing === 'next_day'
                ? 'Next-day collection'
                : 'Same-day collection'
            }}
            · {{ offering.enabled ? 'On' : 'Off' }}</span
          ></span
        >
        <UIcon name="i-lucide-chevron-right" />
      </NuxtLink>
    </section>
    <UModal
      v-model:open="createOpen"
      title="Add offering"
      description="Create a separate collection offering with its own menus and hours."
    >
      <template #body
        ><WorkspaceKitchenOfferingsCreate
          v-if="createOpen"
          :kitchen-id="kitchenId"
          :active="createOpen"
          :disabled="!canWrite"
          :menus="menus"
          :menus-outcome="menusOutcome"
          :timezone="timezone"
          :venue-hours="venueHours"
          :capture-intent="captureIntent"
          :save="configure"
          @created="openCreated"
      /></template>
    </UModal>
    <UModal
      v-model:open="setupOpen"
      :title="selectedOption?.label || 'Offering'"
      :description="
        selectedOption?.types.some((type) => type === 'dine_in')
          ? 'Configure this offering below. Table-count changes are saved separately and shared by Table service and QR table ordering.'
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
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
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
  venueHours,
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
const createOpen = ref(false)
const separateOfferings = computed(() =>
  offerings.value.filter((offering) => offering.separate)
)
function openCreated(id: string) {
  createOpen.value = false
  void navigateTo(`/workspace/kitchen/services/${encodeURIComponent(id)}`)
}
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
    createOpen.value = false
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
