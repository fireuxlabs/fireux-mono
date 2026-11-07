<template>
  <KitchenFinanceNav />
  <section class="workspace-surface__grid workspace-surface__grid--2">
    <UCard>
      <template #header>
        <div class="card__header">
          <div>
            <h2>Gross sales</h2>
            <p>Completed Kitchen sales by period.</p>
          </div>
          <UBadge color="success" variant="subtle">Available</UBadge>
        </div>
      </template>
      <p>
        Review reconciled totals, completed sales, average sale, service mix and
        item performance.
      </p>
      <template #footer>
        <UButton
          to="/workspace/kitchen/reports/finance"
          label="Open report"
          icon="i-lucide-arrow-right"
          trailing
        />
      </template>
    </UCard>

    <UCard v-for="report in unavailableReports" :key="report.title">
      <template #header>
        <div class="card__header">
          <h2>
            {{ report.title }}
          </h2>
          <UBadge color="neutral" variant="soft">Source required</UBadge>
        </div>
      </template>
      <p>{{ report.description }}</p>
    </UCard>
  </section>
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
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
