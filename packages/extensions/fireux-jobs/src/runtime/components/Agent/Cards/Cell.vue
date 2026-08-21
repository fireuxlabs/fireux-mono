<template>
  <UserProfileDirectoryCard
    variant="cell"
    kind-label="Hiring profile"
    icon="i-lucide-handshake"
    tone="info"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="showSubtitle ? title : ''"
    :summary="prop || summary"
    :badges="badges"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../composables/fireux/firestore/profiles/Agent/utils/view/useAgentInterface'

type Props = Pick<
  AgentCard.Card,
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
  prop?: string
  showSubtitle?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  action: false,
  badges: () => [],
  link: false,
  prop: '',
  secondaryAvatarUrl: '',
  showSubtitle: true,
})
</script>
