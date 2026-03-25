<!-- packages/core/fireux-core/src/runtime/layouts/console.vue -->
<template>
  <NuxtPage v-if="isConsoleEntryPage" />

  <UDashboardGroup v-else unit="rem">
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

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsConsoleSidebarFooterActions
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <LayoutsConsoleNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useConsoleNav } from '../composables/fireux/app/routing/useConsoleNav'
import { filterConsoleScopeNavItems } from '../composables/fireux/app/routing/filterConsoleScopeNavItems'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'

defineOptions({ name: 'console' })

const open = ref(false)
const route = useRoute()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop } = useConsoleNav()
const isConsoleEntryPage = computed(() => Boolean(route.meta?.consoleEntry))

const filteredDesktop = computed(() =>
  filterConsoleScopeNavItems(desktop.value, String(route.path || ''))
)

const { topNav, middleNav, bottomNav } = useNavGrouping(filteredDesktop)
</script>
