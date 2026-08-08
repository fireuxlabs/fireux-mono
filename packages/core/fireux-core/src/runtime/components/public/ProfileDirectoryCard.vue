<template>
  <MoleculesActionSurface
    :to="surfaceTo"
    :action="action && !surfaceTo"
    class="public-profile-directory-card group"
    :class="[
      `public-profile-directory-card--${variant}`,
      variantSurfaceClass,
    ]"
    :data-profile-tone="tone"
    @activate="emit('action')"
  >
    <div class="public-profile-directory-card__avatar">
      <UAvatarGroup
        v-if="proxiedSecondaryAvatarUrl"
        :size="variant === 'preview' ? '2xl' : 'lg'"
      >
        <UAvatar
          :src="proxiedAvatarUrl || undefined"
          :alt="displayName"
          :size="variant === 'preview' ? '2xl' : 'lg'"
          loading="lazy"
          decoding="async"
        />
        <UAvatar
          :src="proxiedSecondaryAvatarUrl || undefined"
          alt=""
          size="xs"
          loading="lazy"
          decoding="async"
        />
      </UAvatarGroup>
      <UAvatar
        v-else
        :src="proxiedAvatarUrl || undefined"
        :alt="displayName"
        :icon="icon"
        :size="variant === 'preview' ? '2xl' : 'lg'"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="public-profile-directory-card__content">
      <div class="public-profile-directory-card__header">
        <div class="min-w-0">
          <p class="public-profile-directory-card__name">
            {{ displayName }}
          </p>
          <p
            v-if="formattedHandle"
            class="public-profile-directory-card__handle"
          >
            {{ formattedHandle }}
          </p>
        </div>
        <UBadge
          v-if="variant !== 'compact'"
          :label="kindLabel"
          :icon="icon"
          :color="tone"
          variant="soft"
          size="xs"
          class="shrink-0"
        />
      </div>

      <p v-if="headline" class="public-profile-directory-card__headline">
        {{ headline }}
      </p>
      <p
        v-if="variant === 'preview' && summary"
        class="public-profile-directory-card__summary"
      >
        {{ summary }}
      </p>

      <div
        v-if="variant === 'preview' && cleanBadges.length"
        class="public-profile-directory-card__badges"
      >
        <UBadge
          v-for="badge in cleanBadges"
          :key="badge"
          :label="badge"
          color="neutral"
          variant="outline"
          size="xs"
        />
      </div>
    </div>

    <UIcon
      v-if="link && to"
      name="i-lucide-arrow-up-right"
      class="public-profile-directory-card__arrow size-4 shrink-0 text-dimmed transition"
    />
  </MoleculesActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'
import { USER_AVATAR_FALLBACK_SRC } from '../../composables/fireux/user/useUserInterface'

defineOptions({ name: 'PublicProfileDirectoryCard' })

type PublicProfileTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(
  defineProps<{
    action?: boolean
    avatarUrl?: string
    badges?: string[]
    displayName: string
    handle?: string
    headline?: string
    icon: string
    kindLabel: string
    link?: boolean
    secondaryAvatarUrl?: string
    summary?: string
    to?: string
    tone?: PublicProfileTone
    variant?: 'compact' | 'cell' | 'preview'
  }>(),
  {
    action: false,
    avatarUrl: '',
    badges: () => [],
    handle: '',
    headline: '',
    link: false,
    secondaryAvatarUrl: '',
    summary: '',
    to: '',
    tone: 'primary',
    variant: 'preview',
  }
)

const surfaceTo = computed(() =>
  !props.action && props.link && props.to ? props.to : undefined
)
const variantSurfaceClass = computed(() => {
  if (props.variant === 'compact') return 'pill'
  if (props.variant === 'cell') return 'card card--cell'
  return 'preview'
})
const formattedHandle = computed(() => {
  const handle = String(props.handle || '')
    .trim()
    .replace(/^@/, '')
  return handle ? `@${handle}` : ''
})
const cleanBadges = computed(() =>
  Array.from(
    new Set(
      props.badges.map((value) => String(value || '').trim()).filter(Boolean)
    )
  ).slice(0, 5)
)

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_AVATAR_FALLBACK_SRC
)
const proxiedSecondaryAvatarUrl = useProxiedAvatar(() => {
  const secondary = String(props.secondaryAvatarUrl || '').trim()
  return secondary && secondary !== props.avatarUrl ? secondary : ''
})
</script>

<style scoped>
.public-profile-directory-card {
  --fx-card-accent: var(--fx-profile-accent, var(--ui-primary));

  color: inherit;
  display: flex;
  font: inherit;
  min-width: 0;
  text-decoration: none;
  width: 100%;
}

.public-profile-directory-card--compact {
  align-items: center;
  max-width: 18rem;
}

.public-profile-directory-card--cell {
  align-items: center;
  min-height: calc(var(--spacing) * 20);
}

.public-profile-directory-card--preview {
  align-items: flex-start;
  gap: calc(var(--spacing) * 4);
  min-height: calc(var(--spacing) * 36);
  padding: calc(var(--spacing) * 5);
}

.public-profile-directory-card__avatar {
  flex: none;
}

.public-profile-directory-card__avatar > :where(span) {
  box-shadow:
    0 0 0 2px var(--ui-bg-elevated),
    0 0 0 3px color-mix(in srgb, var(--fx-card-accent) 34%, var(--ui-border)),
    var(--fx-elevation-low);
}

.public-profile-directory-card__content {
  min-width: 0;
  flex: 1;
}

.public-profile-directory-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}

.public-profile-directory-card__name {
  overflow: hidden;
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.public-profile-directory-card__handle {
  overflow: hidden;
  margin: var(--spacing) 0 0;
  color: var(--fx-card-accent);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.public-profile-directory-card__headline {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-snug);
}

.public-profile-directory-card__summary {
  display: -webkit-box;
  overflow: hidden;
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.public-profile-directory-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.5);
  margin-top: calc(var(--spacing) * 4);
}

.public-profile-directory-card--preview .public-profile-directory-card__name {
  font-size: var(--text-lg);
}

.public-profile-directory-card:not([data-action-surface='static']) {
  cursor: pointer;
}

.public-profile-directory-card:not([data-action-surface='static']):hover
  .public-profile-directory-card__arrow,
.public-profile-directory-card:not([data-action-surface='static']):focus-visible
  .public-profile-directory-card__arrow {
  color: var(--fx-profile-accent, var(--ui-primary));
}

</style>
