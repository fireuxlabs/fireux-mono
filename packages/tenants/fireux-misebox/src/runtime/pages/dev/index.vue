//packages/tenants/fireux-misebox/src/runtime/pages/dev/index.vue
<template>
  <div class="page">
    <UCard>
      <template #header>
        <h1>Development Tools</h1>
      </template>
      <p>
        The Dev menu shows all tools for this tenant and extensions. Pick from
        the navigation.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
  nav: {
    key: 'dev-tenant-index',
    label: 'Tenant Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})
</script>
