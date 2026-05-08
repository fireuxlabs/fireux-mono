<template>
  <MenuQR :menu="kitchenMenu" />
</template>

<script setup lang="ts">
import MenuQR from '../../../../components/organisms/Menu/QR.vue'
import { useKitchenMenu } from '../../../../composables/fireux/app/useKitchenMenu'

definePageMeta({
  layout: 'public-menu',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenuDetailPage',
})

const kitchenMenu = useKitchenMenu()
</script>
