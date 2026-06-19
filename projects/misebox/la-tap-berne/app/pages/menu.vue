<template>
  <Menu
    menu-id="main"
    kitchen-slug="la-tapberne"
    v-slot="{ menu, pending }"
  >
    <LaTapBerneMenu
      :menu="menu"
      :pending="pending"
    />
  </Menu>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
  name: 'MenuPage',
})
</script>
