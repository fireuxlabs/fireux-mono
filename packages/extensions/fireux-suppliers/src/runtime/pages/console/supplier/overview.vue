<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activeSupplierPill"
          color="primary"
          variant="soft"
          :title="activeSupplierPill.title"
          :description="activeSupplierPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo supplier"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo suppliers"
        />

        <div v-if="showSelector" class="space-y-2">
          <SupplierCardsPill
            v-for="item in scenarioPills"
            :key="item.id"
            v-bind="item"
            :link="false"
            :action="true"
            :show-badges="false"
            class="cursor-pointer"
            @action="selectScenario(item.id)"
          />
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-truck',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  scenarios,
  scenarioPills,
  activeSupplierPill,
  showSelector,
  setActiveScenario,
} = useRuntimeSupplierConsole()

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    const scenarioId = String(scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActiveScenario(scenarioId)
  })
}

const selectScenario = (supplierId: string) => {
  setActiveScenario(supplierId)
}
</script>
