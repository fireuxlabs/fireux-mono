<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
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
  consoleSurface: 'create',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'console-supplier-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
