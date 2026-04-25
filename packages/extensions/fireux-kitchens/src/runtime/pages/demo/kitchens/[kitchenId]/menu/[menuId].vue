<template>
  <KitchenMenuSurfaceKiosk
    v-if="surface === 'kiosk'"
    :surface="menuSurface"
  />
  <KitchenMenuSurfaceQR
    v-else
    :surface="menuSurface"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KitchenMenuSurfaceKiosk from '../../../../../components/runtimeKitchen/menuSurface/KioskMenuSurface.vue'
import KitchenMenuSurfaceQR from '../../../../../components/runtimeKitchen/menuSurface/QRMenuSurface.vue'
import { useKitchenDemoMenuSurface } from '../../../../../composables/fireux/app/useKitchenDemoMenuSurface'

definePageMeta({
  layout: 'kitchen-menu',
  title: 'Demo Kitchen Menu',
  description: 'Demo kitchen menu preview.',
  head: { title: 'Demo Kitchen Menu' },
  name: 'DemoKitchenMenuDetailPage',
})

const menuSurface = useKitchenDemoMenuSurface()
const surface = computed(() => menuSurface.surface.value)
</script>
