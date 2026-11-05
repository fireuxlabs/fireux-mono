<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Businesses"
      description="Inspect the immutable Business role contract and its Place-backed projections."
    />

    <UPageBody class="pagebody">
      <BusinessCollectionManager
        title="Businesses"
        description="Canonical Business records with their explicitly linked Places."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-businesses',
    label: 'Businesses (Ext)',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})

</script>
