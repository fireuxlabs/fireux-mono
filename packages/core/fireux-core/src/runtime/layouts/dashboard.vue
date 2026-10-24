<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: keep the profile control aligned with sidebar collapse state. -->
<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <UDashboardSidebar
      id="core-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="h-svh max-h-svh border-r-0"
      :ui="{
        body: 'min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex min-h-11 items-center gap-2 px-3 py-2">
          <LayoutsDashboardProfilesMenu
            v-if="!collapsed"
            :collapsed="false"
            class="min-w-0 flex-1"
          />
          <UDashboardSidebarCollapse
            :class="collapsed ? 'mx-auto' : 'ml-auto'"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex h-full min-h-full flex-col gap-3">
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

          <div class="mt-auto lg:hidden">
            <USeparator
              v-if="topNav.length || middleNav.length || bottomNav.length"
            />

            <div class="pt-3">
              <LayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
        </div>
      </template>
    </UDashboardSidebar>

    <main
      class="m-4 flex min-w-0 flex-1 overflow-y-auto rounded-lg bg-default/75 shadow-sm ring ring-default [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:ml-0"
    >
      <!-- Dashboard panels can render fragments, which cannot take page transitions. -->
      <NuxtPage :transition="false" />
    </main>
  </UDashboardGroup>

  <LayoutsSharedRoleBadge />

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardNav } from '../composables/navigation/useDashboardNav'
import { useNavGrouping } from '../composables/navigation/useNavGrouping'
import { useAuthRedirect } from '../composables/fireux/firebase/useAuthRedirect'
import { useWorkspaceNotifications } from '../workspace/composables/useWorkspaceNotifications'

defineOptions({ name: 'dashboard' })

const open = ref(false)
const route = useRoute()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const { isOpen: isNotificationsSlideoverOpen } = useWorkspaceNotifications()
const { desktop, baseNavFilter, resolveItemPosition } = useDashboardNav()
useAuthRedirect()

const routeProfileId = computed(
  () => (route.meta as { nav?: { profileId?: string } }).nav?.profileId ?? null
)
const routeNavKey = computed(
  () => (route.meta as { nav?: { key?: string } }).nav?.key ?? ''
)

watch(
  [routeProfileId, routeNavKey],
  ([value, key]: [string | null, string]) => {
    if (value && activeProfileState.value !== value) {
      activeProfileState.value = value
    } else if (
      !value &&
      (key === 'dashboard-home' || key === 'dashboard-user-profile') &&
      activeProfileState.value !== null
    ) {
      activeProfileState.value = null
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
  filter: baseNavFilter,
  extras: profileExtras,
  position: resolveItemPosition,
})
</script>
