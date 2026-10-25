<template>
  <section class="space-y-2">
    <h3 v-if="modeMenus" class="font-medium">{{ label }}</h3>
    <KitchenFoodAndDrinkServicesSetupMenus
      v-if="modeMenus"
      :menu-ids="config.menu_ids || []"
      :menus="menus"
      :outcome="menusOutcome"
      :disabled="disabled"
      @update="updateMenus"
    />
    <KitchenFoodAndDrinkServicesTiming
      v-if="config.type === 'pre_order'"
      :config="config"
      :disabled="disabled"
      :update-function="update"
    />
  </section>
</template>
<script setup lang="ts">
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { Menu } from '../../../../../menu/models/menu.model'
import type { KitchenOrderTypeConfig } from '../../../../models/ordering.model'
import type { KitchenOfferingInteractionChanges } from '../../../../models/offering.model'
const props = defineProps<{
  label: string
  config: KitchenOrderTypeConfig & { enabled: boolean }
  modeMenus: boolean
  menus: Menu[]
  menusOutcome: ReadOutcome
  disabled: boolean
  updateFunction: (changes: KitchenOfferingInteractionChanges) => Promise<void>
}>()
function updateMenus(values: unknown[]) {
  return update({
    menu_ids: values.filter((id): id is string => typeof id === 'string'),
  })
}
async function update(changes: KitchenOfferingInteractionChanges) {
  try {
    await props.updateFunction(changes)
  } catch {
    /* The setup owner displays the failure. */
  }
}
</script>
