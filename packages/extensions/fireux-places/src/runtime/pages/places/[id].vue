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
          <UCard>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div class="flex flex-col gap-2">
                <div>
                  <div class="text-xs font-medium text-dimmed">Image shade</div>
                  <div class="text-xs text-gray-500">Pick the best background for this logo.</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="option in shadeOptions"
                    :key="option.value"
                    class="rounded-xl ring-1 ring-transparent transition"
                    :class="currentShade === option.value ? 'ring-2 ring-primary' : 'hover:ring-primary/30'"
                  >
                    <PlaceCardsPill
                      :avatar-url="place.place_image || ''"
                      :title="option.label"
                      subtitle=""
                      :badges="[]"
                      :show-badges="false"
                      :show-subtitle="false"
                      :action="true"
                      :image-shade="option.value"
                      @action="onSelectShade(option.value)"
                    />
                  </div>
                </div>
              </div>

              <PlaceCardsPreview
                :image-url="place.place_image ?? ''"
                :image-shade="place.image_shade"
                :name="place.name ?? ''"
                :formatted-address="place.formatted_address ?? ''"
                :source="place.source ?? 'fireux'"
                :show-body="false"
              />

              <div class="flex flex-1 flex-wrap items-center gap-2">
                <UBadge
                  v-if="isExisting"
                  size="xs"
                  color="primary"
                  variant="soft"
                >
                  Already in database
                </UBadge>
                <UBadge
                  v-if="isExisting && !isClaimed"
                  size="xs"
                  color="amber"
                  variant="soft"
                >
                  Unclaimed
                </UBadge>
                <UBadge
                  v-else-if="isExisting && isClaimed"
                  size="xs"
                  color="emerald"
                  variant="soft"
                >
                  Claimed
                </UBadge>
                <UBadge size="xs" color="neutral" variant="soft">
                  {{ sourceLabel }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <div class="grid gap-4 lg:grid-cols-3">
            <UCard class="lg:col-span-3">
              <template #header>
                <div class="text-sm font-semibold">Details</div>
              </template>

              <div class="grid gap-3 p-4 text-sm sm:grid-cols-2">
                <div class="text-dimmed">Address</div>
                <div class="break-words">{{ place.formatted_address || '—' }}</div>

                <div class="text-dimmed">Map</div>
                <div class="break-words">
                  <a
                    v-if="mapUrl"
                    :href="mapUrl"
                    target="_blank"
                    rel="noreferrer"
                    class="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    <i class="i-lucide-map-pin" />
                    Open in Google Maps
                  </a>
                  <span v-else>—</span>
                </div>

                <div class="text-dimmed">Claimed by</div>
                <div class="break-words">{{ place.claimed_by || '—' }}</div>

                <div class="text-dimmed">Search Term</div>
                <div class="break-words">{{ place.search_term || '—' }}</div>

                <div class="text-dimmed">Place ID</div>
                <div class="break-words">{{ place.id }}</div>
              </div>
            </UCard>
          </div>

          <UCard v-if="showDebug">
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
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, ref } from 'vue'
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
const { updateDocument } = useFirestoreUpdate()
const rawDoc = docId ? await firestoreFetchDoc<Place>('places', docId) : null

const place = computed<Place | null>(() => (rawDoc as any)?.value ?? rawDoc ?? null)

const loading = computed(() => !rawDoc && !!docId)
const showDebug = import.meta.dev

const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)

const isExisting = computed(() => place.value?.source !== 'google')
const isClaimed = computed(() => !!place.value?.claimed_by)

const currentShade = computed<'light' | 'dark' | 'none'>(() => {
  const shade = place.value?.image_shade
  return shade === 'light' || shade === 'dark' ? shade : 'none'
})

const shadeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Default', value: 'none' },
] as const

const isUpdatingShade = ref(false)

const onSelectShade = async (shade: (typeof shadeOptions)[number]['value']) => {
  if (!docId || isUpdatingShade.value) return
  isUpdatingShade.value = true
  try {
    await updateDocument<Place>('places', docId, { image_shade: shade } as Partial<Place>)
  } finally {
    isUpdatingShade.value = false
  }
}

const sourceLabel = computed(() => {
  const source = place.value?.source
  if (source === 'fireux') return 'FireUX'
  if (source === 'manual') return 'Manual'
  if (source === 'google') return 'Google'
  return '—'
})

const mapUrl = computed(() => {
  const lat = place.value?.lat
  const lng = place.value?.lng
  if (!lat || !lng) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
})

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
