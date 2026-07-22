<!-- Concurrent edit — 2026-07-22 16:02 CEST — Public profile presentation: give canonical User identity a polished specialist-profile hub. -->
<template>
  <section
    class="user-public-profile relative isolate overflow-hidden rounded-3xl border border-default bg-default shadow-2xl shadow-primary/5"
    data-public-profile="user"
  >
    <div class="user-public-profile__glow user-public-profile__glow--primary" />
    <div
      class="user-public-profile__glow user-public-profile__glow--secondary"
    />

    <header
      class="user-public-profile__header relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
    >
      <div class="user-public-profile__layout flex flex-col gap-7">
        <div class="user-public-profile__avatar-shell relative shrink-0">
          <div class="absolute -inset-3 rounded-full bg-primary/10 blur-xl" />
          <UAvatar
            :src="proxiedAvatarUrl || undefined"
            :alt="displayName"
            icon="i-lucide-user-round"
            size="3xl"
            class="user-public-profile__avatar relative ring-4 ring-default shadow-xl"
          />
        </div>

        <div class="user-public-profile__identity min-w-0 flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              label="Profile"
              icon="i-lucide-badge-check"
              color="primary"
              variant="soft"
            />
            <UserAccessBadge v-if="isSelf" :tier="accessTier" />
          </div>

          <div>
            <p v-if="handle" class="text-sm font-medium text-primary">
              {{ handle }}
            </p>
            <h1
              class="mt-1 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl"
            >
              {{ displayName }}
            </h1>
          </div>

          <p
            v-if="bio"
            class="max-w-3xl text-base leading-7 text-toned sm:text-lg"
          >
            {{ bio }}
          </p>
          <p v-else class="max-w-2xl text-sm leading-6 text-muted">
            Explore the specialist profiles below for experience, credentials,
            and work.
          </p>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="primaryProfile"
              :to="primaryProfile.to"
              :label="primaryProfile.actionLabel"
              :icon="primaryProfile.icon"
              trailing-icon="i-lucide-arrow-up-right"
            />
            <UButton
              v-if="isSelf"
              to="/dashboard/user-profile"
              label="Edit profile"
              icon="i-lucide-pencil"
              color="neutral"
              variant="soft"
            />
          </div>
        </div>

        <div
          v-if="profileLinks.length"
          class="user-public-profile__stats grid w-full shrink-0 grid-cols-2 gap-3"
        >
          <div
            class="rounded-2xl border border-default bg-default/70 px-4 py-3 backdrop-blur"
          >
            <div class="text-2xl font-semibold text-highlighted">
              {{ profileLinks.length }}
            </div>
            <div class="text-xs text-muted">
              {{
                profileLinks.length === 1
                  ? 'specialist profile'
                  : 'specialist profiles'
              }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="profileLinks.length"
      class="user-public-profile__directory relative border-t border-default bg-elevated/45 px-5 py-6 sm:px-8 lg:px-10"
    >
      <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p class="fx-type-label">Professional identity</p>
          <h2 class="mt-1 text-xl font-semibold text-highlighted">
            Explore {{ firstName }}’s profiles
          </h2>
        </div>
        <p class="text-xs text-muted">Explore each profile</p>
      </div>

      <div
        class="user-public-profile__links grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <NuxtLink
          v-for="profile in profileLinks"
          :key="profile.key"
          :to="profile.to"
          class="group flex min-h-36 flex-col justify-between rounded-2xl border border-default bg-default/85 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-inverted"
            >
              <UIcon :name="profile.icon" class="size-5" />
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 text-dimmed transition group-hover:text-primary"
            />
          </div>
          <div class="mt-5">
            <h3 class="font-semibold text-highlighted">{{ profile.label }}</h3>
            <p class="mt-1 text-xs leading-5 text-muted">
              {{ profile.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'
import { USER_AVATAR_FALLBACK_SRC } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { UserAccessTier } from '../../composables/fireux/firestore/core/user/utils/view/useUserPermissions'

const props = withDefaults(
  defineProps<{
    userId: string
    avatarUrl?: string
    displayName: string
    handle?: string
    bio?: string
    profiles?: string[]
    isSelf?: boolean
    accessTier?: UserAccessTier | null
  }>(),
  {
    avatarUrl: '',
    handle: '',
    bio: '',
    profiles: () => [],
    isSelf: false,
    accessTier: null,
  }
)

const firstName = computed(
  () => props.displayName.trim().split(/\s+/u)[0] || 'this person'
)

const { useProxiedAvatar } = useAvatarProxy()
const proxiedAvatarUrl = useProxiedAvatar(
  () => props.avatarUrl || USER_AVATAR_FALLBACK_SRC
)

const profileDefinitions = {
  professional: {
    label: 'Professional',
    description: 'Experience, languages, education, and credentials.',
    icon: 'i-lucide-briefcase-business',
    route: (routeKey: string) =>
      `/professionals/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View professional portfolio',
    priority: 10,
  },
  chef: {
    label: 'Chef',
    description: 'Culinary identity, strengths, and kitchen experience.',
    icon: 'i-lucide-chef-hat',
    route: (routeKey: string) => `/chefs/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View chef profile',
    priority: 20,
  },
  agent: {
    label: 'Agent',
    description: 'Hiring, placement, and organisation profile.',
    icon: 'i-lucide-handshake',
    route: (routeKey: string) => `/agents/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View agent profile',
    priority: 30,
  },
  driver: {
    label: 'Driver',
    description: 'Delivery work and operational identity.',
    icon: 'i-lucide-truck',
    route: (routeKey: string) => `/drivers/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View driver profile',
    priority: 40,
  },
} as const

const profileLinks = computed(() => {
  const uniqueProfiles = Array.from(
    new Set(
      props.profiles.map((profile) =>
        String(profile || '')
          .trim()
          .toLowerCase()
      )
    )
  )

  return uniqueProfiles
    .map((key) => {
      const definition =
        profileDefinitions[key as keyof typeof profileDefinitions]
      const routeKey =
        String(props.handle || '')
          .trim()
          .replace(/^@/, '') || props.userId
      if (!definition || !routeKey) return null
      return {
        key,
        label: definition.label,
        description: definition.description,
        icon: definition.icon,
        to: definition.route(routeKey),
        actionLabel: definition.actionLabel,
        priority: definition.priority,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => left.priority - right.priority)
})

const primaryProfile = computed(() => profileLinks.value[0] ?? null)
</script>

<style scoped>
.user-public-profile {
  background-image: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ui-bg) 92%, transparent),
    color-mix(in srgb, var(--ui-bg-elevated) 88%, transparent)
  );
}

.user-public-profile__glow {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(1px);
  opacity: 0.8;
}

.user-public-profile__glow--primary {
  width: 24rem;
  height: 24rem;
  top: -16rem;
  right: -8rem;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-primary) 20%, transparent),
    transparent 68%
  );
}

