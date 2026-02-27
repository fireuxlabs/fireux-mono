<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="kitchen-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header="{ collapsed }">
        <div class="px-2 py-2">
          <div
            v-if="pillCard && (collapsed ?? false)"
            class="flex items-center justify-center"
            :title="`${pillCard.title || 'Kitchen'} · ${menuStatusLabel}`"
          >
            <UChip :color="hasActiveMenu ? 'success' : 'error'">
              <UAvatar
                :src="pillCard.imageUrl || undefined"
                icon="i-lucide-chef-hat"
                size="sm"
              />
            </UChip>
          </div>

          <KitchenCardsPill
            v-else-if="pillCard"
            v-bind="pillCard"
            :subtitle="menuStatusLabel"
            :show-subtitle="true"
            :show-badges="false"
          />
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

    <!-- Page content -->
    <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <!-- Notifications slideover controlled by shared state -->
  <LayoutsConsoleNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/app/ui/useAuthRedirect'
import { useConsoleNotifications } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleNotifications'
import { computed, ref } from 'vue'
import { useRuntimeKitchenComputed } from '../composables/fireux/app/kitchen-runtime/useRuntimeKitchenComputed'
import { useKitchenConsoleNav } from '../composables/fireux/app/routing/useKitchenConsoleNav'
import { useKitchenInterface } from '../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

defineOptions({ name: 'kitchen-console' })

const open = ref(false)
const { desktop } = useKitchenConsoleNav()
const { isOpen: isNotificationsSlideoverOpen } = useConsoleNotifications()
const { runtimeKitchen, hasActiveMenu, menuStatusLabel } = useRuntimeKitchenComputed()
const { pill } = useKitchenInterface()

const pillCard = computed(() => pill(runtimeKitchen.kitchen.value))
useAuthRedirect()
const navItems = computed(() =>
  desktop.value.filter(
    (item) =>
      item.group !== 'profiles' &&
      !item.profileId &&
      item.to !== '/console/kitchen'
  )
)
</script>
