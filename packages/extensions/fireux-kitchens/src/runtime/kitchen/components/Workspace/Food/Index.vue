<template>
  <div class="grid gap-5">
    <FoodAI :kitchen-id="kitchenId" :ready="ready" :overview="overview" />
    <FoodServices :rows="rows" :pending="pending" :failed="failed" />
  </div>
</template>
<script setup lang="ts">
import { computed, watchEffect, onScopeDispose } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import FoodAI from './AI.vue'
import FoodServices from './Services.vue'
import { useKitchenOfferings } from '../../../composables/offerings/useKitchenOfferings'
import { useKitchenOfferingNow } from '../../../composables/useKitchenOfferingNow'
import { resolveServiceHours } from '../../../utils/service-hours'
import { serviceOverviewSnapshot } from '../../../utils/service-overview'
import { foodServiceSummary } from '../../../utils/food-service-summary'
const {
  kitchenId,
  offerings,
  menus,
  outcome,
  menusOutcome,
  placeOutcome,
  kitchenHours,
  canWrite,
} = useKitchenOfferings()
const { now } = useKitchenOfferingNow()
const failed = computed(() =>
  [outcome.value, menusOutcome.value, placeOutcome.value].includes('error')
)
const pending = computed(
  () =>
    !failed.value &&
    [outcome.value, menusOutcome.value, placeOutcome.value].some((value) =>
      ['idle', 'pending'].includes(value)
    )
)
const ready = computed(() =>
  Boolean(
    kitchenId.value &&
      ['ready', 'empty'].includes(outcome.value) &&
      ['ready', 'empty'].includes(menusOutcome.value) &&
      placeOutcome.value === 'ready'
  )
)
const rows = computed(() =>
  ready.value
    ? foodServiceSummary(
        resolveServiceHours(offerings.value, kitchenHours.value),
        menus.value,
        now.value
      )
    : []
)
const setup = computed(() =>
  serviceOverviewSnapshot({
    kitchenId: kitchenId.value,
    outcome: outcome.value,
    menusOutcome: menusOutcome.value,
    canWrite: canWrite.value,
    offerings: offerings.value,
    menus: menus.value,
  })
)
const overview = computed(() => ({
  subject: 'Food & drink',
  availableActions: [],
  setup: ready.value ? setup.value.services : [],
  services: rows.value,
  menus: ready.value
    ? menus.value.map((menu) => ({
        id: menu.id,
        name: menu.name,
        internal_name: menu.internal_name,
        status: menu.status,
      }))
    : [],
}))
const page = useWorkspacePageState('kitchen')
watchEffect(() =>
  page.publish({
    selected: { kitchenId: kitchenId.value },
    overview: overview.value,
    derived: {
      outcome: failed.value
        ? 'error'
        : pending.value
          ? 'pending'
          : ready.value
            ? 'ready'
            : 'empty',
    },
  })
)
onScopeDispose(() => page.publish({ derived: { outcome: 'idle' } }))
</script>
