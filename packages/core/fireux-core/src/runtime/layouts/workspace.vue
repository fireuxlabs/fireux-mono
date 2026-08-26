<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <UDashboardSidebar
      id="core-workspace"
      v-model:open="open"
      collapsible
      class="workspace-shell__sidebar"
    >
      <template #header="{ collapsed }">
        <div class="px-2 py-2">
          <div class="flex min-h-11 items-center px-1">
            <NuxtLink
              v-if="collapsed"
              to="/about"
              class="mx-auto inline-flex"
              aria-label="Home"
            >
              <AppBrandLogo size="small" alt="FireUX" />
            </NuxtLink>
            <NuxtLink v-else to="/about" class="inline-flex" aria-label="Home">
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

            <div class="space-y-2">
              <div v-if="prominentFamilyRootNav.length" class="space-y-2">
                <NuxtLink
                  v-for="item in prominentFamilyRootNav"
                  :key="item.key || item.to"
                  :to="item.to"
                  :class="collapsed ? 'flex w-full justify-center' : 'pill'"
                  :aria-label="item.description || item.label"
                >
                  <UAvatar :icon="item.icon" size="sm" class="shrink-0" />
                  <span v-if="!collapsed" class="min-w-0 text-left">
                    <strong
                      class="block truncate text-sm font-medium text-highlighted"
                    >
                      {{ item.label }}
                    </strong>
                    <small class="block truncate text-xs text-muted">
                      {{ item.description || `Open ${item.label}` }}
                    </small>
                  </span>
                </NuxtLink>
              </div>

              <LayoutsSharedSideBarFooter
                :collapsed="collapsed ?? false"
                :show-home="false"
              />
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

          <div class="space-y-2">
            <div v-if="prominentFamilyRootNav.length" class="space-y-2">
              <NuxtLink
                v-for="item in prominentFamilyRootNav"
                :key="item.key || item.to"
                :to="item.to"
                :class="collapsed ? 'flex w-full justify-center' : 'pill'"
                :aria-label="item.description || item.label"
              >
                <UAvatar :icon="item.icon" size="sm" class="shrink-0" />
                <span v-if="!collapsed" class="min-w-0 text-left">
                  <strong
                    class="block truncate text-sm font-medium text-highlighted"
                  >
                    {{ item.label }}
                  </strong>
                  <small class="block truncate text-xs text-muted">
                    {{ item.description || `Open ${item.label}` }}
                  </small>
                </span>
              </NuxtLink>
            </div>

            <LayoutsSharedSideBarFooter
              :collapsed="collapsed ?? false"
              compact-profile
              :show-home="false"
            />
          </div>
        </div>
      </template>
    </UDashboardSidebar>

    <main class="workspace-shell__canvas">
      <NuxtErrorBoundary>
        <slot />

        <template #error="{ error: pageError, clearError: clearPageError }">
          <UDashboardPanel id="workspace-page-unavailable">
            <template #header>
              <LayoutsWorkspaceNavbar
                :title="`${workspaceLabel} unavailable`"
              />
            </template>

            <template #body>
              <section class="flex min-h-[55vh] items-center">
                <UAlert
                  class="w-full max-w-2xl"
                  color="error"
                  variant="subtle"
                  icon="i-lucide-triangle-alert"
                  :title="`${workspaceLabel} page unavailable`"
                  :description="
                    isDevelopment
                      ? String(pageError)
                      : 'This page could not be loaded. The rest of the Workspace is still available.'
                  "
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
    </main>
  </UDashboardGroup>

  <LayoutsSharedRoleBadge />

  <LayoutsSharedNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: share the notification slideover owner across workspace and dashboard.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: pre-create family workspace and selection state for layout guards.
import { useRoute } from '#imports'
import { computed, ref } from 'vue'
import {
  workspaceFamilyFromRouteContext,
  toWorkspaceFamilyLabel,
} from '../composables/fireux/workspace/workspaceRoutes'
import { useWorkspaceNav } from '../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspaceNotifications } from '../composables/fireux/workspace/useWorkspaceNotifications'
import { useWorkspace } from '../composables/fireux/workspace/useWorkspace'
defineOptions({ name: 'workspace' })

const open = ref(false)
const isDevelopment = import.meta.dev
const { isOpen: isNotificationsSlideoverOpen } = useWorkspaceNotifications()
const workspaceNav = useWorkspaceNav()
const route = useRoute()
const workspace = computed(() =>
  workspaceFamilyFromRouteContext(
    String(route.path || ''),
    route.meta.workspace
  )
)
const workspaceState = useWorkspace(workspace.value)
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
  familyRootNav.value
    .filter((item) => item.prominent)
    .map((item) => {
      const activeName = workspaceState.activeName.value
      if (!activeName) return item
      return {
        ...item,
        label: activeName,
        description:
          workspaceState.activeDescription.value ||
          `Current ${workspaceLabel.value}`,
      }
    })
)

const workspaceLabel = computed(
  () => toWorkspaceFamilyLabel(workspace.value) || 'Workspace'
)
</script>
