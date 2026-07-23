<template>
  <PublicProfileDirectoryCard
    variant="compact"
    kind-label="Professional"
    icon="i-lucide-briefcase-business"
    tone="primary"
    :to="to"
    :avatar-url="image || avatarUrl"
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
import type { ProfessionalCard } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<
    Pick<
      ProfessionalCard.Card,
      | 'to'
      | 'avatarUrl'
      | 'secondaryAvatarUrl'
      | 'image'
      | 'displayName'
      | 'handle'
      | 'title'
    > & {
      action?: boolean
      badges?: string[]
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
