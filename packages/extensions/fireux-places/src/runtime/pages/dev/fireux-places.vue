<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
      <DevPlaceSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-places',
    label: 'Places (Ext)',
    icon: 'i-lucide-map-pin',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
