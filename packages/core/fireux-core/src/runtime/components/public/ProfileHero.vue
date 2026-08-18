<template>
  <header
    class="public-profile-hero"
    :data-profile-tone="tone"
    data-public-profile-hero
  >
    <div class="public-profile-hero__glow public-profile-hero__glow--top" />
    <div class="public-profile-hero__glow public-profile-hero__glow--bottom" />

    <div class="public-profile-hero__layout">
      <div class="public-profile-hero__identity">
        <div class="public-profile-hero__avatar-shell">
          <div class="public-profile-hero__avatar-aura" />
          <slot
            name="media"
            :display-name="displayName"
            :icon="icon"
            :image-url="proxiedAvatarUrl"
          >
            <UAvatar
              :src="proxiedAvatarUrl || undefined"
              :alt="displayName"
              :icon="icon"
              size="3xl"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="public-profile-hero__avatar"
            />
          </slot>
        </div>

        <div class="public-profile-hero__content">
          <div class="public-profile-hero__badges">
            <UBadge
              :label="kindLabel"
              :icon="icon"
              :color="tone"
              variant="soft"
            />
            <UBadge
              v-if="subtitle"
              :label="subtitle"
              color="neutral"
              variant="outline"
            />
            <slot name="badges" />
          </div>

          <p v-if="formattedHandle" class="public-profile-hero__handle">
            {{ formattedHandle }}
          </p>
          <h1 class="public-profile-hero__title">
            {{ displayName }}
          </h1>
          <p v-if="title" class="public-profile-hero__role">
            {{ title }}
          </p>
          <p v-if="summary" class="public-profile-hero__summary">
            {{ summary }}
          </p>
          <p
            v-if="tagline && tagline !== summary"
            class="public-profile-hero__tagline"
          >
            {{ tagline }}
          </p>

          <div v-if="cleanLabels.length" class="public-profile-hero__labels">
            <UBadge
              v-for="label in cleanLabels"
              :key="label"
              :label="label"
              color="neutral"
              variant="soft"
            />
          </div>

          <div
            v-if="userProfileTo || $slots.actions"
            class="public-profile-hero__actions"
          >
            <UButton
              v-if="userProfileTo"
              :to="userProfileTo"
              label="User profile"
              icon="i-lucide-user-round"
              color="neutral"
              variant="soft"
            />
            <slot name="actions" />
          </div>
        </div>
      </div>

      <div v-if="stats.length" class="public-profile-hero__stats">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="public-profile-hero__stat"
        >
          <UIcon :name="stat.icon" class="public-profile-hero__stat-icon" />
          <div class="public-profile-hero__stat-value">
            {{ stat.value }}
          </div>
          <div class="public-profile-hero__stat-label">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'
import { USER_AVATAR_FALLBACK_SRC } from '../../user/composables/useUserInterface'

defineOptions({ name: 'PublicProfileHero' })

type PublicProfileHeroStat = {
  icon: string
  label: string
  value: number | string
}

type PublicProfileTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'

const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName: string
    handle?: string
    icon: string
    kindLabel: string
    labels?: string[]
    showUserProfileLink?: boolean
    stats?: PublicProfileHeroStat[]
    subtitle?: string
    summary?: string
    tagline?: string
    title?: string
    tone?: PublicProfileTone
  }>(),
  {
    avatarUrl: '',
    handle: '',
    labels: () => [],
    showUserProfileLink: true,
    stats: () => [],
    subtitle: '',
    summary: '',
    tagline: '',
    title: '',
    tone: 'primary',
  }
)

const normalizedHandle = computed(() =>
  String(props.handle || '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase()
)
const formattedHandle = computed(() =>
  normalizedHandle.value ? `@${normalizedHandle.value}` : ''
)
const userProfileTo = computed(() =>
  props.showUserProfileLink && normalizedHandle.value
    ? `/users/${encodeURIComponent(normalizedHandle.value)}`
    : ''
)
const cleanLabels = computed(() =>
  Array.from(
    new Set(
      props.labels.map((value) => String(value || '').trim()).filter(Boolean)
    )
  )
)

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_AVATAR_FALLBACK_SRC
)
</script>

<style scoped src="./ProfileHero.css"></style>
