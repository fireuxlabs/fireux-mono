<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    @click="onClick"
  >
    <SharedPill
      :avatar="avatarUrl || null"
      :avatar-secondary="secondaryAvatarUrl || null"
      :title="displayName"
      :subtitle="title || null"
      :show-subtitle="showSubtitle"
    />
  </component>
</template>

<script setup lang="ts">
import SharedPill from 'fireux-core/runtime/components/shared/Pill.vue';
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional';

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<
    Pick<ProfessionalCard.Card, 'to' | 'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'title'> & {
      showSubtitle?: boolean
      link?: boolean
      action?: boolean
    }
  >(),
  {
    showSubtitle: true,
    link: false,
    action: false,
  }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
