<template>
  <UDashboardPanel id="console-kitchen-orders-out">
    <template #header>
      <LayoutsConsoleNavbar title="Orders Out" />
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
                <template v-if="purchase.expected_delivery"> · ETA {{ purchase.expected_delivery }}</template>
              </div>
              <div class="mt-1 text-xs text-dimmed">
                {{ purchaseLineSummary(purchase) }}
                <template v-if="purchase.total_minor"> · {{ formatMinor(purchase.total_minor, purchase.currency_code) }}</template>
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
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-orders-out',
    label: 'Orders Out',
    icon: 'i-lucide-truck',
    order: 13,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const mode = runtime.mode
const purchases = computed(() => runtime.data.value.purchases ?? [])

const formatMinor = (value: unknown, currencyCode: unknown) => {
  const minor = Number(value || 0)
  const code = String(currencyCode || 'CHF').trim() || 'CHF'
  if (!Number.isFinite(minor) || minor <= 0) return ''
  return `${code} ${(minor / 100).toFixed(2)}`
}

const purchaseLineSummary = (purchase: Record<string, unknown>) => {
  const lines = Array.isArray(purchase.lines) ? purchase.lines : []
  const qty = lines.reduce((sum, line) => sum + Math.max(0, Number((line as any)?.quantity || 0)), 0)
  if (!lines.length) return 'No lines'
  return `${lines.length} ${lines.length === 1 ? 'line' : 'lines'} · ${qty} units`
}
</script>
