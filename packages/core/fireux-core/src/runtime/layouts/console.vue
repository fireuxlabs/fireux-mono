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
          <div
            v-if="selectedConsole"
            class="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-default"
          >
            <UIcon :name="selectedConsole.icon" class="size-4 text-dimmed" />
            <span class="truncate font-medium">{{ selectedConsole.label }}</span>
          </div>

          <div v-else class="flex min-h-11 items-center px-1">
            <AppBrandWordmark
              size="card"
              alt="FireUX"
              class="opacity-70"
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
import { useCookie, useRoute } from '#imports'
import { useConsoleNav } from '../composables/fireux/app/routing/useConsoleNav'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'

defineOptions({ name: 'console' })

const open = ref(false)
const route = useRoute()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop } = useConsoleNav()
const isConsoleEntryPage = computed(() => Boolean(route.meta?.consoleEntry))
const { topNav, middleNav, bottomNav } = useNavGrouping(desktop)

const normalizeString = (value: unknown) => String(value || '').trim()

const projectSelection = useCookie<unknown>('fireux_runtime_project')
const kitchenSelection = useCookie<unknown>('fireux_runtime_kitchen')
const portfolioSelection = useCookie<unknown>('fireux_runtime_portfolio')
const supplierSelection = useCookie<unknown>('fireux_runtime_supplier')

const readSelectionId = (value: unknown) => {
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>
    return normalizeString(source.selectedId)
  }

  return ''
}

const titleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const selectedConsole = computed(() => {
  const scope = String(route.path || '').match(/^\/console\/([^/]+)/)?.[1] || ''

  if (scope === 'projects') {
    const id = readSelectionId(projectSelection.value)
    return id
      ? {
          icon: 'i-lucide-briefcase-business',
          label: titleCase(id),
        }
      : null
  }

  if (scope === 'kitchen') {
    const id = readSelectionId(kitchenSelection.value)
    return id
      ? {
          icon: 'i-lucide-chef-hat',
          label: titleCase(id),
        }
      : null
  }

  if (scope === 'portfolio') {
    const id = readSelectionId(portfolioSelection.value)
    return id
      ? {
          icon: 'i-lucide-layout-dashboard',
          label: titleCase(id),
        }
      : null
  }

  if (scope === 'supplier') {
    const id = readSelectionId(supplierSelection.value)
    return id
      ? {
          icon: 'i-lucide-truck',
          label: titleCase(id),
        }
      : null
  }

  return null
})
</script>
