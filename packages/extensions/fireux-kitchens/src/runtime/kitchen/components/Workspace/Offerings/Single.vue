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
  <section v-else-if="offering && selectedKitchen" class="workspace-surface">
    <UButton
      to="/workspace/kitchen/services"
      label="Services"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="link"
      class="self-start"
    />
    <h2
      v-if="options.length !== 1 || offering.name !== options[0]?.label"
      class="text-xl font-semibold"
    >
      {{ offering.name }}
    </h2>
    <WorkspaceKitchenOfferingsService
      v-for="option in options"
      :key="ownerScope + ':' + offering.id + ':' + option.key"
      :option="option"
      :offerings="[offering]"
      :kitchen-id="kitchenId"
      :menus="menus"
      :menus-outcome="menusOutcome"
      :timezone="timezone"
      :disabled="!canWrite"
      :save="configure"
      :capture-intent="captureIntent"
    />
  </section>
  <UAlert
    v-else
    title="Service not found"
    :actions="[{ label: 'Services', to: '/workspace/kitchen/services' }]"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import {
  kitchenOfferingOptions,
  offeringsForOption,
} from '../../../utils/offering-options'
const {
  offerings,
  captureIntent,
  ownerScope,
  outcome,
  selectedKitchen,
  kitchenId,
  canWrite,
  menus,
  menusOutcome,
  timezone,
  configure,
} = useKitchenOfferings()
const offeringId = useRouteParam('offering')
const offering = computed(() =>
  offerings.value.find((row) => row.id === offeringId.value)
)
const options = computed(() =>
  offering.value
    ? kitchenOfferingOptions.filter(
        (option) => offeringsForOption([offering.value!], option).length
      )
    : []
)
</script>
