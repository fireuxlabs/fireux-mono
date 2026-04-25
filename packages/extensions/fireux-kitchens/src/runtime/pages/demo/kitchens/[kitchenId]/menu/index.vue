<template>
  <DemoKitchenMenuDetailPage />
</template>

<script setup lang="ts">
import DemoKitchenMenuDetailPage from './[menuId].vue'

definePageMeta({
  layout: 'kitchen-menu',
  title: 'Demo Kitchen Menu',
  description: 'Demo kitchen menu preview.',
  head: { title: 'Demo Kitchen Menu' },
  name: 'DemoKitchenMenuIndexPage',
})
</script>
