<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: keep the profile control aligned with sidebar collapse state. -->
<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <UDashboardSidebar
      id="core-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="workspace-shell__sidebar"
    >
      <template #header="{ collapsed }">
        <LayoutsDashboardProfilesMenu :collapsed="collapsed ?? false" />
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
          <LayoutsSharedSideBarFooter
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <main class="workspace-shell__canvas">
      <NuxtPage />
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
import { useAuthRedirect } from '../user/composables/useAuthRedirect'
import { useWorkspaceNotifications } from '../composables/fireux/workspace/useWorkspaceNotifications'

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
