<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
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
          <UAvatar :src="userAvatar" :alt="userGreeting" size="lg" />
          <div class="min-w-0 space-y-1">
            <p class="text-sm text-dimmed">Welcome back</p>
            <h2 class="text-lg font-medium truncate">{{ userGreeting }}</h2>
            <p class="text-sm text-dimmed truncate" v-if="userHandle">
              @{{ userHandle }}
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

      <!-- Health & progress -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <UPageCard v-for="stat in stats" :key="stat.label" variant="subtle">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-dimmed">{{ stat.label }}</p>
              <p class="text-2xl font-semibold">{{ stat.value }}</p>
            </div>
            <UIcon :name="stat.icon" class="size-6 text-dimmed" />
          </div>
          <p v-if="stat.hint" class="text-xs text-dimmed mt-2">
            {{ stat.hint }}
          </p>
        </UPageCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <UPageCard class="xl:col-span-2" variant="subtle">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">Today</span>
              <UBadge label="In progress" variant="soft" />
            </div>
          </template>
          <ul class="space-y-3">
            <li
              v-for="item in today"
              :key="item.label"
              class="flex items-start gap-3"
            >
              <UIcon :name="item.icon" class="mt-0.5 text-dimmed" />
              <div class="min-w-0">
                <p class="text-sm font-medium leading-tight">
                  {{ item.label }}
                </p>
                <p class="text-xs text-dimmed">{{ item.detail }}</p>
              </div>
              <UBadge
                v-if="item.badge"
                :label="item.badge"
                variant="outline"
                class="ms-auto"
              />
            </li>
          </ul>
        </UPageCard>

        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">Recent activity</span>
            </div>
          </template>
          <ul class="space-y-3">
            <li
              v-for="entry in recent"
              :key="entry.label"
              class="flex items-start gap-3"
            >
              <UIcon :name="entry.icon" class="mt-0.5 text-dimmed" />
              <div class="min-w-0">
                <p class="text-sm font-medium leading-tight">
                  {{ entry.label }}
                </p>
                <p class="text-xs text-dimmed">{{ entry.detail }}</p>
              </div>
              <span class="text-xs text-dimmed ms-auto">{{ entry.when }}</span>
            </li>
          </ul>
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
import { definePageMeta } from '#imports'
// Removed duplicate definePageMeta declaration
import { useUser } from '../../composables/fireux/firestore/core/user/useUser.ts'

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
const isNotificationsSlideoverOpen = ref(false)
const { user } = useUser()
const userAvatar = computed(() => {
  const raw = user?.value?.avatar ?? ''
  const normalized = typeof raw === 'string' ? raw.trim() : ''
  return normalized || undefined
})
// TODO(fallback-review): Confirm we really want to greet with "there" when identity metadata is missing
const userGreeting = computed(() => user?.value?.display_name ?? '')
const userHandle = computed(() => user?.value?.handle ?? '')
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

const stats = [
  {
    label: 'Open tasks',
    value: '3',
    icon: 'i-lucide-list-todo',
    hint: 'Finish today',
  },
  { label: 'Messages', value: '5', icon: 'i-lucide-mail', hint: '2 unread' },
  {
    label: 'Meetings',
    value: '1',
    icon: 'i-lucide-calendar-clock',
    hint: 'Next in 2h',
  },
  {
    label: 'Checklist',
    value: '4/6',
    icon: 'i-lucide-clipboard-check',
    hint: 'Keep momentum',
  },
]

const today = [
  {
    label: 'Complete onboarding checklist',
    detail: 'Docs, profile, billing, notifications',
    icon: 'i-lucide-rocket',
    badge: 'Priority',
  },
  {
    label: 'Review notifications',
    detail: 'Respond to pending requests and approvals',
    icon: 'i-lucide-bell',
    badge: 'Today',
  },
  {
    label: 'Update profile visibility',
    detail: 'Add a short bio and headline',
    icon: 'i-lucide-user-round',
  },
]

const recent = [
  {
    label: 'Profile updated',
    detail: 'Added avatar and headline',
    icon: 'i-lucide-user-cog',
    when: '2h ago',
  },
  {
    label: 'New message',
    detail: 'Support replied to your ticket',
    icon: 'i-lucide-message-circle',
    when: '5h ago',
  },
  {
    label: 'Settings saved',
    detail: 'Notification preferences refreshed',
    icon: 'i-lucide-settings-2',
    when: '1d ago',
  },
]

const items = [
  [
    {
      label: 'New task',
      icon: 'i-lucide-plus',
      to: '/dashboard/tasks',
    },
    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      to: '/support',
    },
  ],
] satisfies DropdownMenuItem[][]
</script>
