<template>
  <div class="pill justify-start text-left">
    <div class="flex w-full min-w-0 items-center gap-2">
      <div
        v-if="loading && !imageUrl"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed text-muted"
      >
        <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
      </div>
      <UAvatar
        v-else
        :src="imageUrl || undefined"
        :alt="name || ''"
        size="xs"
        :class="avatarClass"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">
          {{ name }}
        </p>
        <p v-if="address" class="truncate text-xs text-muted">
          {{ address }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceSearchSource } from '../../../composables/firestore/fetch/search/types'
import type { PlaceImageShade } from '../../../utils/place-spine'

type Props = {
  name: string
  address: string
  imageUrl?: string
  imageShade?: PlaceImageShade
  source?: PlaceSearchSource
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  imageShade: 'none',
  loading: false,
})

const avatarClass = computed(() => {
  if (props.source === 'google') return ''
  const shade = props.imageShade as PlaceImageShade | undefined
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
</script>
