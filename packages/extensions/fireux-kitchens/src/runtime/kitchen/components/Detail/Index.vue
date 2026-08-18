<template>
  <UPage class="kitchen-detail-surface" :style="detailStyle">
    <UPageBody class="pagebody">
      <UPageCard v-if="outcome === 'pending'" variant="subtle">
        <p class="text-sm text-dimmed">Loading kitchen…</p>
      </UPageCard>

      <UPageCard
        v-else-if="outcome === 'error'"
        title="Kitchen unavailable"
        description="This kitchen could not be loaded. Please try again."
        variant="subtle"
      />

      <UPageCard
        v-else-if="!kitchen"
        title="Kitchen not found"
        description="This kitchen does not exist or is not public-ready."
        variant="subtle"
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
              <KitchenDetailIdentityEditor
                v-if="canEditIdentity && displayKitchen"
                :kitchen="displayKitchen"
                @saved="applyIdentity"
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
              v-if="placePresentation?.gallery_images.length"
              :name="kitchenName"
              :images="placePresentation.gallery_images"
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
      </article>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed, ref, watch } from 'vue'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'
import type { KitchenFulfilmentConfig } from '../../models/kitchen.model.ts'
import type {
  KitchenPublicIdentityEdit,
  PublicKitchenDetail,
} from '../../models/kitchen-index.model.ts'
import type { KitchenDetailOutcome } from '../../composables/useKitchenDetail'
import type { PublicPlaceDetailProjection } from 'fireux-places/runtime/place/models/place-public.model'

const props = defineProps<{
  kitchen?: PublicKitchenDetail | null
  outcome: KitchenDetailOutcome
}>()

const emit = defineEmits<{
  refresh: []
}>()

const kitchen = computed(
  () => props.kitchen as KitchenSurface | null | undefined
)
const identityOverride = ref<KitchenPublicIdentityEdit | null>(null)
watch(
  () => props.kitchen,
  () => {
    identityOverride.value = null
  }
)
const displayKitchen = computed<PublicKitchenDetail | null>(() => {
  if (!props.kitchen) return null
  const identity = identityOverride.value
  if (!identity) return props.kitchen
  const displayName =
    identity.display_name || props.kitchen.name || props.kitchen.display_name
  const tagline = identity.tagline || props.kitchen.brand_tagline
  const imageUrl =
    identity.card_image_url ||
    props.kitchen.display_image_url ||
    props.kitchen.image_url
  return {
    ...props.kitchen,
    name: displayName,
    display_name: displayName,
    ...(tagline ? { tagline, brand_tagline: tagline } : {}),
    ...(identity.logo_image_url
      ? { logo_image_url: identity.logo_image_url }
      : {}),
    ...(imageUrl ? { image_url: imageUrl, display_image_url: imageUrl } : {}),
  }
})
const { appId, role } = useFireUXConfig()
const { isAdmin, isDeveloper } = useUser()
const canEditIdentity = computed(() =>
  Boolean(
    (isAdmin.value || isDeveloper.value) &&
      (role === 'global' || props.kitchen?.management_app_id === appId)
  )
)
const applyIdentity = (identity: KitchenPublicIdentityEdit) => {
  identityOverride.value = identity
  emit('refresh')
}
const locator = computed(() => String(props.kitchen?.slug || '').trim())
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
const placePresentation = computed<PublicPlaceDetailProjection | null>(() => {
  const kitchen = displayKitchen.value
  if (!kitchen) return null
  const gallery = Array.isArray(kitchen.food_gallery)
    ? kitchen.food_gallery.map(clean).filter(Boolean)
    : []
  return {
    id: clean(kitchen.place_id || kitchen.id),
    name: kitchenName.value,
    place_type: 'physical',
    short_name: clean(kitchen.short_name),
    brand_tagline: clean(kitchen.tagline || kitchen.brand_tagline),
    short_address: clean(kitchen.short_address || kitchen.formatted_address),
    image_url: clean(kitchen.image_url),
    media_backdrop_color: clean(kitchen.media_backdrop_color) as
      | `#${string}`
      | '',
    image_shade: 'none',
    verified: false,
    slug: clean(kitchen.slug),
    about: kitchenAbout.value,
    cover_image: clean(kitchen.cover_image),
    gallery_images: gallery,
    logo_image: clean(kitchen.logo_image_url),
    wordmark_image: clean(kitchen.wordmark_image),
    business_hours: { windows: [] },
    website: clean(kitchen.website),
    ...(clean(kitchen.google_maps_url)
      ? { google_maps_url: clean(kitchen.google_maps_url) }
      : {}),
  }
})
const detailStyle = computed(() => {
  const color = clean(displayKitchen.value?.media_backdrop_color)
  return color
    ? { '--fx-entity-accent': color, '--fx-entity-media-bg': color }
    : undefined
})
const emptyFulfilment: KitchenFulfilmentConfig = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  locator.value
    ? `/api/kitchens/${encodeURIComponent(locator.value)}/fulfilment`
    : ''
)

const { data: fulfilmentData } = useFetch<KitchenFulfilmentConfig>(
  fulfilmentPath,
  {
    immediate: Boolean(fulfilmentPath.value),
    watch: [fulfilmentPath],
  }
)
const resolvedFulfilment = computed(
  () => fulfilmentData.value || emptyFulfilment
)
</script>

<style scoped src="./detail.css"></style>
