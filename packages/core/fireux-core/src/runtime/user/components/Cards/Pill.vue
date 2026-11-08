<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? handleLabel || undefined : undefined"
      :avatar="avatar"
      size="sm"
    />
  </FireActionSurface>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import { computed } from 'vue'

import type { UserView } from '../../composables/useUserView'

export type UserPillProps = Partial<UserView> & {
  displayName?: string
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<UserPillProps>(), {
  to: '',
  avatarUrl: '',
  displayName: '',
  handleLabel: '',
  showSubtitle: true,
  link: false,
  action: false,
})

const avatarAlt = computed(
  () => props.displayName || props.handleLabel || 'User'
)
const avatar = computed(() => ({
  src: props.avatarUrl || USER_ECOSYSTEM_AVATAR_SRC,
  alt: avatarAlt.value,
}))
</script>
