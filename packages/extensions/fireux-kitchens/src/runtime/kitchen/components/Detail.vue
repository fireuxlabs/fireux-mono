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
import { computed } from 'vue'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.model.ts'
import { useKitchenSeo } from '../composables/useKitchenSeo'

const props = defineProps<{ kitchen: Kitchen }>()
const presentation = computed(
  () => props.kitchen as unknown as KitchenDetailPresentation
)
useKitchenSeo(presentation)
</script>
