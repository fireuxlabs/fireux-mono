<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar
        :src="proxiedAvatarUrl || undefined"
        :alt="displayName"
        size="sm"
      />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ displayName }}</div>
        </div>

        <div v-if="showSubtitle && handle" class="preview__subtitle">
          {{ handle }}
        </div>

        <div
          v-if="showBody && (bioOverride || summary || bio)"
          class="preview__body"
        >
          <div class="preview__line">{{ bioOverride || summary || bio }}</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'

type Props = {
  avatarUrl?: string
  displayName?: string
  handle?: string
  summary?: string
  bio?: string

  /** Optional override for the primary bio line. */
  bioOverride?: string
  showSubtitle?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  displayName: '',
  handle: '',
  summary: '',
  bio: '',
  showSubtitle: true,
  showBody: true,
})

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_ECOSYSTEM_AVATAR_SRC
)
</script>
