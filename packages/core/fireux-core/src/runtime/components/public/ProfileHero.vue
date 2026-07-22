<template>
  <header
    class="public-profile-hero relative isolate overflow-hidden rounded-3xl border border-default px-5 py-8 shadow-2xl shadow-primary/5 sm:px-8 sm:py-10 lg:px-10"
    data-public-profile-hero
  >
    <div class="public-profile-hero__glow public-profile-hero__glow--top" />
    <div class="public-profile-hero__glow public-profile-hero__glow--bottom" />

    <div class="public-profile-hero__layout relative grid gap-8">
      <div class="public-profile-hero__identity flex min-w-0 flex-col gap-6">
        <div class="public-profile-hero__avatar-shell relative shrink-0">
          <div class="absolute -inset-3 rounded-full bg-primary/10 blur-xl" />
          <UAvatar
            :src="proxiedAvatarUrl || undefined"
            :alt="displayName"
            :icon="icon"
            size="3xl"
            class="public-profile-hero__avatar relative ring-4 ring-default shadow-xl"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :label="kindLabel"
              :icon="icon"
              color="primary"
              variant="soft"
            />
            <UBadge
              v-if="subtitle"
              :label="subtitle"
              color="neutral"
              variant="outline"
            />
          </div>

          <p
            v-if="formattedHandle"
            class="mt-4 text-sm font-medium text-primary"
          >
            {{ formattedHandle }}
          </p>
          <h1
            class="mt-1 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl"
          >
            {{ displayName }}
          </h1>
          <p
            v-if="title"
            class="mt-2 text-lg font-medium text-toned sm:text-xl"
          >
            {{ title }}
          </p>
          <p
            v-if="summary"
            class="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-toned sm:text-lg"
          >
            {{ summary }}
          </p>
          <p
            v-if="tagline && tagline !== summary"
            class="mt-3 max-w-2xl border-l-2 border-primary/40 pl-3 text-sm italic leading-6 text-muted"
          >
            {{ tagline }}
          </p>

          <div v-if="cleanLabels.length" class="mt-5 flex flex-wrap gap-2">
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
            class="mt-6 flex flex-wrap gap-2"
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
          class="rounded-2xl border border-default bg-default/70 p-3 text-center backdrop-blur"
        >
          <UIcon :name="stat.icon" class="mx-auto mb-2 size-4 text-primary" />
          <div class="text-xl font-semibold text-highlighted">
            {{ stat.value }}
          </div>
          <div class="mt-0.5 text-xs leading-4 text-muted">
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

const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName: string
    handle?: string
    icon: string
    kindLabel: string
    labels?: string[]
    stats?: PublicProfileHeroStat[]
    subtitle?: string
    summary?: string
    tagline?: string
    title?: string
  }>(),
  {
    avatarUrl: '',
    handle: '',
    labels: () => [],
    stats: () => [],
    subtitle: '',
    summary: '',
    tagline: '',
    title: '',
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
  normalizedHandle.value
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
  padding: calc(var(--spacing) * 8);
  background-image: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ui-bg) 94%, transparent),
    color-mix(in srgb, var(--ui-bg-elevated) 86%, transparent)
  );
}

.public-profile-hero__glow {
  border-radius: 9999px;
  pointer-events: none;
  position: absolute;
}

.public-profile-hero__glow--top {
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-primary) 22%, transparent),
    transparent 68%
  );
  height: 26rem;
  right: -7rem;
  top: -18rem;
  width: 26rem;
}

.public-profile-hero__glow--bottom {
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-primary) 12%, transparent),
    transparent 70%
  );
  bottom: -15rem;
  height: 20rem;
  left: 14%;
  width: 20rem;
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

.public-profile-hero__layout {
  gap: calc(var(--spacing) * 8);
}

.public-profile-hero__identity {
  gap: calc(var(--spacing) * 6);
}

.public-profile-hero__avatar-shell {
  width: fit-content;
  align-self: center;
}

.public-profile-hero__avatar {
  width: calc(var(--spacing) * 28);
  height: calc(var(--spacing) * 28);
  flex: none;
}

@media (min-width: 40rem) {
  .public-profile-hero__identity {
    flex-direction: row;
    align-items: flex-start;
  }

  .public-profile-hero__avatar-shell {
    align-self: auto;
  }
}

@media (min-width: 64rem) {
  .public-profile-hero {
    padding: calc(var(--spacing) * 10);
  }

  .public-profile-hero__layout {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .public-profile-hero__stats {
    width: calc(var(--spacing) * 72);
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
