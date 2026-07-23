<template>
  <MoleculesActionSurface
    :to="surfaceTo"
    :action="action && !surfaceTo"
    class="public-profile-directory-card group"
    :class="`public-profile-directory-card--${variant}`"
    :data-profile-tone="tone"
    @activate="emit('action')"
  >
    <div class="public-profile-directory-card__avatar">
      <UAvatarGroup
        v-if="proxiedSecondaryAvatarUrl"
        :size="variant === 'compact' ? 'lg' : '2xl'"
      >
        <UAvatar
          :src="proxiedAvatarUrl || undefined"
          :alt="displayName"
          :size="variant === 'compact' ? 'lg' : '2xl'"
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
        :size="variant === 'compact' ? 'lg' : '2xl'"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate font-semibold text-highlighted">
            {{ displayName }}
          </p>
          <p
            v-if="formattedHandle"
            class="mt-0.5 truncate text-xs font-medium text-primary"
          >
            {{ formattedHandle }}
          </p>
        </div>
        <UBadge
          v-if="variant === 'card'"
          :label="kindLabel"
          :icon="icon"
          :color="tone"
          variant="soft"
          size="xs"
          class="shrink-0"
        />
      </div>

      <p v-if="headline" class="mt-2 text-sm font-medium text-toned">
        {{ headline }}
      </p>
      <p
        v-if="variant === 'card' && summary"
        class="public-profile-directory-card__summary mt-2 text-xs leading-5 text-muted"
      >
        {{ summary }}
      </p>

      <div
        v-if="variant === 'card' && cleanBadges.length"
        class="mt-4 flex flex-wrap gap-1.5"
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
import { USER_AVATAR_FALLBACK_SRC } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

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
    variant?: 'compact' | 'card'
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
    variant: 'card',
  }
)

const surfaceTo = computed(() =>
  !props.action && props.link && props.to ? props.to : undefined
)
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
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(
        in srgb,
        var(--fx-profile-accent, var(--ui-primary)) 10%,
        transparent
      ),
      transparent 38%
    ),
    var(--ui-bg);
  border: 1px solid var(--ui-border);
  color: inherit;
  display: flex;
  font: inherit;
  min-width: 0;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
  width: 100%;
}

.public-profile-directory-card--compact {
  align-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  gap: calc(var(--spacing) * 3);
  min-height: calc(var(--spacing) * 17);
  padding: calc(var(--spacing) * 3);
}

.public-profile-directory-card--card {
  align-items: flex-start;
  border-radius: calc(var(--ui-radius) * 3);
  gap: calc(var(--spacing) * 4);
  min-height: calc(var(--spacing) * 36);
  padding: calc(var(--spacing) * 5);
}

.public-profile-directory-card__avatar {
  flex: none;
}

.public-profile-directory-card__summary {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.public-profile-directory-card:not([data-action-surface='static']) {
  cursor: pointer;
}

.public-profile-directory-card:not([data-action-surface='static']):hover,
.public-profile-directory-card:not([data-action-surface='static']):focus-visible {
  border-color: color-mix(
    in srgb,
    var(--fx-profile-accent, var(--ui-primary)) 42%,
    var(--ui-border)
  );
  box-shadow: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 9)
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 9%,
      transparent
    );
  transform: translateY(-2px);
}

.public-profile-directory-card:not([data-action-surface='static']):hover
  .public-profile-directory-card__arrow,
.public-profile-directory-card:not([data-action-surface='static']):focus-visible
  .public-profile-directory-card__arrow {
  color: var(--fx-profile-accent, var(--ui-primary));
}

@media (prefers-reduced-motion: reduce) {
  .public-profile-directory-card {
    transition: none;
  }

  .public-profile-directory-card:not([data-action-surface='static']):hover,
  .public-profile-directory-card:not([data-action-surface='static']):focus-visible {
    transform: none;
  }
}
</style>
