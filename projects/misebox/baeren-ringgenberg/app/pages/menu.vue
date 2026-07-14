<template>
  <div class="contents">
    <MiseboxMenuClose
      class="baeren-glass fixed right-4 top-4 z-50 sm:right-8 sm:top-8"
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
})
</script>
