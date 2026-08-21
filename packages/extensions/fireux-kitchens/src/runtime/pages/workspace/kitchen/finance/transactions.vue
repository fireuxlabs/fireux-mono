<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-finance-transactions">
      <template #header>
        <LayoutsWorkspaceNavbar title="Finance Transactions" />
      </template>

      <template #body>
        <WorkspaceKitchenOperationsFinanceNav />
        <WorkspaceKitchenOverviewFinance
          :from-date="fromDate"
          :to-date="toDate"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../../../kitchen/composables/workspace/core/useKitchenWorkspaceDemoData'
import { useKitchenWorkspace } from '../../../../kitchen/composables/workspace/core/useKitchenWorkspace'

const { selection } = useKitchenWorkspace()
const isDemo = computed(() => selection.kitchenSource.value === 'demo')
const demoData = useKitchenWorkspaceDemoData(isDemo)
const simulationDate = computed(
  () =>
    findKitchenWorkspaceDemoScenario(
      demoData.data.value,
      selection.kitchenId.value
    )?.finance?.asOfDate
)
const toDate = computed(
  () => simulationDate.value || new Date().toISOString().slice(0, 10)
)
const fromDate = computed(() => {
  const date = new Date(`${toDate.value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 29)
  return date.toISOString().slice(0, 10)
})

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
