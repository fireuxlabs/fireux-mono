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
        <div class="px-2 py-2">
          <KitchenCardsPill v-if="pillCard" v-bind="pillCard" :show-badges="false" />
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
              <LayoutsDashboardSidebarFooterActions
                :collapsed="collapsed ?? false"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden lg:flex">
          <LayoutsDashboardSidebarFooterActions
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
  <LayoutsDashboardNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/app/ui/useAuthRedirect'
import { useDashboardNotifications } from 'fireux-core/runtime/composables/fireux/app/ui/useDashboardNotifications'
import { computed, ref } from 'vue'
import { useKitchenDashboardNav } from '../composables/fireux/app/routing/useKitchenDashboardNav'
import { useRuntimeKitchen } from '../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useKitchenInterface } from '../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

defineOptions({ name: 'kitchen-dashboard' })

const open = ref(false)
const { desktop } = useKitchenDashboardNav()
const { isOpen: isNotificationsSlideoverOpen } = useDashboardNotifications()
const runtimeKitchen = useRuntimeKitchen()
const { pill } = useKitchenInterface()

const pillCard = computed(() => pill(runtimeKitchen.kitchen.value))
useAuthRedirect()
const navItems = computed(() =>
  desktop.value.filter(
    (item) =>
      item.group !== 'profiles' &&
      !item.profileId &&
      item.to !== '/dashboard/kitchen'
  )
)
</script>
