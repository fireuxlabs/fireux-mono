<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Suppliers"
      description="Supplier model, demo catalogue state, collection, and linked ingredient diagnostics."
    />

    <UPageBody class="pagebody">
      <SupplierModelInspection />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'diagnostics',
  nav: {
    key: 'dev-ext-suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 210,
    desktop: true,
    group: 'ext',
    layouts: ['diagnostics'],
  },
})
</script>
