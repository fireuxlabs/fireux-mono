<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="core-workspace"
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
        <div class="flex h-full min-h-0 flex-col gap-3 overflow-y-auto">
          <UNavigationMenu
            v-if="topNavItems.length"
            :collapsed="collapsed ?? false"
            :items="topNavItems"
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
              v-if="topNav.length || middleNav.length || familyRootNav.length"
            />

            <UNavigationMenu
              v-if="regularFamilyRootNav.length"
              :collapsed="collapsed ?? false"
              :items="regularFamilyRootNav"
              orientation="vertical"
            />

            <div v-if="prominentFamilyRootNav.length" class="space-y-2 px-2">
              <UButton
                v-for="item in prominentFamilyRootNav"
                :key="item.key || item.to"
                :to="item.to"
                :icon="item.icon"
                :aria-label="item.label"
                color="primary"
                variant="solid"
                size="lg"
                class="w-full bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 ring-1 ring-inset ring-white/20 hover:brightness-110"
                :class="collapsed ? 'justify-center' : 'justify-start'"
              >
                <span v-if="!collapsed">{{ item.label }}</span>
              </UButton>
            </div>

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
            v-if="regularFamilyRootNav.length"
            :collapsed="collapsed ?? false"
            :items="regularFamilyRootNav"
            orientation="vertical"
          />

          <div v-if="prominentFamilyRootNav.length" class="space-y-2 px-2">
            <UButton
              v-for="item in prominentFamilyRootNav"
              :key="item.key || item.to"
              :to="item.to"
              :icon="item.icon"
              :aria-label="item.label"
              color="primary"
              variant="solid"
              size="lg"
              class="w-full bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 shadow-lg shadow-primary-500/25 ring-1 ring-inset ring-white/20 hover:brightness-110"
              :class="collapsed ? 'justify-center' : 'justify-start'"
            >
              <span v-if="!collapsed">{{ item.label }}</span>
            </UButton>
          </div>

          <USeparator v-if="familyRootNav.length" />

          <LayoutsSharedSideBarFooter
            :collapsed="collapsed ?? false"
            compact-profile
          />
        </div>
      </template>
    </UDashboardSidebar>

    <div class="h-screen w-full overflow-y-auto bg-elevated/50 p-0 lg:p-4">
      <UDashboardPanel
        v-if="selectionAccessPending"
        id="workspace-selection-pending"
      >
        <template #header>
          <LayoutsWorkspaceNavbar :title="`Checking ${familyLabel} access`" />
        </template>

        <template #body>
          <section class="flex min-h-[55vh] items-center">
            <UAlert
              class="w-full max-w-2xl"
              color="neutral"
              variant="subtle"
              icon="i-lucide-loader-circle"
              :title="`Checking ${familyLabel} access`"
              description="The selected workspace is being verified before this page opens."
            />
          </section>
        </template>
      </UDashboardPanel>

      <UDashboardPanel
        v-else-if="selectionAccessError"
        id="workspace-selection-unavailable"
      >
        <template #header>
          <LayoutsWorkspaceNavbar
            :title="`${familyLabel} access unavailable`"
          />
        </template>

        <template #body>
          <section class="flex min-h-[55vh] items-center">
            <UAlert
              class="w-full max-w-2xl"
              color="error"
              variant="subtle"
              icon="i-lucide-triangle-alert"
              :title="`${familyLabel} access could not be verified`"
              description="This protected workspace page stays closed until access can be verified."
            >
              <template #actions>
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-refresh-cw"
                  @click="refreshTargetAccess"
                >
                  Retry
                </UButton>
              </template>
            </UAlert>
          </section>
        </template>
      </UDashboardPanel>

      <UDashboardPanel
        v-else-if="selectionBlocked"
        id="workspace-selection-required"
      >
        <template #header>
          <LayoutsWorkspaceNavbar :title="selectionRequiredTitle" />
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

      <NuxtErrorBoundary v-else>
        <slot />

        <template #error="{ clearError: clearPageError }">
          <UDashboardPanel id="workspace-page-unavailable">
            <template #header>
              <LayoutsWorkspaceNavbar :title="`${familyLabel} unavailable`" />
            </template>

            <template #body>
              <section class="flex min-h-[55vh] items-center">
                <UAlert
                  class="w-full max-w-2xl"
                  color="error"
                  variant="subtle"
                  icon="i-lucide-triangle-alert"
                  :title="`${familyLabel} page unavailable`"
                  description="This page could not be loaded. The rest of the Workspace is still available."
                >
                  <template #actions>
                    <UButton
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-refresh-cw"
                      @click="clearPageError"
                    >
                      Retry
                    </UButton>
                  </template>
                </UAlert>
              </section>
            </template>
          </UDashboardPanel>
        </template>
      </NuxtErrorBoundary>
    </div>
  </UDashboardGroup>

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: share the notification slideover owner across workspace and dashboard.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: pre-create family workspace and selection state for layout guards.
import { useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import {
  workspaceOperationFromPath,
  workspaceFamilyFromRouteContext,
  toWorkspaceFamilyLabel,
  toWorkspaceFamilyPath,
} from '../composables/fireux/workspace/workspaceRoutes'
import { useWorkspaceNav } from '../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspace } from '../composables/fireux/workspace/useWorkspace'
import { useWorkspaceNotifications } from '../composables/fireux/workspace/useWorkspaceNotifications'
import { useWorkspaceRouteTargetAccess } from '../composables/fireux/workspace/useWorkspaceRouteTargetAccess'
defineOptions({ name: 'workspace' })

const open = ref(false)
const { isOpen: isNotificationsSlideoverOpen } = useWorkspaceNotifications()
const workspaceNav = useWorkspaceNav()
const workspaceRoot = useWorkspace()
const route = useRoute()
const family = computed(
  () =>
    workspaceFamilyFromRouteContext(
      String(route.path || ''),
      route.query.family
    ) || workspaceRoot.activeFamily.value
)
const requiresSelection = computed(() => {
  const nav = route.meta.nav as Record<string, unknown> | undefined
  return (
    route.meta.requiresSelection === true || nav?.requiresSelection === true
  )
})
const topNav = computed(() =>
  workspaceNav.desktop.value.filter(
    (item) => workspaceNav.resolveItemPosition(item) === 'top'
  )
)
const topNavItems = computed(() => {
  const groups = new Map<string, typeof topNav.value>()

  for (const item of topNav.value) {
    const label = String(item.group || '').trim()
    const items = groups.get(label) || []
    items.push(item)
    groups.set(label, items)
  }

  if (groups.size === 1 && groups.has('')) return topNav.value

  return Array.from(groups.entries()).flatMap(([label, items]) =>
    label ? [{ label, type: 'label' as const }, ...items] : items
  )
})
const middleNav = computed(() =>
  workspaceNav.desktop.value.filter(
    (item) => workspaceNav.resolveItemPosition(item) === 'middle'
  )
)
const familyRootNav = computed(() =>
  workspaceNav.desktop.value.filter(
    (item) => workspaceNav.resolveItemPosition(item) === 'bottom'
  )
)
const regularFamilyRootNav = computed(() =>
  familyRootNav.value.filter((item) => !item.prominent)
)
const prominentFamilyRootNav = computed(() =>
  familyRootNav.value.filter((item) => item.prominent)
)

watch(
  () => String(route.path || ''),
  (path) => {
    const routeFamily = workspaceFamilyFromRouteContext(
      path,
      route.query.family
    )
    if (!routeFamily) return
    workspaceRoot.setActiveContext(
      routeFamily,
      workspaceOperationFromPath(path)
    )
  },
  { immediate: true }
)
const familyLabel = computed(
  () => toWorkspaceFamilyLabel(family.value) || 'Workspace'
)
const familyPath = computed(() => {
  const configuredEntry = familyRootNav.value.find(
    (item) => item.key === `workspace-${family.value}`
  )?.to
  return configuredEntry ||
    (family.value ? toWorkspaceFamilyPath(family.value) : '/workspace')
})
const targetAccess = useWorkspaceRouteTargetAccess({
  family,
  requiresSelection,
})
const selectionAccessPending = targetAccess.pending
const selectionAccessError = targetAccess.error
const selectionBlocked = targetAccess.blocked
const refreshTargetAccess = targetAccess.refresh
const selectionRequiredTitle = computed(
  () => `Select ${familyLabel.value} first`
)
const selectionRequiredDescription = computed(
  () =>
    `This workspace page needs an active ${familyLabel.value.toLowerCase()} before it can load.`
)
const selectionRequiredActionLabel = computed(
  () => `Choose ${familyLabel.value}`
)
</script>
