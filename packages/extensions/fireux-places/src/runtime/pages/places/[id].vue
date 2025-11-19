<template>
  <UPage>
    <UPageHeader
      :title="placeName"
      :description="pageDescription"
      :badge="placeId"
    >
      <template #extra>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="mapLink"
            color="primary"
            icon="i-lucide-map-pin"
            variant="soft"
            :to="mapLink"
            target="_blank"
          >
            Open in Maps
          </UButton>
          <UButton
            v-if="place?.search_term"
            color="gray"
            icon="i-lucide-copy"
            variant="ghost"
            @click="copySearchTerm"
          >
            Copy search term
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UContainer class="max-w-5xl space-y-8 py-8">
      <section v-if="isLoading" class="space-y-6">
        <USkeleton class="h-36 w-full rounded-xl" />
        <div class="grid gap-6 md:grid-cols-2">
          <USkeleton class="h-56 rounded-xl" />
          <USkeleton class="h-56 rounded-xl" />
        </div>
        <USkeleton class="h-48 w-full rounded-xl" />
      </section>

      <section
        v-else-if="!place"
        class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700"
      >
        This place is not available. It may have been removed or you lack
        access.
      </section>

      <section v-else class="space-y-8">
        <UCard class="shadow-sm">
          <div class="flex flex-col gap-6 md:flex-row md:items-center">
            <UAvatar
              :src="place.avatar || undefined"
              :alt="place.name"
              size="2xl"
              icon="i-lucide-map-pin"
            />

            <div class="flex-1 space-y-2">
              <h2 class="text-2xl font-semibold">{{ place.name }}</h2>
              <p v-if="place.formatted_address" class="text-sm text-gray-500">
                {{ place.formatted_address }}
              </p>

              <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                <UBadge size="xs" variant="soft" :color="sourceBadgeColor">
                  {{ sourceLabel }}
                </UBadge>
                <UBadge v-if="place.creator_id" size="xs" variant="outline">
                  Created by {{ place.creator_id }}
                </UBadge>
              </div>

              <div v-if="mapLink" class="flex flex-wrap gap-3 pt-3">
                <UButton
                  color="primary"
                  icon="i-lucide-navigation"
                  variant="solid"
                  :to="mapLink"
                  target="_blank"
                  size="sm"
                >
                  Directions
                </UButton>
                <UButton
                  color="primary"
                  variant="ghost"
                  icon="i-lucide-compass"
                  size="sm"
                  @click="openMaps"
                >
                  Preview map
                </UButton>
              </div>
            </div>
          </div>

          <hr class="my-6 border-gray-200 dark:border-gray-800" />

          <dl class="grid gap-4 text-sm text-gray-500 md:grid-cols-3 md:gap-6">
            <div>
              <dt class="font-medium text-gray-700">Created</dt>
              <dd>{{ createdAt ?? 'Unknown' }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-700">Updated</dt>
              <dd>{{ updatedAt ?? 'Never' }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-700">Coordinates</dt>
              <dd>
                <span v-if="hasCoordinates">
                  {{ place.lat.toFixed(5) }}, {{ place.lng.toFixed(5) }}
                </span>
                <span v-else>Not captured</span>
              </dd>
            </div>
          </dl>
        </UCard>

        <div class="grid gap-6 md:grid-cols-2">
          <UCard :ui="{ body: 'space-y-3' }" class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-semibold">
                  <UIcon name="i-lucide-users" /> Current team
                </div>
                <UBadge variant="soft" color="primary">
                  {{ currentRoster.length }}
                </UBadge>
              </div>
            </template>

            <div v-if="currentRoster.length" class="space-y-2">
              <div
                v-for="entry in currentRosterEntries"
                :key="entry.uid"
                class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
              >
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-user" class="h-4 w-4 text-gray-400" />
                  <div class="flex flex-col">
                    <span class="font-medium">{{ entry.name }}</span>
                  </div>
                </div>
                <NuxtLink
                  :to="`/users/${entry.uid}`"
                  class="text-primary-500 hover:underline"
                >
                  View user
                </NuxtLink>
              </div>
            </div>

            <p
              v-else
              class="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800"
            >
              No current professionals are linked to this place.
            </p>
          </UCard>

          <UCard :ui="{ body: 'space-y-3' }" class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-semibold">
                  <UIcon name="i-lucide-history" /> Alumni
                </div>
                <UBadge variant="soft" color="gray">
                  {{ alumniRoster.length }}
                </UBadge>
              </div>
            </template>

            <div v-if="alumniRoster.length" class="space-y-2">
              <div
                v-for="entry in alumniRosterEntries"
                :key="entry.uid"
                class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-800"
              >
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-lucide-user-round"
                    class="h-4 w-4 text-gray-400"
                  />
                  <div class="flex flex-col">
                    <span class="font-medium">{{ entry.name }}</span>
                  </div>
                </div>
                <NuxtLink
                  :to="`/users/${entry.uid}`"
                  class="text-primary-500 hover:underline"
                >
                  View user
                </NuxtLink>
              </div>
            </div>

            <p
              v-else
              class="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800"
            >
              No alumni records yet. Historical experience will appear here.
            </p>
          </UCard>
        </div>

        <UCard :ui="{ body: 'space-y-4' }" class="shadow-sm">
          <template #header>
            <div class="flex items-center gap-2 font-semibold">
              <UIcon name="i-lucide-code-2" /> Raw document snapshot
            </div>
          </template>
          <pre
            class="overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
            >{{ rawPlace }}
          </pre>
        </UCard>
      </section>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import type { Place } from '../../models/place.model'
import { usePlaces } from '../../composables/usePlaces'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model'

type UserDoc = Omit<User, 'appUser'>

type RosterPlace = Place & {
  creator_id?: string
  professionals_current?: string[]
  professionals_alumni?: string[]
}

const route = useRoute()
const rawId = route.params.id
const placeId = Array.isArray(rawId) ? rawId[0] : String(rawId ?? '')

const { place: getPlace } = usePlaces()
const { firestoreFetchDoc } = useFirestoreRead()
const placeRef = placeId ? getPlace(placeId) : null

const place = computed<RosterPlace | null>(() => placeRef?.value ?? null)
const isLoading = ref(!!placeId && !!placeRef)

if (!placeRef) {
  isLoading.value = false
} else {
  watch(
    placeRef,
    () => {
      isLoading.value = false
    },
    { flush: 'post' }
  )
}

const hasCoordinates = computed(
  () =>
    typeof place.value?.lat === 'number' && typeof place.value?.lng === 'number'
)

const mapLink = computed(() => {
  if (!place.value || !hasCoordinates.value) return null
  const query = encodeURIComponent(`${place.value.lat},${place.value.lng}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
})

const currentRoster = computed(() => place.value?.professionals_current ?? [])
const alumniRoster = computed(() => place.value?.professionals_alumni ?? [])

const userDocRefs = new Map<string, Ref<UserDoc | undefined>>()

function ensureUserDoc(uid: string) {
  if (!userDocRefs.has(uid)) {
    userDocRefs.set(uid, firestoreFetchDoc<UserDoc>('users', uid))
  }
  return userDocRefs.get(uid)!
}

const currentRosterEntries = computed(() =>
  currentRoster.value.map((uid) => {
    const doc = ensureUserDoc(uid).value
    return {
      uid,
      name: doc?.display_name || doc?.handle || uid,
    }
  })
)

const alumniRosterEntries = computed(() =>
  alumniRoster.value.map((uid) => {
    const doc = ensureUserDoc(uid).value
    return {
      uid,
      name: doc?.display_name || doc?.handle || uid,
    }
  })
)

const sourceLabel = computed(() =>
  place.value ? 'Firestore source' : 'Unknown'
)

const sourceBadgeColor = computed(() => 'primary')

const createdAt = computed(() => formatTimestamp(place.value?.created_at))
const updatedAt = computed(() => formatTimestamp(place.value?.updated_at))

const placeName = computed(() => place.value?.name ?? 'Place details')
const pageDescription = computed(
  () =>
    place.value?.formatted_address ??
    'Inspect place metadata and linked professionals.'
)

const rawPlace = computed(() =>
  place.value ? JSON.stringify(place.value, null, 2) : 'No document loaded.'
)

useHead({
  title: computed(() =>
    place.value?.name ? `${place.value.name} · Place` : 'Place details'
  ),
})

function formatTimestamp(value: any) {
  if (!value) return undefined
  let date: Date | undefined
  if (typeof value.toDate === 'function') {
    date = value.toDate()
  } else if (typeof value === 'object' && 'seconds' in value) {
    date = new Date(value.seconds * 1000)
  } else if (value instanceof Date) {
    date = value
  } else if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) date = parsed
  }
  return date ? date.toLocaleString() : undefined
}

function copySearchTerm() {
  if (!place.value?.search_term) return
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  navigator.clipboard.writeText(place.value.search_term)
}

function openMaps() {
  if (!mapLink.value) return
  if (typeof window === 'undefined') return
  window.open(mapLink.value, '_blank', 'noopener')
}
</script>
