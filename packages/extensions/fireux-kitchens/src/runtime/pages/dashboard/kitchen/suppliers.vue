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

        <UCard v-if="suppliers.length">
          <div class="space-y-2">
            <div
              v-for="supplier in suppliers"
              :key="supplier.id || supplier.name"
              class="rounded border border-default p-3"
            >
              <div class="font-medium">{{ supplier.name || supplier.id || 'Untitled supplier' }}</div>
              <div class="text-xs text-dimmed">
                {{ supplier.contactLabel || 'No contact details' }}
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No suppliers loaded"
          description="No supplier data yet for this kitchen context."
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'

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
const suppliers = computed(() =>
  (runtime.data.value.suppliers ?? []).map((supplier: any) => {
    const contactEmail = String(supplier?.contact?.email || supplier?.email || '').trim()
    const contactPhone = String(supplier?.contact?.phone || supplier?.phone || '').trim()
    return {
      ...supplier,
      contactLabel: [contactEmail, contactPhone].filter(Boolean).join(' · '),
    }
  })
)
const supplierIngredients = computed(() => runtime.data.value.supplierIngredients ?? [])
</script>
