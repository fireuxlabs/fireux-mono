<template>
  <UPage>
    <UPageHeader
      title="Dev · fireux-properties"
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
    key: 'dev-fireux-properties',
    label: 'fireux-properties',
    icon: 'i-lucide-building',
    group: 'ext',
    desktop: true,
    layouts: ['dev'],
  },
})
</script>
