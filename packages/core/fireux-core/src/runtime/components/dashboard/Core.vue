<template>
  <!-- Hero + quick actions -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
    <UPageCard
      class="lg:col-span-2"
      variant="subtle"
      :ui="{ container: 'flex flex-col sm:flex-row sm:items-center gap-4' }"
    >
      <UAvatar :src="userAvatar()" :alt="userGreeting()" size="lg" />
      <div class="min-w-0 space-y-1">
        <p class="text-sm text-dimmed">Welcome back</p>
        <h2 class="text-lg font-medium truncate">{{ userGreeting() }}</h2>
        <p class="text-sm text-dimmed truncate" v-if="showHandle()">
          @{{ userHandle() }}
        </p>
      </div>
      <div class="sm:ms-auto flex flex-wrap gap-2">
        <UButton
          to="/dashboard/user-profile"
          label="Edit profile"
          color="neutral"
          size="sm"
        />
        <UButton
          to="/dashboard/settings"
          label="Preferences"
          variant="ghost"
          size="sm"
        />
        <UButton
          to="/docs/getting-started"
          label="Docs"
          variant="soft"
          size="sm"
        />
      </div>
    </UPageCard>

    <UPageCard variant="subtle">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-medium">Quick links</span>
        </div>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          :icon="link.icon"
          color="neutral"
          variant="soft"
          size="sm"
        >
          {{ link.label }}
        </UButton>
      </div>
    </UPageCard>
  </div>

  <!-- Next steps (core-only) -->
  <div class="grid grid-cols-1 gap-4">
    <UPageCard
      v-if="profileComplete < 100"
      title="Complete your profile"
      variant="subtle"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-sm text-dimmed">Profile completion</span>
          <UBadge color="neutral" variant="soft">
            {{ profileComplete }}%
          </UBadge>
        </div>
        <UProgress
          :value="profileComplete"
          :max="100"
          :ui="{ indicator: 'transition-none duration-0' }"
        />
      </div>

      <UButton
        to="/dashboard/user-profile"
        label="Edit profile"
        color="neutral"
        class="w-fit"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import { useAvatarProxy } from '../../composables/fireux/app/ui/useAvatarProxy'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { user, profileComplete } = useUser()
const { getProxiedAvatarUrl } = useAvatarProxy()

const userAvatar = () => {
  const raw = user?.value?.avatar ?? ''
  const normalized = typeof raw === 'string' ? raw.trim() : ''
  const proxied = getProxiedAvatarUrl(normalized || undefined)
  return proxied || undefined
}

const displayName = () => (user?.value?.display_name ?? '').trim()
const userHandle = () => (user?.value?.handle ?? '').trim()

const userGreeting = () => {
  const name = displayName() || userHandle()
  return name ? `Hello ${name}` : 'Hello'
}

const showHandle = () => Boolean(userHandle() && displayName())

const quickLinks = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/user-profile' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  {
    label: 'Purchases',
    icon: 'i-lucide-shopping-bag',
    to: '/dashboard/purchases',
  },
]
</script>
