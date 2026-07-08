<template>
  <div class="contents">
    <MiseboxMenuClose
      class="latap-glass fixed right-4 top-4 z-50 sm:right-8 sm:top-8"
      to="/"
    />

    <MenuDetail
      menu-id="main"
      kitchen-slug="la-tapberne"
      menu-context="pre_order"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'menu',
  name: 'MenuPage',
})
</script>

<style scoped></style>
