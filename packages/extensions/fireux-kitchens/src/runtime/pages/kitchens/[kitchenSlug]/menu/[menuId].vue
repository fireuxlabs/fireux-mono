<template>
  <KitchenQRMenu :menu="kitchenMenu" />
</template>

<script setup lang="ts">
import KitchenQRMenu from '../../../../components/organisms/Menu/Public/QRMenu.vue'
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
