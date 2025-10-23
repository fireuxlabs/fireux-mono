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
      <!-- Top: profiles (self-hides internally) -->
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
      <template #footer="{ collapsed }">
        <LayoutsDashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="p-4 w-full h-screen overflow-y-auto">
      <NuxtPage />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardNav } from '../composables/fireUX/nav/presets'

defineOptions({ name: 'CoreDashboard' })

const open = ref(false)
const { desktop } = useDashboardNav()

// Show only non-profile items in the main nav; child manages profiles.
const primary = computed(() =>
  desktop.value.filter((i) => i.group !== 'profiles')
)
</script>
