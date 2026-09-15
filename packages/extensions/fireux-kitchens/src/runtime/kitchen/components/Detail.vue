<template>
  <article class="space-y-8">
    <KitchenDetailHeader :kitchen="presentation" />
    <KitchenDetailAbout :kitchen="presentation" />
    <KitchenDetailGallery :kitchen="presentation" />
    <KitchenDetailMenus :kitchen="presentation" />
    <KitchenDetailFulfilment :kitchen="presentation" />
    <KitchenDetailOperatorPanel :kitchen="presentation" />
  </article>
</template>

<script setup lang="ts">
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import { useKitchenSeo } from '../composables/useKitchenSeo'
import { computed } from 'vue'
const props = defineProps<{ presentation: KitchenDetailPresentation }>()
useKitchenSeo(computed(() => props.presentation))
</script>
