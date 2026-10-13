<template>
  <MoleculesStateCard
    v-if="outcome === 'pending'"
    entity="Kitchen offerings"
    loading
  />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    entity="Kitchen offerings"
    state="error"
  />
  <section
    v-else-if="selectedKitchen && ['ready', 'empty'].includes(outcome)"
    class="space-y-4"
  >
    <h2 class="font-semibold">Offering availability</h2>
    <UCard v-if="!offerings.length">
      <p class="text-sm text-muted">No saved offerings.</p>
      <UButton
        to="/workspace/kitchen/offerings"
        label="Set up offerings"
        color="neutral"
        variant="soft"
        class="mt-3"
      />
    </UCard>
    <UCard v-for="offering in offerings" :key="ownerScope + ':' + offering.id">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-semibold">{{ offering.name }}</h3>
          <UButton
            :to="'/workspace/kitchen/offerings/' + offering.id"
            label="Configure"
            icon="i-lucide-settings-2"
            color="neutral"
            variant="soft"
          />
        </div>
      </template>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-4">
          <MoleculesFormsEditableCheckbox
            label="Offering"
            checkbox-label="Enable this offering"
            true-label="Enabled"
            false-label="Off"
            :value="offering.enabled"
            :disabled="!canWrite || (!offering.enabled && !canEnable(offering))"
            :disabled-message="
              !offering.enabled && !canEnable(offering)
                ? 'Choose menus and serving hours in Configure first.'
                : ''
            "
            :capture-intent="() => captureOfferingIntent(offering.id)"
            :update="
              (enabled, current) => update(offering.id, { enabled }, current)
            "
          />
          <div>
            <p class="text-sm font-medium">Serving hours</p>
            <p class="mt-1 whitespace-pre-line text-sm text-muted">
              {{
                formatWeekdayTimeText(offering.hours) ||
                'Serving hours not configured'
              }}
            </p>
            <p v-if="offering.hours?.timezone" class="mt-1 text-xs text-muted">
              {{ offering.hours.timezone }}
            </p>
          </div>
        </div>
        <div class="space-y-4">
          <MoleculesFormsEditableCheckbox
            v-for="interaction in orderingInteractions(offering)"
            :key="interaction.type"
            :label="kitchenOrderTypeLabel(interaction.type) + ' orders'"
            checkbox-label="Pause new orders"
            true-label="Paused"
            false-label="Not paused"
            :value="interaction.availability?.paused === true"
            :disabled="!canWrite || !offering.enabled"
            :capture-intent="() => captureOfferingIntent(offering.id)"
            :update="
              (paused, current) =>
                updateInteraction(
                  offering.id,
                  interaction.type,
                  { availability: { paused } },
                  current
                )
            "
          />
          <p
            v-if="!orderingInteractions(offering).length"
            class="text-sm text-muted"
          >
            No ordering options enabled.
          </p>
          <p v-else-if="!offering.enabled" class="text-sm text-muted">
            Enable the offering to manage new orders.
          </p>
        </div>
      </div>
    </UCard>
  </section>
</template>
<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import type {
  KitchenOffering,
  KitchenOfferingInteraction,
} from '../../../models/offering.model'
import { offeringSetupSummary } from '../../../utils/offering-setup-summary'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import { formatWeekdayTimeText } from '../../../../utils/weekday-time'

const {
  selectedKitchen,
  outcome,
  offerings,
  ownerScope,
  canWrite,
  captureIntent,
  menus,
  menusOutcome,
  update,
  updateInteraction,
} = useKitchenOfferings()

const captureRecords = useCommandScope([
  outcome,
  canWrite,
  () =>
    offerings.value
      .map((offering) => offering.id)
      .sort()
      .join('|'),
])

const canEnable = (offering: KitchenOffering) =>
  offeringSetupSummary(offering, menus.value, menusOutcome.value).canEnable

const orderingInteractions = (offering: KitchenOffering) =>
  offering.interactions.filter(
    (
      interaction
    ): interaction is Exclude<KitchenOfferingInteraction, { type: 'browse' }> =>
      interaction.type !== 'browse' && interaction.enabled
  )

function captureOfferingIntent(id: string) {
  const ownerCurrent = captureIntent()
  const recordsCurrent = captureRecords()
  return () =>
    ownerCurrent() &&
    recordsCurrent() &&
    canWrite.value &&
    offerings.value.some((offering) => offering.id === id)
}
</script>
