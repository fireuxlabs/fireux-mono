<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: keep the profile control aligned with sidebar collapse state. -->
<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <UDashboardSidebar
      id="core-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="workspace-sidebar"
      :ui="{
        body: 'workspace-sidebar__body',
      }"
    >
      <template #header="{ collapsed }">
        <div class="workspace-sidebar__brand">
          <FireLayoutsDashboardProfileButton
            v-if="!collapsed"
            :collapsed="false"
          />
          <UDashboardSidebarCollapse
            :class="
              collapsed
                ? 'workspace-sidebar__toggle--compact'
                : 'workspace-sidebar__toggle'
            "
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="workspace-sidebar__navigation">
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
        </div>
      </template>

      <template #footer="{ collapsed }">
        <FireLayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
      </template>
    </UDashboardSidebar>

    <div class="fx-dashboard-content">
      <slot />
    </div>
  </UDashboardGroup>

  <FireLayoutsSharedRoleBadge />

  <FireLayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardNav } from '../composables/navigation/useDashboardNav'
import { useNavGrouping } from '../composables/navigation/useNavGrouping'
import { useAuthRedirect } from '../composables/fireux/firebase/useAuthRedirect'
import { useUserNotifications } from '../user/composables/notifications/useUserNotifications'

defineOptions({ name: 'dashboard' })

const open = ref(false)
const route = useRoute()

const { isOpen: isNotificationsSlideoverOpen } = useUserNotifications()
const { desktop, baseNavFilter, resolveItemPosition } = useDashboardNav()
useAuthRedirect()

const routeProfileId = computed(
  () => (route.meta as { nav?: { profileId?: string } }).nav?.profileId ?? null
)
const profileExtras = computed(() => {
  const profileId = routeProfileId.value
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
