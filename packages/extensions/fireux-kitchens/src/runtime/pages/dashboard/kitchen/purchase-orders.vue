<template>
  <UDashboardPanel id="dashboard-kitchen-orders-out">
    <template #header>
      <LayoutsDashboardNavbar title="Orders Out" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Mode: <span class="font-medium">{{ mode }}</span> · Orders Out:
          <span class="font-medium">{{ purchases.length }}</span>
        </div>

        <UCard v-if="purchases.length">
          <div class="space-y-2">
            <div
              v-for="purchase in purchases"
              :key="purchase.id || purchase.order_number"
              class="rounded border border-default p-3"
            >
              <div class="font-medium">
                {{ purchase.order_number || purchase.name || purchase.id || 'Purchase Order' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ purchase.status || 'draft' }}
                <template v-if="purchase.supplier_name"> · {{ purchase.supplier_name }}</template>
              </div>
            </div>
          </div>
        </UCard>

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No purchase orders loaded"
          description="No outgoing purchase orders yet for this kitchen context."
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
    key: 'dashboard-kitchen-orders-out',
    label: 'Orders Out',
    icon: 'i-lucide-truck',
    order: 13,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const purchases = computed(() => runtime.data.value.purchases ?? [])
</script>
