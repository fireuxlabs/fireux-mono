<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue -->
<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="block"
    @click="onClick"
  >
    <SharedPill
      :avatar="thumbnailUrl || null"
      :title="displayName"
      :subtitle="showSubtitle ? (ecosystem || null) : null"
      :badges="badges"
      :show-subtitle="showSubtitle"
      :show-badges="showBadges"
    />
  </component>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import SharedPill from '../../../shared/Pill.vue';

defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (event: 'action'): void
}>()

type Props = Partial<AppCard.Card> & {
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: '',
  thumbnailUrl: '',
  displayName: '',
  ecosystem: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const onClick = () => {
  if (props.action) emit('action')
}

</script>