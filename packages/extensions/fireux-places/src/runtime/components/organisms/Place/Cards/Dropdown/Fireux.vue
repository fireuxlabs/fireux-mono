<template>
  <button type="button" class="pill" @click="emit('select')">
    <UUser
      :name="primaryLabel"
      :description="address || undefined"
      :avatar="imageUrl ? { src: imageUrl || undefined, alt: primaryLabel || '', class: avatarClass } : undefined"
      size="sm"
    >
      <template #default>
        <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
          {{ sourceLabel }}
        </UBadge>
      </template>
    </UUser>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceImageShade } from '../../../../../models/place.model'

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
