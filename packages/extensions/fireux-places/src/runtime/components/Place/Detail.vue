<!-- Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: expose the guarded developer/admin removal action. -->
<template>
  <UPage class="place-detail" :style="detailStyle">
    <UPageBody class="pagebody">
      <PlaceDetailState
        v-if="outcome !== 'ready' || !place"
        :outcome="outcome"
        :has-place="Boolean(place)"
        @refresh="refresh"
      />

      <article v-else class="place-detail__page">
        <div class="place-detail__hero">
          <nav class="place-detail__toolbar" aria-label="Place directory">
            <UButton
              to="/places"
              label="Back to all Places"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
            />
            <div class="place-detail__toolbar-actions">
              <ClientOnly>
                <UButton
                  :icon="colorModeIcon"
                  :aria-label="colorModeLabel"
                  :title="colorModeLabel"
                  color="neutral"
                  variant="solid"
                  size="sm"
                  square
                  @click="toggleColorMode"
                />
                <template #fallback>
                  <span
                    class="place-detail__color-mode-placeholder"
                    aria-hidden="true"
                  />
                </template>
              </ClientOnly>
              <UButton
                v-if="isAdmin"
                :to="editTo"
                label="Edit Place"
                icon="i-lucide-pencil"
                color="neutral"
                variant="solid"
                size="sm"
              />
            </div>
          </nav>
          <PlaceHeader :place="place" />
        </div>

        <div
          class="place-detail__content"
          :class="{
            'place-detail__content--information-only': !hasEditorialContent,
          }"
        >
          <main v-if="hasEditorialContent" class="place-detail__editorial">
            <section v-if="place.about" class="place-detail__about">
              <h2 class="fx-type-section-title">
                About {{ place.short_name || place.name }}
              </h2>
              <p class="place-detail__story fx-type-body">{{ place.about }}</p>
            </section>
            <PlaceDetailGallery
              v-if="place.gallery_images.length"
              :name="place.name"
              :images="place.gallery_images"
            />
          </main>

          <PlaceDetailVisitInfo
            :class="{ 'place-visit-info--wide': !hasEditorialContent }"
            :place="place"
            :website-label="websiteLabel"
            :has-visit-details="hasVisitDetails"
            :facts="facts"
            :hours="hoursRows"
          />
        </div>

        <PlaceDelete :place="place" />

        <DevDebugPanel
          v-if="showDebug"
          object-origin="fetched"
          launcher
          include-route
          title="Place DTO"
          context="Place detail page · places/[id] · bounded projection"
          :objects="place"
          :derived="{}"
          :contract="placeDebugContract"
          :default-open="false"
        />
      </article>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { computed } from 'vue'
import {
  useColorMode,
  useResolvedColorMode,
} from 'fireux-core/runtime/composables/fireux/app/useColorMode'
import { usePlaceDetail } from '../../composables/fireux/place/usePlaceDetail'
import {
  PublicPlaceDetailDebugModel,
  PublicPlaceDetailDebugRequiredPaths,
} from '../../models/place-public.model'

defineOptions({ name: 'PlaceDetail' })

const props = defineProps<{ locator: string }>()
const placeDebugContract = {
  model: PublicPlaceDetailDebugModel,
  requiredPaths: [...PublicPlaceDetailDebugRequiredPaths],
}
const detail = usePlaceDetail(props)
const colorMode = useColorMode()
const resolvedColorMode = useResolvedColorMode()
const colorModeIcon = computed(() =>
  resolvedColorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'
)
const colorModeLabel = computed(() =>
  resolvedColorMode.value === 'dark'
    ? 'Use light appearance'
    : 'Use dark appearance'
)

function toggleColorMode() {
  colorMode.value = resolvedColorMode.value === 'dark' ? 'light' : 'dark'
}

await detail.ready
if (import.meta.server && detail.missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && detail.failed.value) {
  setResponseStatus(
    detail.statusCode.value >= 400 ? detail.statusCode.value : 503
  )
}

const {
  place,
  outcome,
  refresh,
  isAdmin,
  showDebug,
  detailStyle,
  websiteLabel,
  hasVisitDetails,
  facts,
  hoursRows,
  hasEditorialContent,
  editTo,
} = detail
</script>

<style scoped src="./detail.css"></style>
