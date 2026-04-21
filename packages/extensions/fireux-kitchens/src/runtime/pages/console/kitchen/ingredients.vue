<template>
  <UDashboardPanel id="console-kitchen-ingredients">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen ingredients."
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
          description="Selected kitchen and ingredient collection in scope."
          item-label="Ingredients"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading ingredients"
          pending-description="Fetching ingredients for the selected kitchen."
        >
          <OrganismsIngredientCollectionManager
            :collection="ingredients"
            title="Ingredients"
            description="Browse ingredients for the selected kitchen."
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
import { useKitchenIngredientFetch } from '../../../composables/fireux/firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    position: 'top',
    requiresSelection: true,
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { ingredients, count, pending } = useKitchenIngredientFetch(kitchenId)
const countLabel = computed(() => String(count.value))
</script>
