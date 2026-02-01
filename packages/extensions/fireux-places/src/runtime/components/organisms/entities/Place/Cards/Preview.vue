<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        :class="avatarShadeClass"
        size="sm"
        icon="i-lucide-image"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div class="truncate text-sm font-semibold">{{ name }}</div>

          <UBadge
            v-if="showBadges && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="shrink-0"
          >
            {{ sourceLabel }}
          </UBadge>
        </div>

        <div v-if="formattedAddress" class="truncate text-xs text-dimmed">
          {{ formattedAddress }}
        </div>

        <div v-if="showBody" class="text-xs text-dimmed">
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

const avatarShadeClass = computed(() => {
  const shade = props.imageShade
  if (!shade) return ''
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
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
