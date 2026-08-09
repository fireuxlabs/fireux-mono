<template>
  <PublicProfileDirectoryCard
    variant="compact"
    kind-label="Driver"
    icon="i-lucide-truck"
    tone="success"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="title"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { DriverCard } from '../../../composables/fireux/driver/useDriverInterface'

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
    > & {
      action?: boolean
      link?: boolean
    }
  >(),
  {
    action: false,
    link: false,
    secondaryAvatarUrl: '',
  }
)
</script>
