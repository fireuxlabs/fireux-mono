<template>
  <div class="pill">
    <div>
      <FireState v-if="loading && !imageUrl" outcome="pending" />
      <UAvatar
        v-else
        :src="imageUrl || undefined"
        :alt="name || ''"
        size="xs"
        :class="avatarClass"
      />
      <div>
        <p>
          {{ name }}
        </p>
        <p v-if="address">
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
