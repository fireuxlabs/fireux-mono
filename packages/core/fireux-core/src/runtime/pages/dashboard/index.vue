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
      <!-- Welcome & quick start primitives -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <!-- Welcome card -->
        <UPageCard
          class="lg:col-span-2"
          variant="subtle"
          :ui="{ container: 'flex flex-col sm:flex-row sm:items-center gap-4' }"
        >
          <UAvatar :src="userAvatar" :alt="userGreeting" size="lg" />
          <div class="min-w-0">
            <p class="text-sm text-dimmed">Welcome back</p>
            <h2 class="text-lg font-medium truncate">
              {{ userGreeting }}
            </h2>
            <p class="text-sm text-dimmed mt-1 truncate">
              {{ appName }}<span v-if="appEnv"> · {{ appEnv }}</span
              ><span v-if="appVersion"> · v{{ appVersion }}</span>
            </p>
          </div>
          <div class="sm:ms-auto flex gap-2">
            <UButton
              to="/dashboard/user-profile"
              label="Edit profile"
              color="neutral"
            />
            <UButton
              to="/dashboard/settings"
              label="Settings"
              variant="ghost"
            />
          </div>
        </UPageCard>

        <!-- Quick links -->
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

      <!-- At a glance (super simple placeholders) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <UPageCard variant="subtle">
          <div class="flex items-center justify-between">
            <span class="text-sm text-dimmed">Followers</span>
            <UBadge :label="String(counts.followers)" variant="subtle" />
          </div>
        </UPageCard>
        <UPageCard variant="subtle">
          <div class="flex items-center justify-between">
            <span class="text-sm text-dimmed">Favorites</span>
            <UBadge :label="String(counts.favorites)" variant="subtle" />
          </div>
        </UPageCard>
        <UPageCard variant="subtle">
          <div class="flex items-center justify-between">
            <span class="text-sm text-dimmed">Purchases</span>
            <UBadge :label="String(counts.purchases)" variant="subtle" />
          </div>
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
// Removed duplicate definePageMeta declaration
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, reactive, ref } from 'vue'

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

// Nuxt app auto-imports are not visible to package TS, declare lightweight types
declare function useRuntimeConfig(): any
declare function useUser(): { user: any }

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
const config = useRuntimeConfig()

const appName = computed(() => (config as any)?.public?.appName ?? 'FireUX')
const appEnv = computed(() => {
  const value = (config as any)?.public?.appEnv
  if (!value) {
    throw new Error('[dashboard] runtimeConfig.public.appEnv missing')
  }
  return value
})
const appVersion = computed(
  () => (config as any)?.public?.appVersion ?? undefined
)

const quickLinks = [
  { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/user-profile' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  {
    label: 'Purchases',
    icon: 'i-lucide-shopping-bag',
    to: '/dashboard/purchases',
  },
]

const counts = reactive({ followers: 0, favorites: 0, purchases: 0 })

const items = [
  [
    {
      label: 'New mail',
      icon: 'i-lucide-send',
      to: '/inbox',
    },
    {
      label: 'New customer',
      icon: 'i-lucide-user-plus',
      to: '/customers',
    },
  ],
] satisfies DropdownMenuItem[][]
</script>
