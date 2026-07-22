<template>
  <PublicProfileDirectoryCard
    variant="card"
    kind-label="Professional"
    icon="i-lucide-briefcase-business"
    :to="to"
    :avatar-url="image || avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="showSubtitle ? title : ''"
    :summary="showBody ? prop || summary : ''"
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
  | 'badges'
  | 'summary'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  badges: () => [],
  prop: '',
  secondaryAvatarUrl: '',
  showSubtitle: true,
  showBadges: true,
  showBody: true,
  link: false,
  action: false,
})
</script>
