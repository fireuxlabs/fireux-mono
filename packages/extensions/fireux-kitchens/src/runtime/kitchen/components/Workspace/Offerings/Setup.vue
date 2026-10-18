<template>
  <div class="space-y-3">
    <div class="flex items-start justify-between gap-4">
      <slot name="heading" />
      <div class="flex shrink-0 items-center gap-2 pt-0.5">
        <USwitch
          :model-value="enabled"
          :label="enabled ? 'On' : 'Off'"
          :aria-label="option.label + ' availability'"
          :disabled="disabled || busy"
          @update:model-value="setEnabled"
        />
        <span
          v-if="enabled && !readiness.canEnable"
          class="text-xs text-warning"
        >Needs menus</span>
        <span v-if="busy" class="text-xs text-muted" role="status">
          Updating…
        </span>
      </div>
    </div>
    <UAlert
      v-if="error"
      color="error"
      :title="option.label + ' could not be updated'"
      :description="error"
    >
      <template #actions><MoleculesCopyError :message="error" /></template>
    </UAlert>
    <div v-if="enabled" class="service-config space-y-4">
      <div class="service-fields">
        <WorkspaceKitchenOfferingsSetupMenus
          v-if="option.key !== 'counter'"
          :menu-ids="menuIds"
          :menus="menus"
          :outcome="menusOutcome"
          :disabled="disabled || busy"
          @update="setMenus"
        />
        <WorkspaceKitchenOfferingsSetupServiceHours
          :same-as-kitchen="sameAsKitchen"
          :value="hours"
          :timezone="timezone"
          :label="
            option.key === 'collection'
              ? 'Collection hours'
              : option.key === 'delivery'
                ? 'Delivery hours'
                : 'Serving hours'
          "
          :disabled="disabled || busy"
          @update="setHours"
          @inherit="setSameAsKitchen"
        />
      </div>
      <p
        v-if="!sameAsKitchen && !hours?.windows.length"
        class="text-sm text-muted"
      >
        Add serving hours or use Kitchen service hours.
      </p>
      <div
        v-if="['pre_order', 'counter'].includes(option.key)"
        :class="option.key === 'counter' ? 'grid gap-4 sm:grid-cols-2' : ''"
      >
        <WorkspaceKitchenOfferingsSetupInteraction
          v-for="config in interactions"
          :key="config.type"
          :label="
            option.key === 'counter'
              ? kitchenOrderTypeLabel(config.type)
              : option.label
          "
          :config="config"
          :mode-menus="option.key === 'counter'"
          :disabled="disabled || busy"
          :menus="menus"
          :menus-outcome="menusOutcome"
          :update-function="
            (changes) => updateInteraction(config.type, changes)
          "
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../../../menu/models/menu.model'
import type { KitchenOffering } from '../../../models/offering.model'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
import { useServiceSetup } from '../../../composables/offerings/useServiceSetup'
import { serviceMenuReadiness } from '../../../utils/service-menus'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
const props = defineProps<{
  option: KitchenOfferingOption
  kitchenId: string
  offering?: KitchenOffering
  menus: Menu[]
  menusOutcome: ReadOutcome
  timezone: string
  disabled?: boolean
  captureIntent?: () => () => boolean
  save: (
    input: Record<string, unknown>,
    current?: () => boolean
  ) => Promise<unknown>
}>()
const {
  enabled,
  menuIds,
  hours,
  sameAsKitchen,
  setSameAsKitchen,
  timezone,
  busy,
  error,
  interactions,
  setEnabled,
  setMenus,
  setHours,
  updateInteraction,
} = useServiceSetup(props)
const readiness = computed(() =>
  serviceMenuReadiness(menuIds.value, props.menus)
)
</script>

<style scoped>
.service-config {
  padding: 0.875rem 1rem;
  background: var(--ui-bg-elevated);
  border-radius: 0.5rem;
}
.service-fields {
  display: grid;
  align-items: start;
  gap: 1rem;
}
@media (min-width: 768px) {
  .service-fields {
    grid-template-columns: minmax(0, 1fr) 17rem;
  }
}
</style>
