<template>
  <button type="button" class="pill" @click="emit('select')">
    <UAvatar
      :src="imageUrl || undefined"
      :alt="primaryLabel"
      size="sm"
      icon="i-lucide-map-pin"
      :class="avatarClass"
    />
    <div>
      <div>{{ primaryLabel }}</div>
      <div v-if="address">{{ address }}</div>
    </div>
    <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
      {{ sourceLabel }}
    </UBadge>
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
  showSource: true,
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
