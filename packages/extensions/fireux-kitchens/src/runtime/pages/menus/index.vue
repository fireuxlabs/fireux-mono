<template>
  <MenuJson endpoint="/api/menus" />
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'menus',
  name: 'MenusIndexPage',
  title: 'Menu JSON',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-braces',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
})
</script>
