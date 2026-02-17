<template>
  <UDashboardPanel id="dashboard-kitchen-suppliers">
    <template #header>
      <LayoutsDashboardNavbar title="Suppliers" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Suppliers:
          <span class="font-medium">{{ suppliers.length }}</span>
          <span class="mx-2">·</span>
          Supplier Ingredients: <span class="font-medium">{{ supplierIngredients.length }}</span>
        </div>

        <KitchenSupplierCollectionManager
          :collection="suppliers"
          title="Kitchen suppliers"
          :description="`Suppliers linked to this kitchen (${mode}).`"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import KitchenSupplierCollectionManager from '../../../components/organisms/Supplier/Collection/Manager.vue'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-store',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const suppliers = computed(() => runtime.data.value.suppliers ?? [])
const supplierIngredients = computed(() => runtime.data.value.supplierIngredients ?? [])
</script>
