<template>
  <ClientOnly>
    <UPage>
      <UPageHeader :title="pageTitle" :description="pageDescription">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            to="/places"
          >
            Back
          </UButton>

          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-pencil"
            :disabled="!docId"
            :to="editTo"
          >
            Edit
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading place…
        </div>

        <div v-else-if="!place" class="space-y-2">
          <h1 class="text-lg font-semibold">Place Not Found</h1>
          <p>The place you’re looking for doesn’t exist.</p>
          <NuxtLink to="/places" class="text-primary hover:underline">← Back</NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <PlaceCardsPreview
            :image-url="place.place_image ?? ''"
            :name="place.name ?? ''"
            :formatted-address="place.formatted_address ?? ''"
            :source="place.source ?? 'firebase'"
            :show-body="false"
          />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Details</div>
            </template>

            <div class="grid gap-2 sm:grid-cols-2 p-4 text-sm">
              <div class="text-dimmed">Address</div>
              <div class="break-words">{{ place.formatted_address || '—' }}</div>

              <div class="text-dimmed">Location</div>
              <div>
                <a
                  v-if="place.lat && place.lng"
                  :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.lat},${place.lng}`)}`"
                  target="_blank"
                  rel="noreferrer"
                  class="text-primary hover:underline inline-flex items-center"
                  aria-label="Open in Google Maps"
                >
                  <i class="i-lucide-map-pin" />
                </a>
                <span v-else>—</span>
              </div>

              <div class="text-dimmed">Source</div>
              <div class="capitalize">{{ place.source || '—' }}</div>

              <div class="text-dimmed">Search Term</div>
              <div class="break-words">{{ place.search_term || '—' }}</div>

              <div class="text-dimmed">ID</div>
              <div class="break-words">{{ place.id }}</div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Actions</div>
            </template>

            <div class="p-4 flex flex-wrap items-center gap-2">
              <a
                v-if="place.lat && place.lng"
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.lat},${place.lng}`)}`"
                target="_blank"
                rel="noreferrer"
                class="text-primary hover:underline"
              >
                Open in Google Maps
              </a>

              <NuxtLink v-if="docId" :to="editTo" class="text-primary hover:underline">
                Edit place
              </NuxtLink>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Raw JSON</div>
            </template>

            <details class="p-4">
              <summary class="cursor-pointer text-sm text-dimmed">Show raw JSON</summary>
              <pre class="mt-2 max-h-[420px] overflow-auto text-xs">{{ json }}</pre>
            </details>
          </UCard>
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading place…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Place } from '../../models/objects/place.model'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const { appName } = useFireUXConfig()

const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')


const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc<Place>('places', docId) : null

const place = computed<Place | null>(() => (rawDoc as any)?.value ?? rawDoc ?? null)

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)

const editTo = computed(() =>
  docId ? `/places/edit/${encodeURIComponent(docId)}` : '/places'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})

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
      // Fallback: attempt to stringify the raw object
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { toRaw } = require('vue')
      return JSON.stringify(toRaw(v), null, 2)
    } catch (e2) {
      return String(e)
    }
  }
})
</script>
