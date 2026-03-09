<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">App suppliers</div>
              <div class="text-lg font-semibold">{{ stats.appSuppliers }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Core suppliers</div>
              <div class="text-lg font-semibold">{{ stats.coreSuppliers }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Total suppliers</div>
              <div class="text-lg font-semibold">{{ stats.totalSuppliers }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Actions</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton :to="actions.openProfileTo" variant="soft" icon="i-lucide-user-round" block>
              Supplier profile
            </UButton>
            <UButton :to="actions.browseSuppliersTo" variant="soft" icon="i-lucide-truck" block>
              Browse suppliers
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-overview',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { stats, actions } = useRuntimeSupplierConsole()
</script>
