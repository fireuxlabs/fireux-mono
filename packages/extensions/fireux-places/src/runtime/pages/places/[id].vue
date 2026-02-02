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
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <div v-if="canEditAsAdmin || canEditAsClaimer" class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-pencil"
            :disabled="!docId"
            :to="editTo"
          >
            Edit
          </UButton>
        </div>
        <div v-if="loading" class="py-10 text-sm opacity-70">
          Loading place…
        </div>

        <div v-else-if="!place" class="space-y-2">
          <h1 class="text-lg font-semibold">Place Not Found</h1>
          <p>The place you’re looking for doesn’t exist.</p>
          <NuxtLink to="/places" class="text-primary hover:underline">← Back</NuxtLink>
        </div>

        <div v-else class="space-y-4">
          <PlaceCardsProfile v-if="placeProfile" :model="placeProfile" />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Claim</div>
            </template>
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500">Claimed by</span>
              <OrganismsUserCardsPill
                v-if="claimedUserPill"
                v-bind="claimedUserPill"
                :show-subtitle="false"
                :link="Boolean(claimedUserPill.to)"
              />
              <span v-else class="text-xs text-gray-500">—</span>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Details</div>
            </template>

            <div class="space-y-2 text-sm">
              <div v-for="item in details" :key="item.label">
                <div class="text-xs uppercase tracking-wide text-gray-400">
                  {{ item.label }}
                </div>
                <div class="font-medium">
                  {{ item.value }}
                </div>
              </div>

              <div v-if="mapUrl" class="pt-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-map-pin"
                  :to="mapUrl"
                  target="_blank"
                >
                  View map
                </UButton>
              </div>
            </div>
          </UCard>

          <DevJson
            v-if="isDev && place"
            :title="'Place (Doc)'"
            context="Place detail page · places/[id] · raw place doc"
            :data="place"
            :default-open="false"
          />
          <DevJson
            v-if="isDev && currentUser"
            :title="'User (Current)'"
            context="Place detail page · places/[id] · current user"
            :data="currentUser"
            :default-open="false"
          />
          <DevJson
            v-if="isDev && claimedUser"
            :title="'User (Claimed By)'"
            context="Place detail page · places/[id] · claimed-by user"
            :data="claimedUser"
            :default-open="false"
          />
          <DevJson
            v-if="isDev"
            :title="'User (Computed)'"
            context="Place detail page · places/[id] · useUserComputed outputs"
            :data="userComputedDebug"
            :default-open="false"
          />
          <DevJson
            v-if="isDev"
            :title="'Edit (Debug)'"
            context="Place detail page · places/[id] · edit gating"
            :data="editDebug"
            :default-open="false"
          />
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
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { usePlacesInterface } from '../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
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
const isDev = import.meta.dev

const { profile } = usePlacesInterface()
const placeProfile = computed(() => profile(place.value))

const claimedBy = computed(() => String(place.value?.claimed_by ?? '').trim())
const { user: claimedUser } = useUserFetch(claimedBy)
const { card: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const { currentUser, isAdmin, isLoading, isResolved, isInitialized, cta } = useUser()
const canEditAsAdmin = computed(() => Boolean(isAdmin.value))
const canEditAsClaimer = computed(() =>
  Boolean(currentUser.value?.id && currentUser.value.id === claimedBy.value)
)
const editDebug = computed(() => ({
  docId,
  claimedBy: claimedBy.value,
  currentUserId: currentUser.value?.id ?? null,
  canEditAsAdmin: canEditAsAdmin.value,
  canEditAsClaimer: canEditAsClaimer.value,
}))
const userComputedDebug = computed(() => ({
  isLoading: isLoading.value,
  isResolved: isResolved.value,
  isInitialized: isInitialized.value,
  isAdmin: isAdmin.value,
  cta: cta.value,
}))

const formatValue = (value: unknown) => {
  if (value == null) return ''
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value).trim()
}

const details = computed(() => {
  const v = place.value
  if (!v) return [] as Array<{ label: string; value: string }>

  const lat = Number(v.lat)
  const lng = Number(v.lng)
  const coords =
    Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : ''

  const items = [
    { label: 'Short name', value: formatValue((v as any).short_name) },
    { label: 'Formatted address', value: formatValue((v as any).formatted_address) },
    { label: 'Short address', value: formatValue((v as any).short_address) },
    { label: 'Search term', value: formatValue((v as any).search_term) },
    { label: 'Source', value: formatValue((v as any).source) },
    { label: 'Coordinates', value: coords },
    { label: 'Website', value: formatValue((v as any).website) },
    { label: 'Image URL', value: formatValue((v as any).image_url) },
    { label: 'Image shade', value: formatValue((v as any).image_shade) },
    { label: 'Created', value: formatValue((v as any).created_at) },
    { label: 'Updated', value: formatValue((v as any).updated_at) },
  ]

  return items.filter((item) => item.value)
})

const mapUrl = computed(() => {
  const v = place.value
  if (!v) return ''
  const lat = Number(v.lat)
  const lng = Number(v.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return ''
  return `https://maps.google.com/?q=${lat},${lng}`
})

const editTo = computed(() =>
  docId ? `/places/edit/${encodeURIComponent(docId)}` : '/places'
)

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
