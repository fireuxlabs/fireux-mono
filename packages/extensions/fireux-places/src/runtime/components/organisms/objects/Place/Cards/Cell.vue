<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="name"
        class="bg-white dark:bg-white"
        size="sm"
        icon="i-lucide-map-pin"
      />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ name }}</div>

            <div v-if="showSubtitle && formattedAddress" class="fx-cell__subtitle">
              {{ formattedAddress }}
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
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

type Props = Pick<PlaceCard.Card, 'to' | 'name' | 'formattedAddress' | 'imageUrl'> & {
  source?: 'google' | 'firebase'
  prop?: string
  showSubtitle?: boolean
  showSource?: boolean
  showTagline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  source: 'firebase',
  prop: '',
  showSubtitle: true,
  showSource: true,
  showTagline: true,
})

const sourceLabel = computed(() =>
  props.source === 'firebase' ? 'Firebase' : props.source === 'google' ? 'Google' : ''
)
</script>
