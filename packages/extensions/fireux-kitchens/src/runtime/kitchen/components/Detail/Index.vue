<template>
  <article class="kitchen-detail" :style="detailStyle">
    <!-- 01 Identity -->
    <div class="kitchen-detail__hero">
      <nav class="kitchen-detail__toolbar" aria-label="Kitchen directory">
        <UButton
          to="/kitchens"
          label="All kitchens"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          class="kitchen-detail__back"
        />
        <div class="kitchen-detail__actions">
          <KitchenDetailSproochli
            v-if="displayKitchen?.sproochli?.enabled"
            :sproochli="displayKitchen.sproochli"
          />
          <UButton
            v-if="canEditPlace && kitchen"
            :to="`/places/${encodeURIComponent(kitchen.id)}/edit`"
            label="Edit identity"
            icon="i-lucide-pencil"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </div>
      </nav>
      <KitchenHeader :kitchen="displayKitchen" />
    </div>

    <!-- 02 Information -->
    <div class="kitchen-detail__content">
      <main class="kitchen-detail__editorial">
        <section v-if="kitchenAbout" class="kitchen-detail__about">
          <h2 class="fx-type-section-title">About {{ kitchenName }}</h2>
          <p class="kitchen-detail__story fx-type-body">
            {{ kitchenAbout }}
          </p>
        </section>

        <PlaceDetailGallery
          v-if="galleryImages.length"
          :name="kitchenName"
          :images="galleryImages"
        />

        <KitchenDetailMenus v-if="displayKitchen" :kitchen="displayKitchen" />
      </main>

      <aside class="kitchen-detail__capabilities">
        <KitchenDetailFulfilment
          :kitchen="displayKitchen"
          :fulfilment="resolvedFulfilment"
        />
        <KitchenDetailOperatorPanel :kitchen="displayKitchen" />
      </aside>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import type { Kitchen } from '../../models/kitchen.model.ts'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.model.ts'
import { useKitchenSeo } from '../../composables/useKitchenSeo'

const props = defineProps<{ kitchen: Kitchen }>()
const displayKitchen = computed<KitchenDetailPresentation | null>(
  () => props.kitchen as unknown as KitchenDetailPresentation
)
const { isAdmin, isDeveloper } = useUser()
const canEditPlace = computed(() => isAdmin.value || isDeveloper.value)
const kitchenName = computed(() =>
  String(
    displayKitchen.value?.display_name ||
      displayKitchen.value?.name ||
      'Kitchen'
  ).trim()
)
const kitchenAbout = computed(() =>
  String(displayKitchen.value?.about || '').trim()
)
const clean = (value: unknown) => String(value ?? '').trim()
const galleryImages = computed(() => {
  const kitchen = displayKitchen.value
  return Array.isArray(kitchen?.food_gallery)
    ? kitchen.food_gallery.map(clean).filter(Boolean)
    : []
})
const detailStyle = computed(() => {
  const color = clean(displayKitchen.value?.media_backdrop_color)
  return color ? { '--fx-entity-media-bg': color } : undefined
})
const emptyFulfilment: KitchenFulfilment = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  displayKitchen.value?.slug
    ? `/api/kitchens/${encodeURIComponent(displayKitchen.value.slug)}/fulfilment`
    : ''
)
const { data: fulfilmentData } = useFetch<KitchenFulfilment>(fulfilmentPath, {
  immediate: Boolean(fulfilmentPath.value),
  watch: [fulfilmentPath],
})
const resolvedFulfilment = computed(
  () => fulfilmentData.value || emptyFulfilment
)

useKitchenSeo(displayKitchen)
</script>

<style scoped src="./detail.css"></style>
