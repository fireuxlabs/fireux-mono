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
      <!-- Top: profile switcher (self-hides when unnecessary) -->
      <template #header>
        <LayoutsDashboardProfilesMenu />
      </template>

      <!-- Main nav -->
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="primary"
          orientation="vertical"
        />
      </template>

      <!-- Bottom: user menu -->
      <template #footer>
        <OrganismsUserCardsPill
          v-if="pillUser"
          :user="pillUser"
          class="w-full"
        />
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardNav } from '../composables/fireUX/nav/presets'
import { useUser } from '../composables/firestore/core/user/useUser'
import type { UserCard } from '../models/core/user.model.ts'

defineOptions({ name: 'CoreDashboard' })

const open = ref(false)
const { desktop } = useDashboardNav()
const { isAdmin, user, pillProps } = useUser()

const pillUser = computed<UserCard.Pill | undefined>(() => {
  const current = user.value
  if (!current) return undefined
  const { badges: _badges, ...rest } = pillProps(current)
  return {
    ...rest,
    badges: [],
    to: '/dashboard/user-profile',
  }
})

// Show only non-profile items in the main nav; child manages profiles.
const primary = computed(() =>
  desktop.value
    .filter((i) => i.group !== 'profiles')
    .filter((item) => {
      if (item.key === 'dashboard-app' || item.to === '/dashboard/app') {
        return isAdmin.value
      }
      return true
    })
)
</script>
