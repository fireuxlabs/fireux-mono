<template>
  <div class="contents">
    <a
      class="latap-menu-close latap-glass fixed right-4 top-4 z-50 no-underline sm:right-8 sm:top-8"
      href="/"
      aria-label="Close menu"
    >
      <UIcon name="i-lucide-x" />
    </a>

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
