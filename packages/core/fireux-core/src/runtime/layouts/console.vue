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
          <div v-if="hasSelection && header" class="px-1">
            <UDropdownMenu
              v-if="hasHeaderSelector"
              :items="header.selectorItems"
              :content="{ align: 'start', collisionPadding: 12 }"
              :ui="{ content: 'w-64' }"
            >
              <UButton
                color="neutral"
                variant="ghost"
                class="min-h-11 w-full justify-start px-1"
                :ui="{ label: 'min-w-0 flex-1' }"
              >
                <template #leading>
                  <UAvatar :src="header.imageUrl || undefined" :alt="header.title" size="sm" />
                </template>

                <span class="min-w-0 flex-1 text-left">
                  <span class="block truncate text-sm font-semibold text-highlighted">
                    {{ header.title }}
                  </span>
                  <span v-if="header.subtitle" class="block truncate text-xs text-toned">
                    {{ header.subtitle }}
                  </span>
                </span>

                <template #trailing>
                  <UIcon name="i-lucide-chevrons-up-down" class="size-4 shrink-0 text-muted" />
                </template>
              </UButton>
            </UDropdownMenu>

            <div v-else class="flex min-h-11 items-center gap-3">
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
      <UDashboardPanel v-if="selectionBlocked" id="console-selection-required">
        <template #header>
          <LayoutsConsoleNavbar :title="selectionRequiredTitle" />
        </template>

        <template #body>
          <section class="flex min-h-[55vh] items-center">
            <UAlert
              class="w-full max-w-2xl"
              color="neutral"
              variant="subtle"
              icon="i-lucide-list-checks"
              :title="selectionRequiredTitle"
              :description="selectionRequiredDescription"
              :actions="[
                {
                  label: selectionRequiredActionLabel,
                  to: familyPath,
                  icon: 'i-lucide-arrow-right',
                },
              ]"
            />
          </section>
        </template>
      </UDashboardPanel>

      <NuxtPage v-else />
    </div>
  </UDashboardGroup>

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed, ref } from 'vue'
import {
  consoleFamilyFromPath,
  toConsoleFamilyLabel,
  toConsoleFamilyPath,
} from '../composables/fireux/app/routing/consoleRoutes'
import { useConsoleNav } from '../composables/fireux/app/ui/nav/useConsoleNav'
import { useConsole } from '../composables/fireux/app/console/useConsole'
import {
  useConsoleHeaders,
  type ConsoleHeaderData as HeaderData,
} from '../composables/fireux/app/console/useConsoleHeader'

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
const family = computed(() => consoleFamilyFromPath(String(route.path || '')))
const familyLabel = computed(() => toConsoleFamilyLabel(family.value) || 'Console')
const familyPath = computed(() => family.value ? toConsoleFamilyPath(family.value) : '/console')
const activeSelectionId = computed(() => {
  const activeFamily = family.value
  if (!activeFamily) return ''
  return useConsole(activeFamily).selectedId.value
})
const requiresSelection = computed(() => {
  const nav = route.meta.nav as Record<string, unknown> | undefined
  return route.meta.requiresSelection === true || nav?.requiresSelection === true
})
const selectionBlocked = computed(() =>
  requiresSelection.value && !normalizeString(activeSelectionId.value)
)
const selectionRequiredTitle = computed(() => `Select ${familyLabel.value} first`)
const selectionRequiredDescription = computed(() =>
  `This console page needs an active ${familyLabel.value.toLowerCase()} before it can load.`
)
const selectionRequiredActionLabel = computed(() => `Choose ${familyLabel.value}`)

const consoleHeaders = useConsoleHeaders()

const header = computed<HeaderData>(() => {
  return consoleHeaders.value[normalizeString(family.value)] ?? null
})

const hasSelection = computed(() => Boolean(header.value))
const hasHeaderSelector = computed(() =>
  Boolean(header.value?.selectorItems?.some((group) => group.length))
)
</script>
