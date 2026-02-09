<template>
  <UPage>
    <UPageHeader
      title="Dev · Products (Ext)"
      description="Collection-first view; filter by extra fields (against the runtime Product model)."
    />

    <UPageBody class="pagebody">
      <DevProductSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-products',
    label: 'Products (Ext)',
    icon: 'i-lucide-package',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
