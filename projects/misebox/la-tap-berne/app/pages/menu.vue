<template>
  <div class="contents">
    <a
      class="latap-glass fixed right-4 top-4 z-50 grid size-12 place-items-center rounded-full no-underline"
      href="/"
      aria-label="Close menu"
    >
      <UIcon name="i-ph-x" class="size-5" />
    </a>

    <Menu menu-id="main" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public-menu',
  name: 'MenuPage',
})
</script>

<style scoped></style>
