<template>
  <SharedPill
    :avatar="avatarUrl || null"
    :title="displayName"
    :subtitle="subtitleText || null"
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
import { computed } from 'vue';
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';
import SharedPill from '../../../shared/Pill.vue';

type PillProps = Pick<
  UserCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles'
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
  badges: () => [],
  profiles: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

const subtitleText = computed(() => {
  const parts: string[] = []
  if (props.handle) parts.push(props.handle)
  if (props.profiles.length) parts.push(props.profiles.join(', '))
  return parts.join(' · ')
})

</script>
