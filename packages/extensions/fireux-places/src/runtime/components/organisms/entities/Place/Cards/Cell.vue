<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        size="sm"
        icon="i-lucide-image"
        :class="avatarShadeClass"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="card__subtitle">
              {{ resolvedAddress }}
            </div>
          </div>

          <div v-if="showSource && sourceLabel" class="card__badges">
            <UBadge variant="soft" color="neutral" size="xs">{{ sourceLabel }}</UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="card__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceLogoState } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

type Props = Pick<
  PlaceCard.Card,
  'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl' | 'imageShade'
> & {
  formatted_address?: string
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

const resolvedAddress = computed(
  () => props.formattedAddress || props.formatted_address || ''
)

const placeRef = computed(() => ({
  id: props.id,
  name: props.name,
  formatted_address: resolvedAddress.value,
  imageUrl: props.imageUrl,
  source: props.source,
}))

const { avatar } = usePlaceLogoState(placeRef)

const resolvedImageUrl = computed(
  () => props.imageUrl || avatar.value || ''
)

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

const onClick = () => {
  if (props.action) emit('action')
}
</script>
