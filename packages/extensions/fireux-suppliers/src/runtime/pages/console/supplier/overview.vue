<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UCard>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Supplier ID</div>
              <div class="text-lg font-semibold">{{ runtime.id || 'unset' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Root Path</div>
              <div class="text-sm font-mono break-all">{{ runtime.documentCollectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Console Path</div>
              <div class="text-sm font-mono break-all">{{ runtime.collectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Status</div>
              <div class="text-lg font-semibold">{{ stats.pending ? 'Loading' : 'Ready' }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Root supplier</div>
              <div class="text-lg font-semibold">{{ stats.hasRootSupplier ? 'yes' : 'no' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">App console</div>
              <div class="text-lg font-semibold">{{ stats.hasAppConsole ? 'yes' : 'no' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Known suppliers</div>
              <div class="text-lg font-semibold">{{ stats.suppliers }}</div>
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

const { runtime, stats, actions } = useRuntimeSupplierConsole()

const deadline = Date.now() + 1500
while (runtime.pending.value && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 50))
}

if (!runtime.doc.value) {
  await navigateTo('/console/supplier/create', { replace: true })
}
</script>
