<!-- `packages/extensions/fireux-places/src/runtime/pages/places/[id].vue` -->

<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UContainer class="max-w-3xl space-y-6 py-8">
      <div class="flex items-center justify-between">
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          @click="goBack"
        >
          Back to search
        </UButton>
        <UBadge v-if="place" color="neutral" size="xs" variant="soft">
          {{ place.place_id }}
        </UBadge>
      </div>

      <div v-if="isLoading" class="space-y-3">
        <div
          class="h-48 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
        />
        <div
          class="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800"
        />
      </div>

      <UCard v-else-if="place" class="shadow-sm" :ui="{ body: 'space-y-5' }">
        <div class="flex items-start gap-4">
          <div class="flex flex-col items-start gap-2">
            <UAvatar
              :src="avatarSrc || undefined"
              :alt="place.name"
              size="lg"
              icon="i-lucide-map-pin"
            />

            <UButton
              v-if="canFetchLogo"
              size="xs"
              color="primary"
              variant="soft"
              icon="i-lucide-refresh-cw"
              :loading="isFetchingLogo"
              @click="handleFetchLogo"
            >
              Fetch logo
            </UButton>

            <p v-if="logoError" class="text-xs font-medium text-amber-700">
              {{ logoError }}
            </p>
          </div>

          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-semibold text-gray-900">
                {{ place.name }}
              </h2>
            </div>
            <p class="text-sm text-gray-500">
              {{ place.formatted_address || '—' }}
            </p>
            <p class="text-xs text-gray-400">ID: {{ place.place_id }}</p>
          </div>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div
            v-for="item in infoItems"
            :key="item.label"
            class="flex items-center justify-between gap-3 py-2 text-sm"
          >
            <span class="text-gray-500">{{ item.label }}</span>
            <template v-if="item.href">
              <a
                :href="item.href"
                target="_blank"
                rel="noopener"
                class="truncate font-medium text-primary-600 hover:underline"
              >
                {{ item.value }}
              </a>
            </template>
            <span
              v-else
              class="truncate text-right font-medium text-gray-900 dark:text-gray-100"
            >
              {{ item.value }}
            </span>
          </div>
        </div>
      </UCard>

      <UAlert
        v-else
        color="error"
        variant="soft"
        icon="i-lucide-map-pin-off"
        title="Place not found"
        description="We couldn't find a saved place with this identifier."
      />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { Place, PlaceCard } from '../../models/place.model'
import { usePlaces } from '../../composables/usePlaces'
import { loadLogoForPlace } from '../../composables/usePlaceLogos'

const route = useRoute()
const router = useRouter()
const { place: getPlace, savePlace } = usePlaces()

const docRef = ref<Ref<Place | undefined> | null>(null)
const hasSnapshot = ref(false)
let fallbackTimer: ReturnType<typeof setTimeout> | null = null
const LOGO_DETAIL_TIMEOUT_MS = 9000
const isFetchingLogo = ref(false)
const logoError = ref<string | null>(null)

const place = computed(() => docRef.value?.value ?? null)

watch(
  () => resolveRouteId(route.params.id),
  (id) => {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = null
    }

    if (!id) {
      docRef.value = null
      hasSnapshot.value = true
      return
    }

    docRef.value = getPlace(id)
    hasSnapshot.value = false
    fallbackTimer = setTimeout(() => {
      hasSnapshot.value = true
    }, 1200)
  },
  { immediate: true }
)

watch(
  () => docRef.value?.value,
  () => {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer)
      fallbackTimer = null
    }
    hasSnapshot.value = true
  }
)

const isLoading = computed(() => !hasSnapshot.value)

const sourceDescription = computed(() => {
  if (!place.value) return null
  return place.value.source === 'firestore' ? 'in Firestore' : 'from Google'
})

const pageTitle = computed(() => place.value?.name ?? 'Place details')
const pageDescription = computed(() =>
  place.value
    ? `Saved entry ${sourceDescription.value}`
    : 'Review and manage a saved place.'
)

const avatarSrc = computed(() => sanitizeAvatar(place.value?.avatar))
const canFetchLogo = computed(() => !avatarSrc.value && !!place.value)

const infoItems = computed(() => {
  const details = place.value
  if (!details) return []

  const rating = formatRating(details.rating, details.user_ratings_total)

  return [
    { label: 'Address', value: details.formatted_address || '—' },
    {
      label: 'Website',
      value: details.website ?? '—',
      href: details.website ?? null,
    },
    { label: 'Phone', value: details.phone || '—' },
    { label: 'Rating', value: rating },
    { label: 'Created', value: formatDate(details.created_at) || '—' },
    { label: 'Updated', value: formatDate(details.updated_at) || '—' },
    { label: 'Source', value: formatSource(details.source) },
  ]
})

watch(avatarSrc, (value) => {
  if (value) {
    logoError.value = null
  }
})

async function fetchLogoForPlace(forceReload = false) {
  const details = place.value
  if (!details || isFetchingLogo.value) return

  const cell: PlaceCard.Cell = {
    place_id: details.place_id,
    name: details.name,
    formatted_address: details.formatted_address ?? '',
    avatar: details.avatar ?? null,
    source: details.source ?? 'firestore',
  }

  try {
    isFetchingLogo.value = true
    logoError.value = null

    const logo = await loadLogoForPlace(cell, {
      priority: true,
      timeoutMs: LOGO_DETAIL_TIMEOUT_MS,
      fallbackAvatar: '',
      ...(forceReload ? { forceReload: true } : {}),
    })

    const sanitized = sanitizeAvatar(logo)
    if (!sanitized) {
      logoError.value =
        'We could not fetch a logo automatically. Upload one manually or try again.'
      return
    }

    await savePlace({
      ...details,
      avatar: sanitized,
      updated_at: new Date(),
    })
    logoError.value = null
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : String(error ?? 'unknown error')
    logoError.value = `Fetching the logo failed (${reason}). Try again or upload one manually.`
  } finally {
    isFetchingLogo.value = false
  }
}

function handleFetchLogo() {
  void fetchLogoForPlace(true)
}

function resolveRouteId(param: string | string[] | undefined) {
  if (!param) return ''
  const raw = Array.isArray(param) ? param[0] ?? '' : param
  return canonicalPlaceId(raw)
}

function canonicalPlaceId(id?: string | null) {
  return (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')
}

function sanitizeAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

function formatRating(
  rating: number | null | undefined,
  total: number | null | undefined
): string {
  if (typeof rating !== 'number' || Number.isNaN(rating)) return '—'
  const totalLabel =
    typeof total === 'number' && !Number.isNaN(total) ? ` (${total})` : ''
  return `${rating.toFixed(1)} / 5${totalLabel}`
}

function formatSource(source: Place['source']): string {
  return source === 'firestore' ? 'Firestore' : 'Google'
}

function formatDate(value: any): string | null {
  if (!value) return null
  if (value instanceof Date) {
    return value.toLocaleString()
  }
  if (typeof value?.toDate === 'function') {
    const date = value.toDate()
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.toLocaleString()
    }
  }
  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleString()
  }
  return String(value)
}

async function goBack() {
  await router.push('/places')
}

onBeforeUnmount(() => {
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
  }
})
</script>
