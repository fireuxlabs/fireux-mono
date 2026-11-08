<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="proxiedAvatarUrl || undefined"
        :alt="displayName"
        size="sm"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div>
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="card__subtitle">
              {{ handle }}
            </div>
          </div>
        </div>

        <div v-if="showTagline" class="card__tagline">
          <span v-if="taglineOverride">{{ taglineOverride }}</span>
          <span v-else-if="summary">{{ summary }}</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { type UserCard } from '../../composables/useUserView'

type Props = Partial<
  Pick<UserCard, 'to' | 'avatarUrl' | 'displayName' | 'handle' | 'summary'>
> & {
  /** Optional override for the tagline line. */
  taglineOverride?: string
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  to: '',
  avatarUrl: '',
  displayName: '',
  handle: '',
  summary: '',

  showSubtitle: true,
  showTagline: true,
  link: false,
  action: false,
})

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_ECOSYSTEM_AVATAR_SRC
)
</script>
