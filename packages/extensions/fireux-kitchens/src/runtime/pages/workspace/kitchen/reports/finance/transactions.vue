<template>
  <KitchenFinanceNav />
  <WorkspaceKitchenOverviewFinance :from-date="fromDate" :to-date="toDate" />
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
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true, desktop: false, mobile: false, layouts: ['workspace'] },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
