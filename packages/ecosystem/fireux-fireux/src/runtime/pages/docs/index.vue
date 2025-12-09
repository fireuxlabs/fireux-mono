packages/ecosystem/fireux-fireux/src/runtime/pages/docs/index.vue
<template>
  <UPage>
    <UPageHeader title="Hello, world" description="FireUX docs." />

    <UPageBody>
      <p class="text-sm text-gray-700 dark:text-gray-300">Hello, world.</p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Docs',
  nav: {
    key: 'docs',
    label: 'Docs',
    icon: 'i-lucide-book-open',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useHead({ title: 'Hello, world — FireUX Docs' })
</script>
