<template>
  <UDashboardPanel id="console-kitchen-dishes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dishes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen dishes."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <ConsoleKitchenChildLayout
          v-else
          description="Selected kitchen and dish collection in scope."
          item-label="Dishes"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading dishes"
          pending-description="Fetching dishes for the selected kitchen."
        >
          <OrganismsDishCollectionManager
            :collection="dishes"
            title="Dishes"
            description="Browse dishes for the selected kitchen."
            :link="false"
          />
        </ConsoleKitchenChildLayout>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleChildFocus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleChildFocus'
import { useKitchenDishCollection } from '../../../composables/fireux/firestore/runtime-kitchen/dish/fetch/useKitchenDishCollection'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-cooking-pot',
    position: 'top',
    requiresSelection: true,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { dishes, pending } = useKitchenDishCollection(kitchenId)
const countLabel = computed(() => String(dishes.value.length))
</script>
