<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="kitchen-dashboard"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="flex items-center justify-between gap-2 px-2 py-2">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">Kitchen Dashboard</p>
            <p class="truncate text-xs text-dimmed">Operational workspace</p>
          </div>

          <UButton
            to="/dashboard"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-arrow-left"
            aria-label="Back to app dashboard"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          v-if="desktop.length"
          :collapsed="collapsed ?? false"
          :items="desktop"
          orientation="vertical"
        />
      </template>
    </UDashboardSidebar>

    <div class="h-screen w-full overflow-y-auto bg-elevated/50 p-0 lg:p-4">
      <NuxtPage />
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/fireux/app/ui/nav/useNav'

defineOptions({ name: 'kitchen-dashboard' })

const open = ref(false)
const { desktop } = useNav(['kitchen-dashboard'])
</script>
