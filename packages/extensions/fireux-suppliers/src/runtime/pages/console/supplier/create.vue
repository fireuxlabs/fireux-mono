<template>
  <UDashboardPanel id="console-supplier-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Supplier" />
    </template>

    <template #body>
      <section class="space-y-4">
        <SupplierCreateSystem
          v-if="canCreate"
          mode="console"
          return-to="/console/supplier"
          cancel-to="/console/supplier"
        />

        <UPageCard
          v-else
          title="Supplier creation is not enabled here"
          description="This app uses existing Supplier console targets."
          variant="subtle"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const { canCreateTarget } = useConsole('supplier')
const canCreate = computed(() => canCreateTarget())

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
