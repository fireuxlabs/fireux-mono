<template>
  <SharedPill
    :avatar="avatarUrl || null"
    :title="title"
    :subtitle="subtitle || null"
    :badges="badges"
    :show-subtitle="showSubtitle"
    :show-badges="showBadges"
  />
</template>

<script setup lang="ts">
import SharedPill from 'fireux-core/runtime/components/shared/Pill.vue'
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

defineOptions({ inheritAttrs: false })

type PillProps = Pick<
  PlaceCard.Card,
  'avatarUrl' | 'title' | 'subtitle' | 'badges'
> & {
  showSubtitle?: boolean
  showBadges?: boolean
}

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  showBadges: true,
})
</script>
