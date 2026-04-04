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
            v-if="regularBottomNav.length"
            :collapsed="collapsed ?? false"
            :items="regularBottomNav"
            orientation="vertical"
          />

          <div class="lg:hidden">
            <USeparator
              v-if="topNav.length || middleNav.length || regularBottomNav.length || familyRootNav.length"
            />

            <UNavigationMenu
              v-if="familyRootNav.length"
              :collapsed="collapsed ?? false"
              :items="familyRootNav"
              orientation="vertical"
            />

            <USeparator v-if="familyRootNav.length" />

            <div class="pt-3">
              <LayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden flex-col gap-3 lg:flex">
          <UNavigationMenu
            v-if="familyRootNav.length"
            :collapsed="collapsed ?? false"
            :items="familyRootNav"
            orientation="vertical"
          />

          <USeparator v-if="familyRootNav.length" />

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
import {
  consoleFamilyFromPath,
  createDefaultRuntimeSelectionState,
  toConsoleFamilyPath,
  toConsoleSelectionStateKey,
} from '../composables/fireux/app/routing/consoleRoutes'
import { useConsoleNav } from '../composables/fireux/app/routing/useConsoleNav'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'
import type { RuntimeSelectionState } from '../composables/fireux/runtime/runtime.types'

defineOptions({ name: 'console' })

const open = ref(false)
const route = useRoute()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop } = useConsoleNav()
const isConsoleEntryPage = computed(() => Boolean(route.meta?.consoleEntry))
const { topNav, middleNav, bottomNav } = useNavGrouping(desktop)

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)
const activeFamily = computed(() => consoleFamilyFromPath(String(route.path || '')))
const activeSelection = computed(() => {
  const family = activeFamily.value
  if (!family) return null
  return useState<RuntimeSelectionState>(
    toConsoleSelectionStateKey(family),
    createDefaultRuntimeSelectionState
  ).value
})
const activeFamilyPath = computed(() =>
  activeFamily.value ? toConsoleFamilyPath(activeFamily.value) : ''
)
const selectedConsole = computed(() =>
  String(activeSelection.value?.selectedId || '').trim() ? consoleHeader.value : null
)
const familyRootNav = computed(() =>
  bottomNav.value.filter((item) => item.to === activeFamilyPath.value)
)
const regularBottomNav = computed(() =>
  bottomNav.value.filter((item) => item.to !== activeFamilyPath.value)
)
</script>
