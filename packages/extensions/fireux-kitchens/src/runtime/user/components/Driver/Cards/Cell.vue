<template>
  <PublicProfileDirectoryCard
    variant="cell"
    kind-label="Driver"
    icon="i-lucide-truck"
    tone="success"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="title"
    :summary="summary"
    :badges="badges"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { DriverCard } from '../../../composables/driver/useDriverInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<
    Pick<
      DriverCard.Card,
      | 'to'
      | 'avatarUrl'
      | 'secondaryAvatarUrl'
      | 'displayName'
      | 'handle'
      | 'title'
      | 'badges'
      | 'summary'
    > & {
      action?: boolean
      link?: boolean
    }
  >(),
  {
    action: false,
    badges: () => [],
    link: false,
    secondaryAvatarUrl: '',
    summary: '',
  }
)
</script>
