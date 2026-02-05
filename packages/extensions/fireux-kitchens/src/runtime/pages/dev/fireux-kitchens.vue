<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens (Ext)"
      description="Model shape for Kitchens collection."
    />
    <UPageBody class="pagebody">
      <DevKitchenSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
