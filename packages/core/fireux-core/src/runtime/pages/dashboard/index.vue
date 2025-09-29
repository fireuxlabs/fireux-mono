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

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <LayoutsDashboardHomeDateRangePicker v-model="range" class="-ms-1" />

          <LayoutsDashboardHomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
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
          <UAvatar
            :src="(user as any)?.app?.avatar || (user as any)?.app?.photoURL"
            :alt="(user as any)?.app?.displayName || 'User'"
            size="lg"
          />
          <div class="min-w-0">
            <p class="text-sm text-dimmed">Welcome back</p>
            <h2 class="text-lg font-medium truncate">
              {{
                (user as any)?.app?.displayName ||
                (user as any)?.app?.name ||
                'there'
              }}
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

      <LayoutsDashboardHomeStats :period="period" :range="range" />
      <LayoutsDashboardHomeChart :period="period" :range="range" />
      <LayoutsDashboardHomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, reactive } from 'vue'

// Local lightweight types to avoid external deps
type Period = 'daily' | 'weekly' | 'monthly'
type Range = { start: Date; end: Date }

definePageMeta({ layout: 'dashboard' })
const { isNotificationsSlideoverOpen } = useDashboard()
const { user } = useUser()
const config = useRuntimeConfig()

const appName = computed(() => (config as any)?.public?.appName ?? 'FireUX')
const appEnv = computed(
  () =>
    (config as any)?.public?.appEnv ?? (import.meta.env.MODE || 'development')
)
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

// Compute last 14 days without date-fns
const range = shallowRef<Range>({
  start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  end: new Date(),
})
const period = ref<Period>('daily')
</script>
