<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="granite-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header="{ collapsed }">
        <div class="px-2 py-2">
          <div v-if="collapsed ?? false" class="flex justify-center">
            <UAvatar icon="i-lucide-building-2" size="sm" />
          </div>

          <div v-else class="space-y-1">
            <div class="text-sm font-semibold">Granite</div>
            <div class="text-xs text-dimmed">Rock Solid OS</div>
            <div class="rounded border border-default px-2 py-1 text-xs">
              <div>
                Portfolio: <span class="font-mono">{{ runtimeId || 'unset' }}</span>
              </div>
              <div>
                Mode: <span class="font-medium">{{ runtimeMode }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-3">
          <UNavigationMenu
            v-if="navItems.length"
            :collapsed="collapsed ?? false"
            :items="navItems"
            orientation="vertical"
          />

          <div class="lg:hidden">
            <USeparator v-if="navItems.length" />

            <div class="pt-3">
              <LayoutsConsoleSidebarFooterActions :collapsed="collapsed ?? false" />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsConsoleSidebarFooterActions :collapsed="collapsed ?? false" compact-profile />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <LayoutsConsoleNotificationsSlideover v-model:open="isNotificationsSlideoverOpen" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/app/ui/useAuthRedirect'
import { useConsoleNotifications } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleNotifications'
import { useRuntimePortfolio } from 'fireux-properties/runtime/composables/fireux/app/portfolio-runtime/useRuntimePortfolio'
import { useGraniteConsoleNav } from '../composables/fireux/app/routing/useGraniteConsoleNav'

defineOptions({ name: 'granite-console' })

const open = ref(false)
const { desktop } = useGraniteConsoleNav()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const runtimePortfolio = useRuntimePortfolio()

useAuthRedirect()

const navItems = computed(() =>
  desktop.value.filter((item) => item.group === 'granite' || item.to === '/console/portfolio')
)

const runtimeId = computed(() => runtimePortfolio.id.value)
const runtimeMode = computed(() => runtimePortfolio.mode.value)
</script>
