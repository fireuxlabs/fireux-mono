<template>
  <KitchenPublicMenuDetailPage />
</template>

<script setup lang="ts">
import KitchenPublicMenuDetailPage from './[menuId].vue'

definePageMeta({
  layout: 'kitchen-menu',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenuIndexPage',
})
</script>
