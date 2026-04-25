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
import KitchenMenuSurfaceKiosk from '../../../../components/runtimeKitchen/menuSurface/KioskMenuSurface.vue'
import KitchenMenuSurfaceQR from '../../../../components/runtimeKitchen/menuSurface/QRMenuSurface.vue'
import { useKitchenMenuSurface } from '../../../../composables/fireux/app/useKitchenMenuSurface'

definePageMeta({
  layout: 'kitchen-menu',
  title: 'Kitchen Menu',
  description: 'Public menu view.',
  head: { title: 'Kitchen Menu' },
  name: 'KitchenPublicMenuDetailPage',
})

const menuSurface = useKitchenMenuSurface()
const surface = computed(() => menuSurface.surface.value)
</script>
