<template>
  <div class="contents">
    <MiseboxMenuClose
      class="fixed right-4 top-4 z-50 sm:right-8 sm:top-8"
      to="/"
    />

    <MenuDetail
      menu-id="pizza-snacks-drinks"
      kitchen-slug="baeren-ringgenberg"
      menu-context="pre_order"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'menu',
  nav: {
    key: 'menu',
    label: 'Menu',
    icon: 'i-lucide-utensils',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>
