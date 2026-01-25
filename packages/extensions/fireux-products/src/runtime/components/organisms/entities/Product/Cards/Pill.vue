<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
  >
    <SharedPill
      :avatar="avatarUrl || null"
      :title="title"
      :subtitle="subtitle || null"
      :badges="badges"
      :show-subtitle="showSubtitle"
      :show-badges="showBadges"
    />
  </component>
</template>

<script setup lang="ts">
import SharedPill from 'fireux-core/runtime/components/shared/Pill.vue';
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';

type PillProps = Pick<ProductCard.Card, 'to' | 'avatarUrl' | 'title' | 'subtitle' | 'badges'> & {
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

const onClick = () => {
  if (props.action) emit('action')
}
</script>
