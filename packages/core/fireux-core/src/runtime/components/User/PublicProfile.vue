<template>
  <section
    class="public-profile-hub"
    data-profile-tone="user"
    data-public-profile="user"
  >
    <PublicProfileHero
      kind-label="Profile"
      icon="i-lucide-badge-check"
      tone="secondary"
      :avatar-url="avatarUrl"
      :display-name="displayName"
      :handle="handle"
      :summary="heroSummary"
      :stats="profileStats"
      :show-user-profile-link="false"
    >
      <template #badges>
        <UserAccessBadge v-if="isSelf" :tier="accessTier" />
      </template>

      <template #actions>
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
      </template>
    </PublicProfileHero>

    <UPageCard
      v-if="profileLinks.length"
      as="section"
      variant="subtle"
      class="rounded-3xl"
      :ui="{ container: 'p-5 sm:p-7 lg:p-8' }"
    >
      <div class="flex flex-wrap items-end justify-between gap-3">
        <PublicProfileSectionHeading
          eyebrow="Professional identity"
          icon="i-lucide-layers-3"
          :title="`Explore ${firstName}’s profiles`"
        />
        <p class="text-xs text-muted">Choose a specialist view</p>
      </div>

      <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UPageCard
          v-for="profile in profileLinks"
          :key="profile.key"
          :to="profile.to"
          :icon="profile.icon"
          :title="profile.label"
          :description="profile.description"
          :spotlight-color="profile.tone"
          spotlight
          variant="outline"
          class="rounded-2xl"
        >
          <template #footer>
            <span
              class="inline-flex items-center gap-1 text-xs font-medium text-toned"
            >
              Open {{ profile.label.toLowerCase() }}
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
            </span>
          </template>
        </UPageCard>
      </div>
    </UPageCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserAccessTier } from '../../composables/fireux/firestore/core/user/utils/view/useUserPermissions'

type PublicProfileTone = 'primary' | 'success' | 'info' | 'warning'

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

const heroSummary = computed(
  () =>
    String(props.bio || '').trim() ||
    'Explore the specialist profiles below for experience, credentials, and work.'
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
    tone: 'primary' as PublicProfileTone,
  },
  chef: {
    label: 'Chef',
    description: 'Culinary identity, strengths, and kitchen experience.',
    icon: 'i-lucide-chef-hat',
    route: (routeKey: string) => `/chefs/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View chef profile',
    priority: 20,
    tone: 'warning' as PublicProfileTone,
  },
  agent: {
    label: 'Agent',
    description: 'Hiring, placement, and organisation profile.',
    icon: 'i-lucide-handshake',
    route: (routeKey: string) => `/agents/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View agent profile',
    priority: 30,
    tone: 'info' as PublicProfileTone,
  },
  driver: {
    label: 'Driver',
    description: 'Delivery work and operational identity.',
    icon: 'i-lucide-truck',
    route: (routeKey: string) => `/drivers/${encodeURIComponent(routeKey)}`,
    actionLabel: 'View driver profile',
    priority: 40,
    tone: 'success' as PublicProfileTone,
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
        tone: definition.tone,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((left, right) => left.priority - right.priority)
})

const primaryProfile = computed(() => profileLinks.value[0] ?? null)
const profileStats = computed(() =>
  profileLinks.value.length
    ? [
        {
          label:
            profileLinks.value.length === 1
              ? 'Specialist profile'
              : 'Specialist profiles',
          value: profileLinks.value.length,
          icon: 'i-lucide-layers-3',
        },
      ]
    : []
)
</script>
