<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <slot name="heading" />
      <div class="flex shrink-0 items-center gap-2">
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
          >Needs menus</span
        >
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
        <div v-if="option.key === 'counter'" class="space-y-4">
          <WorkspaceKitchenOfferingsSetupInteraction
            v-for="config in interactions"
            :key="config.type"
            :label="kitchenOrderTypeLabel(config.type)"
            :config="config"
            :mode-menus="true"
            :disabled="disabled || busy"
            :menus="menus"
            :menus-outcome="menusOutcome"
            :update-function="
              (changes) => updateInteraction(config.type, changes)
            "
          />
        </div>
        <WorkspaceKitchenOfferingsSetupServiceHours
          :same-as-kitchen="sameAsKitchen"
          :kitchen-hours="kitchenHours"
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
        >
          <template #menus="{ hours: effectiveHours }">
            <WorkspaceKitchenOfferingsSetupMenuWindows
              :menus="menus.filter((menu) => menuIds.includes(menu.id))"
              :service-hours="effectiveHours"
            />
          </template>
        </WorkspaceKitchenOfferingsSetupServiceHours>
      </div>
      <p
        v-if="!sameAsKitchen && !hours?.windows.length"
        class="text-sm text-muted"
      >
        Add serving hours or use Kitchen service hours.
      </p>
      <div v-if="option.key === 'pre_order'">
        <WorkspaceKitchenOfferingsSetupInteraction
          v-for="config in interactions"
          :key="config.type"
          :label="option.label"
          :config="config"
          :mode-menus="false"
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
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'
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
  kitchenHours?: WeekdayTimeWindowsConfig
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
  padding-block: 0.25rem;
}
.service-fields {
  display: grid;
  align-items: start;
  gap: 1rem;
}
@media (min-width: 768px) {
  .service-fields {
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.8fr);
  }
}
</style>
