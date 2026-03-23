<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Suppliers</div>
              <div class="text-lg font-semibold">{{ stats.suppliers }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Status</div>
              <div class="text-lg font-semibold">{{ stats.pending ? 'Loading' : 'Ready' }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Actions</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton :to="actions.openWorkspaceTo" variant="soft" icon="i-lucide-layout-dashboard" block>
              Supplier workspace
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
import { navigateTo } from '#imports'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'
import { useSupplier } from '../../../composables/supplier/ops/useSupplier'

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

const { coreSupplier, pending } = useSupplier()
const { stats, actions } = useRuntimeSupplierConsole()

const deadline = Date.now() + 1500
while (pending.value && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

if (!coreSupplier.value) {
  await navigateTo('/console/supplier/create', { replace: true })
}
</script>
