<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar
        :src="resolvedImageUrl || undefined"
        :alt="name"
        class="bg-white dark:bg-white"
        size="sm"
        icon="i-lucide-image"
      />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ name }}</div>

            <div v-if="showSubtitle && resolvedAddress" class="fx-cell__subtitle">
              {{ resolvedAddress }}
            </div>
          </div>

          <div v-if="showSource && sourceLabel" class="fx-cell__badges">
            <UBadge variant="soft" color="neutral" size="xs">{{ sourceLabel }}</UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaceLogoState } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

type Props = Pick<PlaceCard.Card, 'id' | 'to' | 'name' | 'formattedAddress' | 'imageUrl'> & {
  formatted_address?: string
  source?: 'google' | 'fireux' | 'manual'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  source: 'fireux',
  prop: '',
  showSubtitle: true,
  showSource: false,
  showTagline: false,
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
