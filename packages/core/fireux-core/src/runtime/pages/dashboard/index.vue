<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
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
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <UPageCard
          title="Complete your profile"
          description="Set your public identity (name, handle, bio)."
          variant="subtle"
        >
          <UButton
            to="/dashboard/user-profile"
            label="Edit profile"
            color="neutral"
            class="w-fit"
          />
        </UPageCard>

        <UPageCard
          title="Set preferences"
          description="Language, theme, security alerts, analytics."
          variant="subtle"
        >
          <UButton
            to="/dashboard/settings"
            label="Open settings"
            color="neutral"
            class="w-fit"
          />
        </UPageCard>

        <UPageCard
          title="Explore"
          description="Return to the app home to browse what's available."
          variant="subtle"
        >
          <UButton to="/" label="Go to FireUX.app" variant="soft" class="w-fit" />
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Notifications slideover controlled by local ref -->
  <LayoutsDashboardNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { definePageMeta, useState } from '#imports'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

// Local notifications slideover state (was useDashboard)
const isNotificationsSlideoverOpen = useState<boolean>(
  'fireux-core:dashboard:notifs-open',
  () => false
)
const { user } = useUser()

const userAvatar = () => {
  const raw = user?.value?.avatar ?? ''
  const normalized = typeof raw === 'string' ? raw.trim() : ''
  return normalized || undefined
}

const displayName = () => (user?.value?.display_name ?? '').trim()
const userHandle = () => (user?.value?.handle ?? '').trim()
const userGreeting = () => {
  const name = displayName() || userHandle()
  return name ? `Hello ${name}` : 'Hello'
}
const showHandle = () => Boolean(userHandle() && displayName())
// Keep dashboard lightweight; avoid runtime config dependencies

const quickLinks = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/user-profile' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  {
    label: 'Purchases',
    icon: 'i-lucide-shopping-bag',
    to: '/dashboard/purchases',
  },
]

const items = [
  [
    {
      label: 'New task (coming soon)',
      icon: 'i-lucide-plus',
      disabled: true,
    },
    {
      label: 'Support (coming soon)',
      icon: 'i-lucide-life-buoy',
      disabled: true,
    },
  ],
] as const
</script>
