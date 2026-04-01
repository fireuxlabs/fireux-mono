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
        <div class="min-h-11" />
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
            <USeparator v-if="topNav.length || middleNav.length || bottomNav.length" />

            <div class="pt-3">
              <LayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsSharedSideBarFooter
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

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useConsoleNav } from '../composables/fireux/app/routing/useConsoleNav'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'

defineOptions({ name: 'console' })

function normalizePath(value: unknown): string {
  return String(value || '').trim().replace(/\/+$/, '')
}

const open = ref(false)
const route = useRoute()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop } = useConsoleNav()
const isConsoleEntryPage = computed(() => Boolean(route.meta?.consoleEntry))

const consoleNav = computed(() => {
  const currentPath = normalizePath(route.path)
  const scopeMatch = currentPath.match(/^\/console\/([^/]+)(?:\/.*)?$/)
  if (!scopeMatch) return desktop.value

  const scopeRoot = `/console/${scopeMatch[1]}`
  const createPath = `${scopeRoot}/create`
  const isScopeRoot = currentPath === scopeRoot
  const isCreateRoute = currentPath === createPath

  return desktop.value.filter((item) => {
    const path = normalizePath(item.to)
    if (!path.startsWith('/console/')) return true
    if (path === scopeRoot) return false
    if (!path.startsWith(`${scopeRoot}/`)) return false
    if (isScopeRoot) return path === createPath
    if (isCreateRoute) return path === createPath
    return true
  })
})

const { topNav, middleNav, bottomNav } = useNavGrouping(consoleNav)
</script>
