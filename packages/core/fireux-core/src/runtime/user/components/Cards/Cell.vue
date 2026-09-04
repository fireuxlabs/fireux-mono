<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="card card--cell"
  >
    <div class="card__media">
      <UAvatar
        :src="proxiedAvatarUrl || undefined"
        :alt="displayName"
        size="sm"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="card__subtitle">
              {{ handle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="taglineOverride">{{ taglineOverride }}</span>
          <span v-else-if="summary">{{ summary }}</span>
          <span v-else-if="appsLabel">{{ appsLabel }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="card card--cell"
    @click="onClick"
  >
    <div class="card__media">
      <UAvatar
        :src="proxiedAvatarUrl || undefined"
        :alt="displayName"
        size="sm"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="card__subtitle">
              {{ handle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__tagline">
          <span v-if="taglineOverride">{{ taglineOverride }}</span>
          <span v-else-if="summary">{{ summary }}</span>
          <span v-else-if="appsLabel">{{ appsLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import {
  USER_AVATAR_FALLBACK_SRC,
  type UserCard,
} from '../../composables/useUserView'

type Props = Partial<Pick<
  UserCard,
  | 'to'
  | 'avatarUrl'
  | 'displayName'
  | 'handle'
  | 'badges'
  | 'title'
  | 'summary'
  | 'profiles'
  | 'appsLabel'
>> & {
  /** Optional override for the tagline line. */
  taglineOverride?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<Props>(),
  {
    to: '',
    avatarUrl: '',
    displayName: '',
    handle: '',
    badges: () => [],
    title: '',
    summary: '',
    profiles: () => [],
    appsLabel: '',

    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    link: false,
    action: false,
  }
)

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(() =>
  props.avatarUrl || USER_AVATAR_FALLBACK_SRC
)
</script>
