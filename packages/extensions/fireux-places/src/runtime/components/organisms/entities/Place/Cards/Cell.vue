<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="fx-card fx-card--cell"
    @click="onClick"
  >
    <div class="fx-card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="md"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__header">
          <div class="fx-card__content">
            <div class="fx-card__title">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="fx-card__meta">
              <UIcon name="i-lucide-map-pin" class="fx-card__icon" />
              <span class="fx-card__meta-text fx-truncate">{{ resolvedAddress }}</span>
            </div>
          </div>

          <UBadge
            v-if="showSource && sourceLabel"
            variant="soft"
            color="neutral"
            size="xs"
            class="fx-card__badge"
          >
            {{ sourceLabel }}
          </UBadge>
        </div>

        <div v-if="showTagline" class="fx-card__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

type Props = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  source: 'fireux',
  prop: '',
  showSubtitle: true,
  showSource: false,
  showTagline: false,
  link: false,
  action: false,
})

const resolvedAddress = computed(() => props.formattedAddress || '')

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

const onClick = () => {
  if (props.action) emit('action')
}
</script>
