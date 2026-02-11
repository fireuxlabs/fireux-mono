<template>
  <UDashboardPanel id="dashboard-kitchen-dishes">
    <template #header>
      <LayoutsDashboardNavbar title="Dishes" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Lumen Burger Board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Dish lineup for the Lumen kitchen.
              </p>
            </div>
          </template>
        </UCard>

        <DishCollectionManager
          v-if="dishes.length"
          :collection="dishes"
          title="Dishes"
          description=""
        />
        <p v-else class="text-sm text-dimmed">No dishes yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import DishCollectionManager from '../../../components/organisms/Dish/Collection/Manager.vue'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))
const dishes = ref([...dummyKitchenScenario.menuStack.dishes])
</script>
