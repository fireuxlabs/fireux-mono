<template>
  <section class="workspace-surface">
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
    <div v-else-if="selectedKitchen">
      <WorkspaceKitchenOfferingsTitle
        :key="kitchenId"
        :kitchen-id="kitchenId"
        :title="selectedKitchen.services?.title || 'Food & drinks'"
        :disabled="!canWrite"
      />
      <WorkspaceKitchenOfferingsService
        v-for="entry in entries"
        :key="ownerScope + ':' + entry.option.key"
        :option="entry.option"
        :offerings="entry.offerings"
        :kitchen-id="kitchenId"
        :menus="menus"
        :menus-outcome="menusOutcome"
        :timezone="timezone"
        :kitchen-hours="kitchenHours"
        :disabled="!canWrite"
        :save="configure"
        :capture-intent="captureIntent"
      />
    </div>
    <UAlert v-else title="Choose a Kitchen to configure services" />
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
import { computed, watchEffect, onScopeDispose } from 'vue'
import WorkspaceKitchenOfferingsTitle from './Title.vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { serviceOverviewSnapshot } from '../../../utils/service-overview'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import {
  kitchenOfferingOptions,
  offeringsForOption,
} from '../../../utils/offering-options'
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
  kitchenHours,
  configure,
} = useKitchenOfferings()
const entries = computed(() =>
  kitchenOfferingOptions.map((option) => ({
    option,
    offerings: offeringsForOption(offerings.value, option),
  }))
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
</script>
