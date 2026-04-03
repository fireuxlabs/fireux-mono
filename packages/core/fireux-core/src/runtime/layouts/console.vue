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
          <component
            :is="selectedConsole.component"
            v-if="selectedConsole"
            v-bind="selectedConsole.props"
          />

          <div v-else class="flex min-h-11 items-center px-1">
            <NuxtLink to="/" class="inline-flex" aria-label="Home">
              <AppBrandWordmark
                size="card"
                alt="FireUX"
              />
            </NuxtLink>
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
import { useRoute, useState } from '#imports'
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

type ConsoleHeaderPill = {
  component: string
  props: Record<string, unknown>
}

const projectHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-project',
  () => null
)
const kitchenHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-kitchen',
  () => null
)
const portfolioHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-portfolio',
  () => null
)
const supplierHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-supplier',
  () => null
)

const selectedConsole = computed(() => {
  const scope = String(route.path || '').match(/^\/console\/([^/]+)/)?.[1] || ''

  if (scope === 'projects') return projectHeaderPill.value
  if (scope === 'kitchen') return kitchenHeaderPill.value
  if (scope === 'portfolio') return portfolioHeaderPill.value
  if (scope === 'supplier') return supplierHeaderPill.value

  return null
})
</script>
