<template>
  <UDashboardPanel id="console-kitchen-suppliers">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Suppliers" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="!selectedKitchen"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening kitchen suppliers."
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
          description="Selected kitchen and supplier collection in scope."
          item-label="Suppliers"
          :item-count="countLabel"
          :pending="pending"
          pending-title="Loading suppliers"
          pending-description="Fetching suppliers for the selected kitchen."
        >
          <OrganismsSupplierCollectionManager
            :collection="suppliers"
            title="Suppliers"
            description="Browse suppliers for the selected kitchen."
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
import { useKitchenSupplierFetch } from '../../../composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    position: 'top',
    requiresSelection: true,
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { selectedKitchen, kitchenId } = useKitchenConsoleChildFocus()
const { suppliers, count, pending } = useKitchenSupplierFetch(kitchenId)
const countLabel = computed(() => String(count.value))
</script>
