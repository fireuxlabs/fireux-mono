<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100 dark:hover:bg-gray-800"
    @click="emit('select')"
  >
    <UAvatar
      :src="imageUrl || undefined"
      :alt="title"
      size="sm"
      icon="i-lucide-map-pin"
      :class="avatarShadeClass"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ displayTitle }}
          </div>
          <div v-if="subtitle" class="truncate text-xs text-dimmed">
            {{ subtitle }}
          </div>
        </div>

        <UBadge
          v-if="showSource && sourceLabel"
          size="xs"
          variant="soft"
          color="neutral"
          class="shrink-0"
        >
          {{ sourceLabel }}
        </UBadge>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { PlaceImageShade } from '../../../../../models/objects/place.model'

type Props = Pick<
  PlaceCard.Card,
  'title' | 'subtitle' | 'imageUrl' | 'imageShade' | 'source' | 'name'
> & {
  showSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSource: true,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()

const avatarShadeClass = computed(() => {
  const shade = props.imageShade as PlaceImageShade | undefined
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const displayTitle = computed(() => props.title || props.name || '')

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
