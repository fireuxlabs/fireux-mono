<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue -->
<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
  >
    <SharedPill
      :avatar="thumbnailUrl || null"
      :title="displayName"
      :subtitle="ecosystem || null"
      :badges="badges"
      :show-subtitle="showSubtitle"
      :show-badges="showBadges"
    />
  </component>
</template>

<script setup lang="ts">
import SharedPill from '../../../shared/Pill.vue'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<AppCard.Card, 'to' | 'thumbnailUrl' | 'displayName' | 'ecosystem' | 'badges'> & {
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    badges: () => [],
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}

</script>