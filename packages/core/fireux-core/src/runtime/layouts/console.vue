<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-console"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header="{ collapsed }">
        <div class="px-2 py-2">
          <div class="flex min-h-11 items-center px-1">
            <NuxtLink
              v-if="collapsed"
              to="/"
              class="mx-auto inline-flex"
              aria-label="Home"
            >
              <AppBrandLogo size="small" alt="FireUX" />
            </NuxtLink>
            <NuxtLink v-else to="/" class="inline-flex" aria-label="Home">
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
import { computed, ref, watch } from 'vue'
import {
  consoleFamilyFromPath,
  toConsoleFamilyLabel,
  toConsoleFamilyPath,
} from '../composables/fireux/app/routing/consoleRoutes'
import { useConsoleNav } from '../composables/fireux/app/ui/nav/useConsoleNav'
import { useConsole } from '../composables/fireux/app/console/useConsole'
import { useConsoleSelection } from '../composables/fireux/app/console/useConsoleSelection'

defineOptions({ name: 'console' })

const normalizeString = (value: unknown) => String(value ?? '').trim()

const open = ref(false)
const isNotificationsSlideoverOpen = ref(false)
const consoleNav = useConsoleNav()
const consoleRoot = useConsole()
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
  return useConsoleSelection(activeFamily).selectedId.value
})
const configuredTargetIds = computed(() =>
  family.value ? consoleRoot.targetIds(family.value) : []
)
const requiresSelection = computed(() => {
  const nav = route.meta.nav as Record<string, unknown> | undefined
  return route.meta.requiresSelection === true || nav?.requiresSelection === true
})
watch(
  () => ({
    activeFamily: family.value,
    selectedId: normalizeString(activeSelectionId.value),
    requiresSelection: requiresSelection.value,
    targetIds: configuredTargetIds.value,
  }),
  (state: {
    activeFamily: string
    selectedId: string
    requiresSelection: boolean
    targetIds: string[]
  }) => {
    const onlyTargetId = normalizeString(state.targetIds[0])
    if (!state.activeFamily) return
    if (!state.requiresSelection) return
    if (!consoleRoot.isTenant) return
    if (state.selectedId) return
    if (state.targetIds.length !== 1 || !onlyTargetId) return

    useConsoleSelection(state.activeFamily).selectTarget(onlyTargetId)
  },
  { immediate: true }
)
const selectionBlocked = computed(() =>
  requiresSelection.value && !normalizeString(activeSelectionId.value)
)
const selectionRequiredTitle = computed(() => `Select ${familyLabel.value} first`)
const selectionRequiredDescription = computed(() =>
  `This console page needs an active ${familyLabel.value.toLowerCase()} before it can load.`
)
const selectionRequiredActionLabel = computed(() => `Choose ${familyLabel.value}`)

</script>
