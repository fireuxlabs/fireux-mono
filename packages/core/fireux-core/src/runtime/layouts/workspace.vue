<template>
  <UDashboardGroup unit="rem" class="workspace-shell">
    <UDashboardSidebar
      id="core-workspace"
      v-model:open="open"
      collapsible
      class="h-svh max-h-svh border-r-0"
      :ui="{
        body: 'min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex min-h-11 items-center gap-2 px-3 py-2">
          <NuxtLink
            v-if="!collapsed"
            to="/about"
            class="inline-flex min-w-0"
            aria-label="Home"
          >
            <AppBrandWordmark size="card" alt="FireUX" />
          </NuxtLink>
          <UDashboardSidebarCollapse
            :class="collapsed ? 'mx-auto' : 'ml-auto'"
          />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex h-full min-h-0 flex-col gap-3">
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

            <div class="space-y-2">
              <div v-if="familyRootNav.length" class="space-y-2">
                <ClientOnly>
                  <template
                    v-for="item in familyRootNav"
                    :key="item.key || item.to"
                  >
                    <div
                      v-if="item.pending"
                      class="flex h-8 items-center gap-2 px-2"
                      aria-label="Loading Workspace"
                    >
                      <USkeleton class="size-5 shrink-0 rounded-full" />
                      <USkeleton v-if="!collapsed" class="h-4 flex-1" />
                    </div>
                    <WorkspaceEntitySwitcher
                      v-else
                      :item="item"
                      :collapsed="collapsed ?? false"
                      :workspace-label="workspaceLabel"
                    />
                  </template>
                  <template #fallback>
                    <div
                      class="flex h-8 items-center gap-2 px-2"
                      aria-label="Loading Workspace"
                    >
                      <USkeleton class="size-5 shrink-0 rounded-full" />
                      <USkeleton v-if="!collapsed" class="h-4 flex-1" />
                    </div>
                  </template>
                </ClientOnly>
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
          <div class="space-y-2">
            <div v-if="familyRootNav.length" class="space-y-2">
              <ClientOnly>
                <template
                  v-for="item in familyRootNav"
                  :key="item.key || item.to"
                >
                  <div
                    v-if="item.pending"
                    class="flex h-8 items-center gap-2 px-2"
                    aria-label="Loading Workspace"
                  >
                    <USkeleton class="size-5 shrink-0 rounded-full" />
                    <USkeleton v-if="!collapsed" class="h-4 flex-1" />
                  </div>
                  <WorkspaceEntitySwitcher
                    v-else
                    :item="item"
                    :collapsed="collapsed ?? false"
                    :workspace-label="workspaceLabel"
                  />
                </template>
                <template #fallback>
                  <div
                    class="flex h-8 items-center gap-2 px-2"
                    aria-label="Loading Workspace"
                  >
                    <USkeleton class="size-5 shrink-0 rounded-full" />
                    <USkeleton v-if="!collapsed" class="h-4 flex-1" />
                  </div>
                </template>
              </ClientOnly>
            </div>

            <LayoutsSharedSideBarFooter
              :collapsed="collapsed ?? false"
              :show-home="false"
            />
          </div>
        </div>
      </template>
    </UDashboardSidebar>

    <main
      class="m-4 flex min-w-0 flex-1 overflow-y-auto rounded-lg bg-default/75 shadow-sm ring ring-default [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:ml-0"
    >
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
import WorkspaceEntitySwitcher from '../components/Workspace/EntitySwitcher.vue'
import {
  workspaceFamilyFromRouteContext,
  toWorkspaceFamilyLabel,
} from '../composables/fireux/workspace/workspaceRoutes'
import { useWorkspaceNav } from '../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspaceNotifications } from '../composables/fireux/workspace/useWorkspaceNotifications'
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
  workspaceNav.desktop.value
    .filter((item) => workspaceNav.resolveItemPosition(item) === 'bottom')
    .map((item) => ({
        ...item,
        to: '/',
        pending: false,
        description: item.description || `${workspaceLabel.value} Workspace`,
        image: '',
        choices: [],
    }))
)

const workspaceLabel = computed(
  () => toWorkspaceFamilyLabel(workspace.value) || 'Workspace'
)
</script>
