<template>
  <UDashboardPanel id="dashboard-kitchen-menu-qrs">
    <template #header>
      <LayoutsDashboardNavbar title="Menu QR Codes" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          Kitchen:
          <span class="font-medium">
            {{ kitchenName || kitchenId || 'Not selected' }}
          </span>
        </div>

        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a runtime kitchen before generating QR codes."
        />

        <div
          v-else
          class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="qr in qrList"
            :key="qr.label"
            class="rounded border border-default p-6 text-center space-y-4"
          >
            <div class="text-sm font-semibold">
              {{ qr.label }}
            </div>

            <!-- Prototype black QR square -->
            <div class="mx-auto h-40 w-40 rounded bg-black" />

            <div class="text-xs font-mono break-all text-dimmed">
              {{ qr.url }}
            </div>
          </div>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeKitchen } from '../../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-menu-qrs',
    label: 'QR Codes',
    icon: 'i-lucide-qr-code',
    order: 21,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()

const kitchenId = computed(() =>
  String(runtime.id.value || '').trim()
)

const kitchenName = computed(() =>
  String(runtime.name?.value || '').trim()
)

const baseMenuUrl = computed(() => {
  if (!kitchenId.value) return ''
  return `/kitchens/${encodeURIComponent(kitchenId.value)}/menu`
})

const withQuery = (base: string, query: Record<string, string>) => {
  const url = new URL(base, 'http://localhost')
  Object.entries(query).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v)
  })
  return `${url.pathname}${url.search}`
}

const qrList = computed(() => {
  if (!baseMenuUrl.value) return []

  return [
    {
      label: 'Dine-in',
      url: withQuery(baseMenuUrl.value, { mode: 'dine_in' }),
    },
    {
      label: 'Table 1',
      url: withQuery(baseMenuUrl.value, { mode: 'dine_in', table: '1' }),
    },
    {
      label: 'Collection',
      url: withQuery(baseMenuUrl.value, { mode: 'collection' }),
    },
    {
      label: 'Delivery',
      url: withQuery(baseMenuUrl.value, { mode: 'delivery' }),
    },
  ]
})
</script>
