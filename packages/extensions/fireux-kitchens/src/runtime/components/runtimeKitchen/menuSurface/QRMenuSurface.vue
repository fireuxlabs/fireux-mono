<template>
  <KitchenQRMenu :menu="surface" />
</template>

<script setup lang="ts">
import KitchenQRMenu from '../menu/QRMenu.vue'
import type { KitchenMenuState } from '../../../composables/fireux/app/useKitchenMenu'
import type { KitchenConsoleMenuSurfaceState } from '../../../composables/fireux/app/useKitchenConsoleMenuSurface'
import type { KitchenDemoMenuSurfaceState } from '../../../composables/fireux/app/useKitchenDemoMenuSurface'

defineProps<{
  surface:
    | KitchenMenuState
    | KitchenConsoleMenuSurfaceState
    | KitchenDemoMenuSurfaceState
}>()
</script>
