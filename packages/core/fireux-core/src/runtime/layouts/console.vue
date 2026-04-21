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
import { useRoute } from '#imports'
import { computed, ref } from 'vue'
import { useConsoleNav } from '../composables/fireux/app/ui/nav/useConsoleNav'
import {
  useConsoleHeaders,
  type ConsoleHeaderData as HeaderData,
} from '../composables/fireux/console/useConsoleHeader'

defineOptions({ name: 'console' })

const normalizeString = (value: unknown) => String(value ?? '').trim()

const open = ref(false)
const isNotificationsSlideoverOpen = ref(false)
const consoleNav = useConsoleNav()
const topNav = computed(() =>
  consoleNav.desktop.value.filter((item) => consoleNav.resolveItemPosition(item) === 'top')
)
const middleNav = computed(() =>
  consoleNav.desktop.value.filter((item) => consoleNav.resolveItemPosition(item) === 'middle')
)
const familyRootNav = computed(() =>
  consoleNav.desktop.value.filter((item) => consoleNav.resolveItemPosition(item) === 'bottom')
)

const route = useRoute()
const family = computed(() => {
  const candidate = String(route.path || '').match(/^\/console\/([^/]+)/)?.[1] || ''
  return candidate === 'kitchen' ? 'kitchens' : candidate
})

const consoleHeaders = useConsoleHeaders()

const header = computed<HeaderData>(() => {
  return consoleHeaders.value[normalizeString(family.value)] ?? null
})

const hasSelection = computed(() => Boolean(header.value))
</script>
