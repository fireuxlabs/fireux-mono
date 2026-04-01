<template>
  <UDashboardPanel id="console-kitchen-home">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activeKitchenPill"
          color="primary"
          variant="soft"
          :title="activeKitchenPill.title"
          :description="activeKitchenPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo kitchen"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo kitchens"
        />

        <div v-if="showSelector" class="space-y-2">
          <KitchenCardsPill
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
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen',
    label: 'Overview',
    icon: 'i-lucide-chef-hat',
    order: 10,
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
  activeKitchenPill,
  showSelector,
  setActiveScenario,
} = useRuntimeKitchenConsole()

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (scenarios.value.length !== 1) return
    const scenarioId = String((scenarios.value[0]?.kitchen as any)?.id || scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActiveScenario(scenarioId)
  })
}

const selectScenario = (kitchenId: string) => {
  setActiveScenario(kitchenId)
}
</script>
