<template>
  <NuxtPage v-if="isConsoleEntryPage" />

  <UDashboardGroup v-else unit="rem">
    <UDashboardSidebar
      id="core-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="px-2 py-2">
          <LayoutsConsoleHeaderPill
            v-if="hasSelection && header"
            :image-url="header.imageUrl"
            :title="header.title"
            :subtitle="header.subtitle"
          />

          <div v-else class="flex min-h-11 items-center px-1">
            <NuxtLink to="/" class="inline-flex" aria-label="Home">
              <AppBrandWordmark size="card" alt="FireUX" />
            </NuxtLink>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-3">
          <UNavigationMenu
            v-if="topNav.length"
            :collapsed="collapsed ?? false"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator
            v-if="
              topNav.length && (middleNav.length || regularBottomNav.length)
            "
          />

          <UNavigationMenu
            v-if="middleNav.length"
            :collapsed="collapsed ?? false"
            :items="middleNav"
            orientation="vertical"
          />

          <USeparator v-if="middleNav.length && regularBottomNav.length" />

          <UNavigationMenu
            v-if="regularBottomNav.length"
            :collapsed="collapsed ?? false"
            :items="regularBottomNav"
            orientation="vertical"
          />

          <div class="lg:hidden">
            <USeparator
              v-if="
                topNav.length ||
                middleNav.length ||
                regularBottomNav.length ||
                familyRootNav.length
              "
            />

            <UNavigationMenu
              v-if="familyRootNav.length"
              :collapsed="collapsed ?? false"
              :items="familyRootNav"
              orientation="vertical"
            />

            <USeparator v-if="familyRootNav.length" />

            <div class="pt-3">
              <LayoutsSharedSideBarFooter :collapsed="collapsed ?? false" />
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="hidden flex-col gap-3 lg:flex">
          <UNavigationMenu
            v-if="familyRootNav.length"
            :collapsed="collapsed ?? false"
            :items="familyRootNav"
            orientation="vertical"
          />

          <USeparator v-if="familyRootNav.length" />

          <LayoutsSharedSideBarFooter
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="h-screen w-full overflow-y-auto bg-elevated/50 p-0 lg:p-4">
      <NuxtPage />
    </div>
  </UDashboardGroup>

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useConsoleState } from '../composables/fireux/console/useConsoleState'

defineOptions({ name: 'console' })

const {
  open,
  isConsoleEntryPage,
  isNotificationsSlideoverOpen,
  hasSelection,
  header,
  topNav,
  middleNav,
  familyRootNav,
  regularBottomNav,
} = useConsoleState()
</script>
