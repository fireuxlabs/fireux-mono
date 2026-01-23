<template>
  <UCard class="fx-preview">
    <div class="fx-preview__row">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        :class="avatarShadeClass"
        size="sm"
        icon="i-lucide-image"
      />

      <div class="fx-preview__main">
        <div class="fx-preview__top">
          <div class="fx-preview__title">{{ name }}</div>

          <div v-if="showBadges && sourceLabel" class="fx-preview__badges">
            <UBadge variant="soft" color="neutral" size="xs">{{ sourceLabel }}</UBadge>
          </div>
        </div>

        <div v-if="formattedAddress" class="fx-preview__subtitle">
          {{ formattedAddress }}
        </div>

        <div v-if="showBody" class="fx-preview__body">
          <div class="fx-preview__line">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
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

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return 'fx-avatar-shade--neutral'
})

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
