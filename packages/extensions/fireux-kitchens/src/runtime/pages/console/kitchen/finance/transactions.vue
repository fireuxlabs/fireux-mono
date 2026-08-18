<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-finance-transactions">
      <template #header>
        <LayoutsConsoleNavbar title="Finance Transactions" />
      </template>

      <template #body>
        <ConsoleKitchenOperationsFinanceNav />
        <ConsoleKitchenOverviewFinance :from-date="fromDate" :to-date="toDate" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  findKitchenConsoleDemoScenario,
  useKitchenConsoleDemoData,
} from '../../../../kitchen/composables/console/core/useKitchenConsoleDemoData'
import { useKitchenConsole } from '../../../../kitchen/composables/console/core/useKitchenConsole'

const { selection } = useKitchenConsole()
const isDemo = computed(() => selection.kitchenSource.value === 'demo')
const demoData = useKitchenConsoleDemoData(isDemo)
const simulationDate = computed(() =>
  findKitchenConsoleDemoScenario(demoData.data.value, selection.kitchenId.value)?.finance?.asOfDate
)
const toDate = computed(() => simulationDate.value || new Date().toISOString().slice(0, 10))
const fromDate = computed(() => {
  const date = new Date(`${toDate.value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 29)
  return date.toISOString().slice(0, 10)
})

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true, desktop: false, mobile: false, layouts: ['console'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
