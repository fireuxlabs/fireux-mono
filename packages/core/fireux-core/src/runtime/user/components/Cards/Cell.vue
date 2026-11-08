<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="card card--cell"
    @activate="emit('action')"
  >
    <div class="card__media">
      <UAvatar
        :src="avatarUrl || USER_ECOSYSTEM_AVATAR_SRC"
        :alt="displayName"
        size="sm"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div>
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handleLabel" class="card__subtitle">
              {{ handleLabel }}
            </div>
          </div>
        </div>

        <div v-if="showTagline && bio" class="card__tagline">
          {{ bio }}
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import type { UserView } from '../../composables/useUserView'

type Props = Partial<UserView> & {
  displayName?: string
  bio?: string
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  to: '',
  avatarUrl: '',
  displayName: '',
  handleLabel: '',
  bio: '',

  showSubtitle: true,
  showTagline: true,
  link: false,
  action: false,
})
</script>
