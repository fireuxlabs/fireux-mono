<!-- packages/core/fireux-core/src/runtime/layouts/console.vue -->
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="px-2 py-2">
          <UButton
            to="/dashboard"
            icon="i-lucide-layout-dashboard"
            label="Dashboard"
            color="neutral"
            variant="ghost"
            block
          />
        </div>
      </template>

      <!-- Main nav -->
      <template #default="{ collapsed }">
        <div class="flex flex-col gap-3">
          <UNavigationMenu
            v-if="topNav.length"
            :collapsed="collapsed ?? false"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator
            v-if="topNav.length && (middleNav.length || bottomNav.length)"
          />

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

          <!-- Mobile-only footer controls (shown inside the slideover) -->
          <div class="lg:hidden">
            <USeparator
              v-if="topNav.length || middleNav.length || bottomNav.length"
            />

            <div class="pt-3">
              <LayoutsConsoleSidebarFooterActions
                :collapsed="collapsed ?? false"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Bottom: user menu -->
      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsConsoleSidebarFooterActions
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <!-- Notifications slideover controlled by shared state -->
  <LayoutsConsoleNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useConsoleNav } from '../composables/fireux/app/routing/presets'
import { useRuntimeProjectSelection } from '../composables/fireux/app/runtime-project'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useAuthRedirect } from '../composables/fireux/app/ui/useAuthRedirect'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'

defineOptions({ name: 'console' })

const open = ref(false)
const route = useRoute()
const projectSelection = useRuntimeProjectSelection()

const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop, topPriority, baseNavFilter } = useConsoleNav()

const shouldRedirectToAuth = computed(() => {
  const path = String(route.path || '')
  if (path.startsWith('/console/projects') && projectSelection.runtimeProjectMode.value !== 'live') {
    return false
  }
  return true
})

useAuthRedirect({ enabled: shouldRedirectToAuth })

const { topNav, middleNav, bottomNav } = useNavGrouping(desktop, {
  topPriority,
  filter: baseNavFilter,
})
</script>
