<template>
  <section aria-labelledby="serving-hours-title">
    <header>
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
    <UPageGrid as="div" v-else>
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
        >
          Loading linked Menus…
        </p>
        <p v-else-if="menusOutcome === 'error'">
          Linked Menus could not be loaded.
        </p>
        <KitchenFoodAndDrinkServicesSetupMenuWindows
          v-else-if="offering.menu_ids.length"
          :menus="linkedMenus(offering)"
          :service-hours="offering.hours"
        />
        <p v-else>No linked Menus</p>
      </UCard>
    </UPageGrid>
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
