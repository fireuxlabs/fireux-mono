<!-- packages/core/fireux-core/src/runtime/layouts/dashboard.vue -->
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <LayoutsConsoleProfilesMenu />
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
import { useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardNav } from '../composables/fireux/app/routing/useDashboardNav'
import { useNavGrouping } from '../composables/fireux/app/ui/nav/useNavGrouping'
import { useAuthRedirect } from '../composables/fireux/app/ui/useAuthRedirect'
import { useConsoleNotifications } from '../composables/fireux/app/ui/useConsoleNotifications'

defineOptions({ name: 'dashboard' })

const open = ref(false)
const route = useRoute()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { desktop, topPriority, baseNavFilter } = useDashboardNav()

useAuthRedirect()

const routeProfileId = computed(
  () => (route.meta as { nav?: { profileId?: string } }).nav?.profileId ?? null
)

watch(
  routeProfileId,
  (value: string | null) => {
    if (value && activeProfileState.value !== value) {
      activeProfileState.value = value
    }
  },
  { immediate: true }
)

const activeProfileId = computed(() => activeProfileState.value)

const profileExtras = computed(() => {
  const profileId = activeProfileId.value
  if (!profileId) return []
  return desktop.value
    .filter((item) => item.group !== 'profiles')
    .filter((item) => item.profileId === profileId)
})

const { topNav, middleNav, bottomNav } = useNavGrouping(desktop, {
  topPriority,
  filter: baseNavFilter,
  extras: profileExtras,
})
</script>
