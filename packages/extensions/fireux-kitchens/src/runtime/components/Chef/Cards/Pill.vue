<template>
  <PublicProfileDirectoryCard
    variant="compact"
    kind-label="Chef"
    icon="i-lucide-chef-hat"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="showSubtitle ? title : ''"
    :badges="showBadges ? badges : []"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<
    Pick<
      ChefCard.Card,
      | 'to'
      | 'avatarUrl'
      | 'secondaryAvatarUrl'
      | 'displayName'
      | 'handle'
      | 'title'
      | 'badges'
    > & {
      action?: boolean
      link?: boolean
      showBadges?: boolean
      showSubtitle?: boolean
    }
  >(),
  {
    action: false,
    badges: () => [],
    link: false,
    secondaryAvatarUrl: '',
    showBadges: true,
    showSubtitle: true,
  }
)
</script>
