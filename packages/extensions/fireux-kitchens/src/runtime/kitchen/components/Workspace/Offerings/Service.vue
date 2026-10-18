<template>
  <section class="service-section border-b border-default last:border-b-0">
    <WorkspaceKitchenOfferingsSetup
      :key="offerings[0]?.id || 'new'"
      :option="option"
      :kitchen-id="kitchenId"
      :offering="offerings[0]"
      :menus="menus"
      :menus-outcome="menusOutcome"
      :timezone="timezone"
      :kitchen-hours="kitchenHours"
      :disabled="disabled"
      :save="save"
      :capture-intent="captureIntent"
    >
      <template #heading>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon :name="option.icon" class="size-5 shrink-0 text-primary" aria-hidden="true" />
            <h2 class="font-semibold">{{ option.label }}</h2>
          </div>
        </div>
      </template>
    </WorkspaceKitchenOfferingsSetup>
  </section>
</template>
<script setup lang="ts">
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../../../menu/models/menu.model'
import type { KitchenOffering } from '../../../models/offering.model'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
defineProps<{
  option: KitchenOfferingOption
  offerings: KitchenOffering[]
  kitchenId: string
  menus: Menu[]
  menusOutcome: ReadOutcome
  timezone: string
  kitchenHours?: WeekdayTimeWindowsConfig
  disabled: boolean
  captureIntent?: () => () => boolean
  save: (
    input: Record<string, unknown>,
    isSurfaceCurrent?: () => boolean
  ) => Promise<unknown>
}>()
</script>

<style scoped>
.service-section {
  padding-block: 1rem;
}
</style>
