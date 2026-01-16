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
              <div class="text-sm font-semibold">Raw</div>
            </template>

            <pre class="max-h-[420px] overflow-auto text-xs">{{ json }}</pre>
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

const editTo = computed(() =>
  docId ? `/places/edit/${encodeURIComponent(docId)}` : '/places'
)

const { firestoreFetchDoc } = useFirestoreRead()
const rawDoc = docId ? await firestoreFetchDoc<Place>('places', docId) : null

const place = computed<Place | null>(() => (rawDoc as any)?.value ?? rawDoc ?? null)

const loading = computed(() => !rawDoc && !!docId)

const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})

const json = computed(() => JSON.stringify(place.value, null, 2))
</script>
