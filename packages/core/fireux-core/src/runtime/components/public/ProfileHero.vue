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
import { USER_AVATAR_FALLBACK_SRC } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

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

<style scoped>
.public-profile-hero {
  background-image: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ui-bg) 94%, transparent),
    color-mix(in srgb, var(--ui-bg-elevated) 86%, transparent)
  );
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  box-shadow: 0 calc(var(--spacing) * 6) calc(var(--spacing) * 16)
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 8%,
      transparent
    );
  isolation: isolate;
  overflow: hidden;
  padding: calc(var(--spacing) * 6);
  position: relative;
}

.public-profile-hero__layout {
  display: grid;
  gap: calc(var(--spacing) * 8);
  position: relative;
}

.public-profile-hero__identity {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
  min-width: 0;
}

.public-profile-hero__content {
  flex: 1;
  min-width: 0;
}

.public-profile-hero__badges,
.public-profile-hero__labels,
.public-profile-hero__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}

.public-profile-hero__handle {
  color: var(--fx-profile-accent, var(--ui-primary));
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-top: calc(var(--spacing) * 4);
}

.public-profile-hero__title {
  color: var(--ui-text-highlighted);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--text-3xl--line-height);
  margin-top: var(--spacing);
  text-wrap: pretty;
}

.public-profile-hero__role {
  color: var(--ui-text-toned);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--text-lg--line-height);
  margin-top: calc(var(--spacing) * 2);
}

.public-profile-hero__summary {
  color: var(--ui-text-toned);
  font-size: var(--text-base);
  line-height: calc(var(--spacing) * 7);
  margin-top: calc(var(--spacing) * 4);
  max-width: calc(var(--spacing) * 192);
  text-wrap: pretty;
  white-space: pre-line;
}

.public-profile-hero__tagline {
  border-left: 2px solid
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 42%,
      transparent
    );
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  font-style: italic;
  line-height: calc(var(--spacing) * 6);
  margin-top: calc(var(--spacing) * 3);
  max-width: calc(var(--spacing) * 160);
  padding-left: calc(var(--spacing) * 3);
}

.public-profile-hero__labels {
  margin-top: calc(var(--spacing) * 5);
}

.public-profile-hero__actions {
  margin-top: calc(var(--spacing) * 6);
}

.public-profile-hero__glow {
  border-radius: 9999px;
  pointer-events: none;
  position: absolute;
}

.public-profile-hero__glow--top {
  background: radial-gradient(
    circle,
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 22%,
      transparent
    ),
    transparent 68%
  );
  height: calc(var(--spacing) * 104);
  right: calc(var(--spacing) * -28);
  top: calc(var(--spacing) * -72);
  width: calc(var(--spacing) * 104);
}

.public-profile-hero__glow--bottom {
  background: radial-gradient(
    circle,
    color-mix(
      in srgb,
      var(--fx-profile-accent, var(--ui-primary)) 12%,
      transparent
    ),
    transparent 70%
  );
  bottom: calc(var(--spacing) * -60);
  height: calc(var(--spacing) * 80);
  left: 14%;
  width: calc(var(--spacing) * 80);
}

.public-profile-hero__avatar-shell {
  align-self: center;
  flex: none;
  position: relative;
  width: fit-content;
}

.public-profile-hero__avatar-aura {
  background: color-mix(
    in srgb,
    var(--fx-profile-accent, var(--ui-primary)) 14%,
    transparent
  );
  border-radius: 9999px;
  filter: blur(calc(var(--spacing) * 4));
  inset: calc(var(--spacing) * -3);
  position: absolute;
}

.public-profile-hero__avatar {
  box-shadow: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 10)
    color-mix(in srgb, var(--ui-bg-inverted) 18%, transparent);
  flex: none;
  height: calc(var(--spacing) * 28);
  position: relative;
  width: calc(var(--spacing) * 28);
}

.public-profile-hero__avatar::after {
  border: calc(var(--spacing) * 1) solid var(--ui-bg);
  border-radius: inherit;
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.public-profile-hero__stats {
  display: grid;
  gap: calc(var(--spacing) * 2);
  grid-template-columns: repeat(
    auto-fit,
    minmax(calc(var(--spacing) * 22), 1fr)
  );
  width: 100%;
}

.public-profile-hero__stat {
  align-content: center;
  backdrop-filter: blur(calc(var(--spacing) * 2));
  background: color-mix(in srgb, var(--ui-bg) 72%, transparent);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  display: grid;
  min-height: calc(var(--spacing) * 25);
  padding: calc(var(--spacing) * 3);
  text-align: center;
}

.public-profile-hero__stat-icon {
  color: var(--fx-profile-accent, var(--ui-primary));
  height: calc(var(--spacing) * 4);
  margin: 0 auto calc(var(--spacing) * 2);
  width: calc(var(--spacing) * 4);
}

.public-profile-hero__stat-value {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--text-xl--line-height);
}

.public-profile-hero__stat-label {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: calc(var(--spacing) * 4);
  margin-top: calc(var(--spacing) * 0.5);
}

@media (min-width: 40rem) {
  .public-profile-hero {
    padding: calc(var(--spacing) * 8);
  }

  .public-profile-hero__identity {
    align-items: flex-start;
    flex-direction: row;
  }

  .public-profile-hero__avatar-shell {
    align-self: auto;
  }

  .public-profile-hero__title {
    font-size: var(--text-4xl);
    line-height: var(--text-4xl--line-height);
  }

  .public-profile-hero__role {
    font-size: var(--text-xl);
    line-height: var(--text-xl--line-height);
  }

  .public-profile-hero__summary {
    font-size: var(--text-lg);
    line-height: calc(var(--spacing) * 7);
  }
}

@media (min-width: 64rem) {
  .public-profile-hero {
    padding: calc(var(--spacing) * 10);
  }

  .public-profile-hero__layout {
    align-items: end;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .public-profile-hero__stats {
    grid-template-columns: minmax(0, 1fr);
    width: calc(var(--spacing) * 72);
  }

  .public-profile-hero__title {
    font-size: var(--text-5xl);
    line-height: var(--text-5xl--line-height);
  }
}
</style>
