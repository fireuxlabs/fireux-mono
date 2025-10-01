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
        <!-- Only render if we have any 'profiles' nav items -->
        <LayoutsDashboardProfilesMenu v-if="profiles.length" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="primary"
          orientation="vertical"
        />
      </template>
    </UDashboardSidebar>

    <!-- Page content -->
    <div class="p-4 w-full">
      <NuxtPage />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNav } from '../composables/app/nav'

defineOptions({ name: 'CoreDashboard' })

const open = ref(false)
const { desktop } = useNav(['dashboard'])

// Separate primary vs. profiles (profiles header shown only when any exist)
const profiles = computed(() =>
  desktop.value.filter((i) => i.group === 'profiles')
)
const primary = computed(() =>
  desktop.value.filter((i) => i.group !== 'profiles')
)
</script>
