<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-finance-reports">
      <template #header>
        <LayoutsWorkspaceNavbar title="Finance Reports" />
      </template>

      <template #body>
        <WorkspaceKitchenFinanceNav />

        <section class="grid gap-4 lg:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="font-semibold text-highlighted">Gross sales</h2>
                  <p class="mt-1 text-sm text-muted">
                    Completed Kitchen sales by period.
                  </p>
                </div>
                <UBadge color="success" variant="subtle">Available</UBadge>
              </div>
            </template>
            <p class="text-sm text-muted">
              Review reconciled totals, completed sales, average sale, service
              mix and item performance.
            </p>
            <template #footer>
              <UButton
                to="/workspace/kitchen/finance"
                label="Open report"
                icon="i-lucide-arrow-right"
                trailing
              />
            </template>
          </UCard>

          <UCard v-for="report in unavailableReports" :key="report.title">
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <h2 class="font-semibold text-highlighted">
                  {{ report.title }}
                </h2>
                <UBadge color="neutral" variant="soft">Source required</UBadge>
              </div>
            </template>
            <p class="text-sm text-muted">{{ report.description }}</p>
          </UCard>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const unavailableReports = [
  {
    title: 'Profit & Loss',
    description: 'Requires authoritative cost, expense and tax producers.',
  },
  {
    title: 'Balance Sheet',
    description: 'Requires authoritative asset, liability and equity records.',
  },
  {
    title: 'Cash Flow',
    description:
      'Requires authoritative cash receipts, payments and account balances.',
  },
  {
    title: 'Forecast',
    description: 'Requires an approved budget and forecast model.',
  },
]

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
