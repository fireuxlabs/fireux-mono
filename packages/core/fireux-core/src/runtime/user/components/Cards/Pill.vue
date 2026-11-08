<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <UUser
      :name="displayName"
      :description="showSubtitle ? handle || undefined : undefined"
      :avatar="avatar"
      size="sm"
    />
  </FireActionSurface>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import { computed } from 'vue'

import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { type UserCard } from '../../composables/useUserView'

type PillProps = Partial<
  Pick<UserCard, 'to' | 'avatarUrl' | 'displayName' | 'handle'>
> & {
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  to: '',
  avatarUrl: '',
  displayName: '',
  handle: '',
  showSubtitle: true,
  link: false,
  action: false,
})

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_ECOSYSTEM_AVATAR_SRC
)
const avatarAlt = computed(() => props.displayName || props.handle || 'User')
const avatar = computed(() => ({
  src: proxiedAvatarUrl.value || undefined,
  alt: avatarAlt.value,
}))
</script>
