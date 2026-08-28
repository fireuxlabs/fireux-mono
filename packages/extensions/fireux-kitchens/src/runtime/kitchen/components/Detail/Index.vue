<template>
  <UPage class="kitchen-detail-surface" :style="detailStyle">
    <UPageBody class="pagebody">
      <KitchenDetailState
        v-if="outcome !== 'ready' || !kitchen || !place || !presentation"
        :outcome="outcome"
        :has-kitchen="Boolean(kitchen && place && presentation)"
        @refresh="emit('refresh')"
      />

      <article v-else class="kitchen-detail">
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

            <KitchenDetailMenus
              v-if="displayKitchen"
              :kitchen="displayKitchen"
            />
          </main>

          <aside class="kitchen-detail__capabilities">
            <KitchenDetailFulfilment
              :kitchen="displayKitchen"
              :fulfilment="resolvedFulfilment"
            />
            <KitchenDetailOperatorPanel :kitchen="displayKitchen" />
          </aside>
        </div>

        <DevDebugPanel
          v-if="showDebug"
          object-origin="fetched"
          launcher
          include-route
          title="Kitchen"
          context="Kitchen detail page · kitchens/[slug] · canonical Kitchen and linked Place"
          :objects="{ kitchen, place }"
          :derived="{ presentation: displayKitchen, resolvedFulfilment }"
          :default-open="false"
        />
      </article>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed } from 'vue'
import type { Kitchen } from '../../models/kitchen.model.ts'
import type { KitchenFulfilment } from '../../models/fulfilment.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.model.ts'
import type { KitchenDetailOutcome } from '../../composables/useKitchenDetail'

const props = defineProps<{
  kitchen?: Kitchen | null
  place?: Place | null
  presentation?: KitchenDetailPresentation | null
  outcome: KitchenDetailOutcome
}>()

const emit = defineEmits<{
  refresh: []
}>()

const kitchen = computed<Kitchen | null>(() => props.kitchen ?? null)
const place = computed<Place | null>(() => props.place ?? null)
const displayKitchen = computed<KitchenDetailPresentation | null>(
  () => props.presentation ?? null
)
const { isAdmin, isDeveloper } = useUser()
const canEditPlace = computed(() => Boolean(isAdmin.value || isDeveloper.value))
const locator = computed(() => String(props.presentation?.slug || '').trim())
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
  locator.value
    ? `/api/kitchens/${encodeURIComponent(locator.value)}/fulfilment`
    : ''
)

const { data: fulfilmentData } = useFetch<KitchenFulfilment>(fulfilmentPath, {
  immediate: Boolean(fulfilmentPath.value),
  watch: [fulfilmentPath],
})
const resolvedFulfilment = computed(
  () => fulfilmentData.value || emptyFulfilment
)
const showDebug = import.meta.dev
</script>

<style scoped src="./detail.css"></style>
