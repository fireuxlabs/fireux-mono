<template>
  <UCard class="overflow-hidden">
    <div class="space-y-3">
      <div class="relative h-10 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        <img
          v-if="resolvedImageUrl"
          :src="resolvedImageUrl"
          :alt="name"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-xs text-dimmed">
          <UIcon name="i-lucide-image" class="h-5 w-5" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-white">
          <div class="truncate text-sm font-semibold">{{ name }}</div>
          <UBadge
            v-if="showBadges && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0 bg-white/20 text-white"
          >
            {{ sourceLabel }}
          </UBadge>
        </div>
      </div>

      <div class="space-y-1 text-xs text-dimmed">
        <div v-if="formattedAddress" class="flex items-center gap-1">
          <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
          <span class="truncate">{{ formattedAddress }}</span>
        </div>

        <div v-if="showBody" class="line-clamp-2">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceImageShade } from '../../../../../models/objects/place.model'

type Props = {
  imageUrl: string
  imageShade?: PlaceImageShade
  name: string
  formattedAddress: string
  source: 'google' | 'fireux' | 'manual'
  prop?: string
  showBadges?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBadges: true,
  showBody: true,
})

const resolvedImageUrl = computed(() => props.imageUrl || '')

const sourceLabel = computed(() =>
  props.source === 'fireux'
    ? 'FireUX'
    : props.source === 'manual'
      ? 'Manual'
      : props.source === 'google'
        ? 'Google'
        : ''
)
</script>
