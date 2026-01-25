<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
  >
    <SharedPill
      :avatar="avatarUrl || null"
      :title="displayName"
      :subtitle="tagline || null"
      :badges="badges"
      :show-subtitle="showSubtitle"
      :show-badges="showBadges"
    />
  </component>
</template>

<script setup lang="ts">
import SharedPill from 'fireux-core/runtime/components/shared/Pill.vue';
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<AgentCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'tagline' | 'badges'> & {
      showSubtitle?: boolean
      showBadges?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
    link: false,
    action: false,
    badges: () => [],
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
