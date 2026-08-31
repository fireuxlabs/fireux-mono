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

          <div v-if="showBadges && badges.length" class="preview__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showSubtitle && handle" class="preview__subtitle">
          {{ handle }}
        </div>

        <div
          v-if="
            showBody &&
            (bioOverride ||
              summary ||
              bio ||
              title ||
              profiles.length ||
              appsLabel)
          "
          class="preview__body"
        >
          <div v-if="bioOverride || summary || bio" class="preview__line">
            {{ bioOverride || summary || bio }}
          </div>

          <div
            v-if="title || profiles.length || appsLabel"
            class="preview__line text-dimmed"
          >
            <span v-if="title">{{ title }}</span>
            <span v-else-if="profiles.length">{{ profiles.join(', ') }}</span>
            <span v-if="appsLabel">
              {{ title || profiles.length ? ` · ${appsLabel}` : appsLabel }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import { USER_AVATAR_FALLBACK_SRC } from '../../composables/useUserInterface'

type Props = {
  avatarUrl?: string
  displayName?: string
  handle?: string
  badges?: string[]
  title?: string
  summary?: string
  bio?: string
  profiles?: string[]

  appsLabel?: string

  /** Optional override for the primary bio line. */
  bioOverride?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  displayName: '',
  handle: '',
  badges: () => [],
  title: '',
  summary: '',
  bio: '',
  profiles: () => [],
  appsLabel: '',
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_AVATAR_FALLBACK_SRC
)
</script>
