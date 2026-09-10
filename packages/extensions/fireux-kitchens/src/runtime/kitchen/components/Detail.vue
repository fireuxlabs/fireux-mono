<template>
  <article class="space-y-8">
    <KitchenDetailHeader :kitchen="presentation" />
    <div
      class="kitchen-detail-content grid items-start gap-8"
      :class="{ 'kitchen-detail-content--with-profile': presentation.about || presentation.food_gallery?.length }"
    >
      <KitchenDetailMenus :kitchen="presentation" />
      <div
        v-if="presentation.about || presentation.food_gallery?.length"
        class="min-w-0 space-y-8"
      >
        <KitchenDetailAbout :kitchen="presentation" />
        <KitchenDetailGallery :kitchen="presentation" />
      </div>
    </div>
    <KitchenDetailFulfilment :kitchen="presentation" />
    <KitchenDetailOperatorPanel :kitchen="presentation" />
    <DevDebugPanel
      title="Kitchen detail surface"
      context="Related Place fetched by Kitchen Detail and the joined presentation derived from it."
      object-origin="fetched"
      :objects="{ place }"
      :derived="{ placeId, presentation }"
      launcher
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceFetch } from 'fireux-places/runtime/place/composables/firestore/usePlace'
import type { Kitchen } from '../models/kitchen.model.ts'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import { useKitchenSeo } from '../composables/useKitchenSeo'
import { resolveKitchenDetailPresentation } from '../utils/kitchen-detail-presentation'

const props = defineProps<{ kitchen: Kitchen }>()
const placeId = computed(() => props.kitchen.id)
const { place } = usePlaceFetch(placeId)
const presentation = computed<KitchenDetailPresentation>(() => {
  const stored = props.kitchen as unknown as Partial<KitchenDetailPresentation>
  const base: KitchenDetailPresentation = {
    ...stored,
    id: props.kitchen.id,
    slug: props.kitchen.slug,
    visible: props.kitchen.visibility,
    route_scope: 'live',
    name: stored.name || props.kitchen.slug,
    display_name: stored.display_name || stored.name || props.kitchen.slug,
  }
  return place.value
    ? resolveKitchenDetailPresentation(base, props.kitchen, place.value)
    : base
})
useKitchenSeo(presentation)
</script>

<style scoped>
@media (min-width: 64rem) {
  .kitchen-detail-content--with-profile {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
}
</style>
