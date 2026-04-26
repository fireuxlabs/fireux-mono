<template>
  <UPage>
    <UPageHeader
      title="Dev · Suppliers"
      description="Supplier model, demo catalogue state, collection, and linked ingredient diagnostics."
    />

    <UPageBody class="pagebody">
      <DevSuppliersSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 210,
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
