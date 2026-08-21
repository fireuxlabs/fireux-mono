<template>
  <UserProfileDirectoryCard
    variant="cell"
    kind-label="Professional"
    icon="i-lucide-briefcase-business"
    tone="primary"
    :to="to"
    :avatar-url="image || avatarUrl"
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
import type { ProfessionalCard } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

type Props = Pick<
  ProfessionalCard.Card,
  | 'to'
  | 'avatarUrl'
  | 'secondaryAvatarUrl'
  | 'image'
  | 'displayName'
  | 'handle'
  | 'title'
  | 'summary'
> & {
  action?: boolean
  badges?: string[]
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
