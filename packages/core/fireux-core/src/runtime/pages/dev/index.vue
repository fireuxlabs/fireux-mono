<template>
  <div class="page">
    <UCard>
      <template #header>
        <h1>Development Tools</h1>
      </template>
      <p>
        The Dev layout renders the full navigation. Use the menu to pick a tool.
      </p>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
  nav: {
    key: 'dev-index',
    label: 'Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})
</script>
