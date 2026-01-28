<template>
  <ClientOnly>
    <UPage class="page edit-page">
      <UPageHeader :title="pageTitle" :description="pageSubtitle">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
          >
            Back to details
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UAlert
          v-else-if="!place"
          color="error"
          variant="soft"
          title="Place not found"
          description="We could not find this place. Return to the places list and try again."
        />

        <LayoutsDashboardProfileEdit v-else class="panels-masonry">
          <template #preview>
            <PlaceCardsPreview
              :image-url="place.place_image ?? ''"
              :image-shade="place.image_shade"
              :name="place.name ?? ''"
              :formatted-address="place.formatted_address ?? ''"
              :source="place.source ?? 'fireux'"
              :show-body="false"
            />
          </template>

          <template #core>
            <OrganismsEntitiesPlaceEdit :place="place" />
          </template>
        </LayoutsDashboardProfileEdit>

        <UCard v-if="showDebug && place">
          <template #header>
            <div class="text-sm font-semibold">Raw JSON</div>
          </template>

          <details class="p-4">
            <summary class="cursor-pointer text-sm text-dimmed">Show raw JSON</summary>
            <pre class="mt-2 max-h-[420px] overflow-auto text-xs">{{ json }}</pre>
          </details>
        </UCard>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading place…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Place } from '../../../models/objects/place.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const route = useRoute()

const raw = route.params.id
const placeId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { firestoreFetchDoc } = useFirestoreRead()
const docRef = placeId ? firestoreFetchDoc<Place>('places', placeId) : null

const place = computed<Place | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(placeId) && docRef?.value === undefined)
const showDebug = import.meta.dev

const pageTitle = computed(() => place.value?.name || 'Edit place')
const pageSubtitle = computed(() => (placeId ? `Place: ${placeId}` : 'Edit a place'))

const json = computed(() => {
  const v = place.value
  if (!v) return ''
  const seen = new WeakSet()
  try {
    return JSON.stringify(v, function (_, value) {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]'
        seen.add(value)
      }
      return value
    }, 2)
  } catch (e) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { toRaw } = require('vue')
      return JSON.stringify(toRaw(v), null, 2)
    } catch (e2) {
      return String(e)
    }
  }
})
</script>
