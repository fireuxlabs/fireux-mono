<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="px-2 py-2">
          <div v-if="hasSelection && header" class="flex min-h-11 items-center gap-3 px-1">
            <UAvatar :src="header.imageUrl || undefined" :alt="header.title" size="sm" />

            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-highlighted">
                {{ header.title }}
              </div>
              <div v-if="header.subtitle" class="truncate text-xs text-toned">
                {{ header.subtitle }}
              </div>
            </div>
          </div>

          <div v-else class="flex min-h-11 items-center px-1">
            <NuxtLink to="/" class="inline-flex" aria-label="Home">
              <AppBrandWordmark size="card" alt="FireUX" />
            </NuxtLink>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex h-full min-h-full flex-col gap-3">
          <UNavigationMenu
            v-if="topNav.length"
            :collapsed="collapsed ?? false"
            :items="topNav"
            orientation="vertical"
          />

          <USeparator v-if="topNav.length && middleNav.length" />

          <UNavigationMenu
            v-if="middleNav.length"
            :collapsed="collapsed ?? false"
            :items="middleNav"
            orientation="vertical"
          />

          <div class="mt-auto lg:hidden">
            <USeparator
              v-if="
                topNav.length ||
                middleNav.length ||
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
  isNotificationsSlideoverOpen,
  hasSelection,
  header,
  topNav,
  middleNav,
  familyRootNav,
} = useConsoleState()
</script>
