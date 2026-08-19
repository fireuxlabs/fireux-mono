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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { computed, ref, watch } from 'vue'
import type {
  Kitchen,
  KitchenFulfilmentConfig,
} from '../../models/kitchen.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type {
  KitchenDetailPresentation,
  KitchenIdentityEdit,
} from '../../models/kitchen-detail.model.ts'
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

const kitchen = computed(() => props.kitchen)
const place = computed(() => props.place)
const identityOverride = ref<KitchenIdentityEdit | null>(null)
watch(
  () => props.presentation,
  () => {
    identityOverride.value = null
  }
)
const displayKitchen = computed<KitchenDetailPresentation | null>(() => {
  if (!props.presentation) return null
  const identity = identityOverride.value
  if (!identity) return props.presentation
  const displayName =
    identity.display_name ||
    props.presentation.name ||
    props.presentation.display_name
  const tagline = identity.tagline || props.presentation.brand_tagline
  const imageUrl =
    identity.card_image_url ||
    props.presentation.display_image_url ||
    props.presentation.image_url
  return {
    ...props.presentation,
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
      (role === 'global' || props.presentation?.management_app_id === appId)
  )
)
const applyIdentity = (identity: KitchenIdentityEdit) => {
  identityOverride.value = identity
  emit('refresh')
}
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
const showDebug = import.meta.dev
</script>

<style scoped src="./detail.css"></style>
