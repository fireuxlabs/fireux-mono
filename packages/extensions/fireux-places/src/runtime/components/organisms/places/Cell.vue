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

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-900">
        {{ place.name }}
      </p>
      <p v-if="place.formatted_address" class="truncate text-xs text-gray-500">
        {{ place.formatted_address }}
      </p>
    </div>

    <UBadge
      :color="sourceBadge.color"
      variant="soft"
      size="xs"
      class="flex-shrink-0 uppercase tracking-wide"
    >
      {{ sourceBadge.label }}
    </UBadge>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PlaceCard } from 'fireux-places/runtime/models/place.model'
import { loadLogoForPlace } from '../../../composables/usePlaceLogos'

interface CellProps {
  place: PlaceCard.Cell
}

const props = defineProps<CellProps>()

const avatarSrc = ref<string | null>(sanitizeAvatar(props.place.avatar))
const isLoading = ref(false)
let requestToken = 0

watch(
  () => ({
    id: props.place.place_id,
    avatar: props.place.avatar,
    source: props.place.source,
  }),
  async ({ id, avatar, source }) => {
    requestToken += 1
    const token = requestToken

    const initial = sanitizeAvatar(avatar)
    avatarSrc.value = initial

    if (initial || source !== 'google') {
      isLoading.value = false
      return
    }

    if (!id) {
      isLoading.value = false
      return
    }

    isLoading.value = true
    try {
      const logo = await loadLogoForPlace({ ...props.place })
      if (token !== requestToken) return
      avatarSrc.value = sanitizeAvatar(logo)
    } finally {
      if (token === requestToken) {
        isLoading.value = false
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  requestToken += 1
})

const previewSrc = computed(() => {
  const src = avatarSrc.value
  if (!src) return null
  const lower = src.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return src
})

const showSpinner = computed(() => isLoading.value)

const sourceBadge = computed(() => {
  if (props.place.source === 'google') {
    return { label: 'Google', color: 'primary' as const }
  }
  return { label: 'Saved', color: 'neutral' as const }
})

function sanitizeAvatar(value?: string | null): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  if (lower.includes('mapfiles/place_api/icons')) return null
  return value
}
</script>
