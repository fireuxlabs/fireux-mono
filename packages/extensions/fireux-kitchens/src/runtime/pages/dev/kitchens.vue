<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens"
      description="Kitchen model, demo world, collection, and storage diagnostics."
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
    key: 'dev-ext-kitchens-domain',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 200,
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
