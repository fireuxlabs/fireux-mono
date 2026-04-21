<template>
  <UDashboardPanel id="console-kitchen-mise">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Mise" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen mise."
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
          description="Selected kitchen and mise collection in scope."
          item-label="Mise Tasks"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading mise tasks"
          pending-description="Fetching mise tasks for the selected kitchen."
        >
          <OrganismsMiseCollectionManager
            :collection="miseTasks"
            title="Mise Tasks"
            description="Browse mise tasks for the selected kitchen."
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
import { useKitchenMiseCollection } from '../../../composables/fireux/firestore/runtime-kitchen/mise/fetch/useKitchenMiseCollection'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-mise',
    label: 'Mise',
    icon: 'i-lucide-list-todo',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { miseTasks, pending } = useKitchenMiseCollection(kitchenId)
const countLabel = computed(() => String(miseTasks.value.length))
</script>
