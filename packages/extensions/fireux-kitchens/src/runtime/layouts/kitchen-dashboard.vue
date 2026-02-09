<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="kitchen-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="space-y-3">
          <LayoutsDashboardProfilesMenu />

          <div class="flex items-center justify-between gap-2 px-2 py-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">Kitchen Dashboard</p>
              <p class="truncate text-xs text-dimmed">Operational workspace</p>
            </div>

            <UButton
              to="/dashboard"
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-arrow-left"
              aria-label="Back to app dashboard"
            />
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-3">
          <UNavigationMenu
            v-if="topNav.length"
            :collapsed="collapsed ?? false"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator v-if="topNav.length && (middleNav.length || bottomNav.length)" />

          <UNavigationMenu
            v-if="middleNav.length"
            :collapsed="collapsed ?? false"
            :items="middleNav"
            orientation="vertical"
          />

          <USeparator v-if="middleNav.length && bottomNav.length" />

          <UNavigationMenu
            v-if="bottomNav.length"
            :collapsed="collapsed ?? false"
            :items="bottomNav"
            orientation="vertical"
          />

          <div class="lg:hidden">
            <USeparator
              v-if="topNav.length || middleNav.length || bottomNav.length"
            />

            <div class="pt-3">
              <LayoutsDashboardSidebarFooterActions
                :collapsed="collapsed ?? false"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsDashboardSidebarFooterActions
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="h-screen w-full overflow-y-auto bg-elevated/50 p-0 lg:p-4">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <LayoutsDashboardNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useNavGrouping } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNavGrouping'
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/app/ui/useAuthRedirect'
import { useDashboardNotifications } from 'fireux-core/runtime/composables/fireux/app/ui/useDashboardNotifications'
import { ref } from 'vue'
import { useKitchenDashboardNav } from '../composables/fireux/app/routing/useKitchenDashboardNav'

defineOptions({ name: 'kitchen-dashboard' })

const open = ref(false)
const { desktop } = useKitchenDashboardNav()
const { isOpen: isNotificationsSlideoverOpen } = useDashboardNotifications()

type NavItem = (typeof desktop.value)[number]

useAuthRedirect()

const TOP_PRIORITY = [{ key: 'dashboard-kitchen-home', to: '/dashboard/kitchen' }]

const baseNavFilter = (item: NavItem) =>
  item.group !== 'profiles' && !item.profileId

const { topNav, middleNav, bottomNav } = useNavGrouping(desktop, {
  topPriority: TOP_PRIORITY,
  filter: baseNavFilter,
})
</script>
