<template>
  <section
    v-if="
      menu &&
      menu.schedule !== 'daily' &&
      menu.format !== 'document' &&
      !menu.doc?.url
    "
    class="workspace-surface workspace-surface--compact"
  >
    <h2 class="fx-type-card-heading">Menu availability</h2>
    <p class="fx-type-caption">
      These times apply wherever this Menu is used. Each service can narrow them
      further.
    </p>
    <URadioGroup
      :model-value="custom ? 'custom' : 'service'"
      :items="[
        { value: 'service', label: 'Throughout its services' },
        { value: 'custom', label: 'Specific times' },
      ]"
      :disabled="!canWrite || busy || !timezone"
      @update:model-value="setMode($event === 'custom')"
    />
    <div class="workspace-surface workspace-surface--compact">
      <p class="fx-type-card-heading">Within Kitchen service hours</p>
      <p v-for="line in serviceHoursSummary(kitchenHours)" :key="line">
        {{ line }}
      </p>
      <p v-if="!kitchenHours.windows.length">
        Set venue and Kitchen hours first.
      </p>
    </div>
    <UAlert
      v-if="conflict"
      color="warning"
      title="Menu hours need adjusting"
      description="The Kitchen schedule has changed. This Menu is only available where its times overlap the Kitchen and service windows."
    />
    <KitchenFoodAndDrinkServicesSetupHours
      v-if="custom"
      label="Menu serving hours"
      :value="hours"
      :timezone="timezone"
      :disabled="!canWrite || busy"
      @update="setHours"
    />
    <p v-if="busy" role="status" class="fx-type-caption">Updating…</p>
    <UAlert
      v-if="error"
      color="error"
      title="Menu hours could not be updated"
      :description="error"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuRecordHours } from '../../../../composables/workspace/menus/useMenuRecordHours'
const {
  menu,
  canWrite,
  kitchenHours,
  timezone,
  custom,
  hours,
  busy,
  error,
  conflict,
  setMode,
  setHours,
  serviceHoursSummary,
} = useMenuRecordHours(useKitchenMenuRecordContext())
</script>
