<template>
  <article class="space-y-8">
    <KitchenDetailHeader :kitchen="presentation" />
    <KitchenDetailMenus :kitchen="presentation" :index="menus" />
    <KitchenDetailAbout :kitchen="presentation" />
    <KitchenDetailGallery :kitchen="presentation" />
    <KitchenDetailFulfilment :kitchen="presentation" />
    <KitchenDetailOperatorPanel :kitchen="presentation" />
  </article>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import { useKitchenSeo } from '../composables/useKitchenSeo'
import { computed } from 'vue'
import type { MenuDirectoryController } from '../../menu/composables/useMenuDirectory'
const props = defineProps<{
  presentation: KitchenDetailPresentation
  menus: MenuDirectoryController
}>()
useKitchenSeo(computed(() => props.presentation))
</script>