.user-public-profile__glow--secondary {
  width: 18rem;
  height: 18rem;
  bottom: -13rem;
  left: 8%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-primary) 10%, transparent),
    transparent 70%
  );
}

.user-public-profile__avatar-shell {
  width: fit-content;
  align-self: center;
}

.user-public-profile__avatar {
  width: calc(var(--spacing) * 28);
  height: calc(var(--spacing) * 28);
  flex: none;
}

.user-public-profile__identity,
.user-public-profile__stats {
  width: 100%;
}

.user-public-profile__header {
  padding: calc(var(--spacing) * 8);
}

.user-public-profile__layout {
  gap: calc(var(--spacing) * 7);
}

.user-public-profile__directory {
  padding: calc(var(--spacing) * 6) calc(var(--spacing) * 8);
}

@media (min-width: 48rem) {
  .user-public-profile__layout {
    flex-direction: row;
    align-items: center;
  }

  .user-public-profile__avatar-shell {
    align-self: auto;
  }

  .user-public-profile__stats {
    width: auto;
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 64rem) {
  .user-public-profile__header {
    padding: calc(var(--spacing) * 10);
  }

  .user-public-profile__directory {
    padding-right: calc(var(--spacing) * 10);
    padding-left: calc(var(--spacing) * 10);
  }

  .user-public-profile__links {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
