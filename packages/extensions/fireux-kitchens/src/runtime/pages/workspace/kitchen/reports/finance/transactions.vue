<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-finance-transactions">
      <template #header>
        <WorkspaceNavbar title="Finance Transactions" />
      </template>

      <template #body>
        <KitchenFinanceNav />
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

const toDate = computed(() => new Date().toISOString().slice(0, 10))
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
