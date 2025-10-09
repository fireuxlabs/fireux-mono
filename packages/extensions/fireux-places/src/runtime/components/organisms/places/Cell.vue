<template>
  <div class="flex w-full items-center gap-3">
    <div class="relative flex-shrink-0">
      <UAvatar
        :src="previewSrc || undefined"
        :alt="place.name"
        size="md"
        icon="i-lucide-map-pin"
      />
      <div
        v-if="showSpinner"
        class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm dark:bg-gray-950/60"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="h-4 w-4 animate-spin text-gray-400"
        />
      </div>
    </div>

    <div class="min-w-0 flex-1 text-left">
      <p class="truncate text-sm font-medium text-gray-900">
        {{ place.name }}
      </p>
      <p v-if="place.formatted_address" class="truncate text-xs text-gray-500">
        {{ place.formatted_address }}
      </p>
      <p
        v-if="showSpinner"
        class="mt-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-400"
      >
        <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
        fetching logo
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import { loadLogoForPlace } from '../../../composables/usePlaceLogos'

interface CellProps {
  place: PlaceCard.Cell
}

const props = defineProps<CellProps>()
const CELL_PREFIX = '[places][cell]'

const avatarSrc = ref<string | null>(sanitizeAvatar(props.place.avatar))
const isLoading = ref(false)
let requestToken = 0

logCell('init', {
  placeId: canonicalPlaceId(props.place.place_id),
  source: props.place.source,
  hasAvatar: !!props.place.avatar,
})

watch(
  () => ({
    id: props.place.place_id,
    avatar: props.place.avatar,
    source: props.place.source,
  }),
  async ({ id, avatar, source }) => {
    requestToken += 1
    const token = requestToken
    const placeId = canonicalPlaceId(id)

    logCell('watch:trigger', {
      placeId,
      token,
      source,
      incomingAvatar: avatar ?? null,
    })

    const initial = sanitizeAvatar(avatar)
    avatarSrc.value = initial

    if (initial || source !== 'google') {
      isLoading.value = false
      logCell('watch:skip-load', {
        placeId,
        token,
        reason: initial ? 'has-avatar' : 'non-google-source',
      })
      return
    }

    if (!id) {
      isLoading.value = false
      logCell('watch:skip-load', {
        placeId,
        token,
        reason: 'missing-id',
      })
      return
    }

    isLoading.value = true
    logCell('load:start', { placeId, token })
    try {
      let logo = await loadLogoForPlace({ ...props.place })
      if (token !== requestToken) return

      let sanitized = sanitizeAvatar(logo)
      if (!sanitized) {
        logCell('load:retry', { placeId, token })
        logo = await loadLogoForPlace({ ...props.place }, { forceReload: true })
        if (token !== requestToken) return
        sanitized = sanitizeAvatar(logo)
      }

      avatarSrc.value = sanitized

      if (sanitized) {
        logCell('load:success', {
          placeId,
          token,
          avatar: sanitized,
        })
      } else {
        logCell('load:empty', { placeId, token })
      }
    } finally {
      if (token === requestToken) {
        isLoading.value = false
        logCell('load:complete', { placeId, token })
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  requestToken += 1
  logCell('unmount', {
    placeId: canonicalPlaceId(props.place.place_id),
  })
})

const previewSrc = computed(() => {
  const src = avatarSrc.value
  if (!src) return null
  const lower = src.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return src
})

const showSpinner = computed(() => isLoading.value && !previewSrc.value)

function sanitizeAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}

function canonicalPlaceId(id?: string | null) {
  return (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')
}

function logCell(event: string, payload?: Record<string, unknown>) {
  const ts = new Date().toISOString()
  if (payload) {
    console.log(`${CELL_PREFIX} ${event}`, { ...payload, ts })
  } else {
    console.log(`${CELL_PREFIX} ${event}`, { ts })
  }
}
</script>
