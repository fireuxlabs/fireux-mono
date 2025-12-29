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
        class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="h-4 w-4 animate-spin text-primary-500"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import type { PlaceCard } from '../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import {
  DEFAULT_LOGO_TIMEOUT_MS,
  usePlaceLogoState,
} from '../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos'

interface CellProps {
  place: PlaceCard.Cell
}

const props = defineProps<CellProps>()
const place = computed(() => props.place)

const logoState = usePlaceLogoState(place, {
  timeoutMs: DEFAULT_LOGO_TIMEOUT_MS,
  autoHydrate: true,
  priority: true,
  retryOnEmpty: true,
  shouldHydrate: (_next, currentAvatar) => !currentAvatar,
})

const previewSrc = computed(() => logoState.avatar.value)
const isFetchingLogo = computed(() => logoState.isLoading.value)
const showSpinner = computed(() => isFetchingLogo.value && !previewSrc.value)
onBeforeUnmount(() => {
  logoState.cancel()
})
</script>
