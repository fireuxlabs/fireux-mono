<template>
  <section class="space-y-4" aria-labelledby="serving-hours-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="serving-hours-title">Service hours</h2>
      <UButton
        to="/workspace/kitchen/food-and-drink/services"
        label="Manage services"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </header>
    <p v-if="!offerings.length">
      Enable and configure your services in Services.
    </p>
    <div v-else class="grid gap-4 md:grid-cols-2">
      <UCard v-for="offering in offerings" :key="offering.id">
        <template #header>
          <div class="card__header">
            <div class="fx-card__chips">
              <h3>{{ offering.name }}</h3>
              <UBadge
                :color="offering.enabled ? 'success' : 'neutral'"
                variant="subtle"
                >{{ offering.enabled ? 'Enabled' : 'Off' }}</UBadge
              >
            </div>
            <UButton
              :to="'/workspace/kitchen/food-and-drink/services'"
              :aria-label="'Edit ' + offering.name + ' serving hours'"
              label="Edit"
              color="neutral"
              variant="ghost"
            />
          </div>
        </template>
        <PlaceOpeningHoursWeek
          v-if="offering.hours?.windows.length"
          :hours="offering.hours"
          compact
        />
        <p v-else>No serving hours set.</p>
        <p
          v-if="menusOutcome === 'pending' || menusOutcome === 'idle'"
          role="status"
          class="mt-3"
        >
          Loading linked Menus…
        </p>
        <p v-else-if="menusOutcome === 'error'" class="mt-3">
          Linked Menus could not be loaded.
        </p>
        <KitchenFoodAndDrinkServicesSetupMenuWindows
          v-else-if="offering.menu_ids.length"
          class="mt-3"
          :menus="linkedMenus(offering)"
          :service-hours="offering.hours"
        />
        <p v-else class="mt-3">No linked Menus</p>
      </UCard>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { KitchenOffering } from '../../models/offering.model'
import type { Menu } from '../../../menu/models/menu.model'
const props = defineProps<{
  offerings: KitchenOffering[]
  menus: Menu[]
  menusOutcome: string
}>()
const linkedMenus = (offering: KitchenOffering) =>
  props.menus.filter((menu) => offering.menu_ids.includes(menu.id))
</script>
