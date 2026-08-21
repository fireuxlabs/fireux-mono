<template>
  <UserProfileDirectoryCard
    variant="cell"
    kind-label="Chef"
    icon="i-lucide-chef-hat"
    tone="warning"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="showSubtitle ? title : ''"
    :summary="showTagline ? prop || summary : ''"
    :badges="showBadges ? badges : []"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../composables/chef/useChefInterface'

type Props = Pick<
  ChefCard.Card,
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
  showBadges?: boolean
  showSubtitle?: boolean
  showTagline?: boolean
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
  showBadges: true,
  showSubtitle: true,
  showTagline: true,
})
</script>
