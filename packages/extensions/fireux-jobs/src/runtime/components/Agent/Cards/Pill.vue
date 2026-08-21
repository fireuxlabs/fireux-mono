<template>
  <UserProfileDirectoryCard
    variant="compact"
    kind-label="Hiring profile"
    icon="i-lucide-handshake"
    tone="info"
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
import type { AgentCard } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<
    Pick<
      AgentCard.Card,
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
