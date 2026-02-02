<template>
  <button type="button" class="pill justify-start text-left" @click="emit('select')">
    <div class="flex w-full min-w-0 items-center gap-2">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="primaryLabel || ''"
        size="xs"
        :class="avatarClass"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">
          {{ primaryLabel }}
        </p>
        <p v-if="address" class="truncate text-xs text-muted">
          {{ address }}
        </p>
      </div>
      <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
        {{ sourceLabel }}
      </UBadge>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceImageShade } from '../../../../../../models/objects/place.model'

type Props = {
  name: string
  shortName?: string
  address: string
  imageUrl?: string
  imageShade?: PlaceImageShade
  source: 'fireux' | 'manual'
  showSource?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shortName: '',
  imageUrl: '',
  imageShade: 'none',
  showSource: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()

const avatarClass = computed(() => {
  const shade = props.imageShade as PlaceImageShade | undefined
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const primaryLabel = computed(() => props.shortName || props.name)

const sourceLabel = computed(() => (props.source === 'manual' ? 'Manual' : 'FireUX'))
</script>
