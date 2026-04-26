<template>
  <UPage>
    <UPageHeader
      title="Dev · Portfolios"
      description="Portfolio model, root collection, and app-overlay storage diagnostics."
    />

    <UPageBody class="pagebody">
      <DevPortfolioSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-portfolios',
    label: 'Portfolios',
    icon: 'i-lucide-building',
    order: 220,
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
