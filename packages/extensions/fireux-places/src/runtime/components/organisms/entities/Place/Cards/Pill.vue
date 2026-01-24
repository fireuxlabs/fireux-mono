<template>
  <SharedPill
    :avatar="avatarUrl || null"
    :title="title"
    :subtitle="subtitle || null"
    :badges="badges"
    :to="to"
    :link="link"
    :action="action"
    :show-subtitle="showSubtitle"
    :show-badges="showBadges"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import SharedPill from 'fireux-core/runtime/components/shared/Pill.vue'

defineOptions({ inheritAttrs: false })

type PillProps = Pick<
  PlaceCard.Card,
  'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'
> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

</script>
