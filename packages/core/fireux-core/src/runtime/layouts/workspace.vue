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
            :key="`${workspace}:${activeNavGroup}`"
            tooltip
            :popover="{ mode: 'click' }"
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
        </div>
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-3">
          <div class="space-y-2">
            <div v-if="familyRootNav.length" class="space-y-2">
              <ClientOnly>
                <template
                  v-for="item in familyRootNav"
                  :key="item.key || item.to"
                >
                  <component
                    :is="item.component"
                    v-if="item.component"
                    :collapsed="collapsed ?? false"
                  />
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
      class="m-0 flex min-w-0 flex-1 overflow-y-auto bg-default/75 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:m-4 lg:ml-0 lg:rounded-lg lg:shadow-sm lg:ring lg:ring-default"
    >
      <NuxtErrorBoundary :key="`${workspace}:${route.path}`">
        <div class="workspace-page-content flex min-w-0 flex-1">
          <slot />
        </div>

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
import { useNuxtApp, useRoute } from '#imports'
import { computed, ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import WorkspaceEntitySwitcher from '../components/Workspace/EntitySwitcher.vue'
import {
  workspaceFamilyFromRouteContext,
  toWorkspaceFamilyLabel,
} from '../composables/fireux/workspace/workspaceRoutes'
import { useWorkspaceNav } from '../composables/fireux/workspace/useWorkspaceNav'
import { useWorkspaceNotifications } from '../composables/fireux/workspace/useWorkspaceNotifications'
import { useWorkspace } from '../composables/fireux/workspace/useWorkspace'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'
defineOptions({ name: 'workspace' })

const open = ref(false)
const isDevelopment = import.meta.dev
const { isOpen: isNotificationsSlideoverOpen } = useWorkspaceNotifications()
const workspaceNav = useWorkspaceNav()
const route = useRoute()
const nuxtApp = useNuxtApp()
const workspace = computed(() =>
  workspaceFamilyFromRouteContext(
    String(route.path || ''),
    route.meta.workspace
  )
)
const selections = new Map(
  useFireUXConfig().workspaces.map((family) => [family, useWorkspace(family)])
)
const activeEntityId = computed(
  () => selections.get(workspace.value)?.selectedId.value || ''
)
const topNav = computed(() =>
  workspaceNav.desktop.value.filter(
    (item) => workspaceNav.resolveItemPosition(item) === 'top'
  )
)
function destinationActive(to: string) {
  const target = new URL(to, 'http://workspace.local')
  if (target.pathname !== route.path)
    return route.path.startsWith(`${target.pathname}/`)
  if (target.hash) return target.hash === route.hash
  if (target.search)
    return [...target.searchParams].every(
      ([key, value]) => route.query[key] === value
    )
  return !route.query.view && !route.hash
}
const activeNavGroup = computed(() => {
  const item = topNav.value.find(
    (item) =>
      item.children?.some((child) => destinationActive(child.to)) ||
      destinationActive(item.to)
  )
  return item?.children?.length
    ? item.label
    : item?.group ||
        String((route.meta.nav as { group?: string } | undefined)?.group || '')
})
const topNavItems = computed<NavigationMenuItem[]>(() => {
  const result: NavigationMenuItem[] = []
  const groups = new Map<string, NavigationMenuItem>()
  for (const item of topNav.value) {
    if (item.children?.length) {
      result.push({
        label: item.label,
        icon: item.icon,
        value: item.key || item.label,
        type: 'trigger',
        active: activeNavGroup.value === item.label,
        defaultOpen: activeNavGroup.value === item.label,
        children: item.children.map((child) => ({
          ...child,
          active: destinationActive(child.to),
          onSelect: () => {
            open.value = false
          },
        })),
      })
      continue
    }
    const label = String(item.group || '').trim()
    if (!label) {
      result.push({
        ...item,
        onSelect: () => {
          open.value = false
        },
      })
      continue
    }
    if (item.groupDisplay !== 'nested') {
      if (!groups.has(label)) {
        const heading: NavigationMenuItem = { label, type: 'label' }
        groups.set(label, heading)
        result.push(heading)
      }
      result.push(item)
      continue
    }
    let group = groups.get(label)
    if (!group) {
      group = {
        label,
        icon: item.groupIcon,
        value: `group:${label}`,
        type: 'trigger',
        active: label === activeNavGroup.value,
        defaultOpen: label === activeNavGroup.value,
        children: [],
      }
      groups.set(label, group)
      result.push(group)
    }
    group.children!.push({
      ...item,
      onSelect: () => {
        open.value = false
      },
    })
  }
  return result
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
      component: nuxtApp.vueApp.component(
        `Workspace${toWorkspaceFamilyLabel(workspaceFamilyFromRouteContext(item.to) || workspace.value)}Navigation`
      ),
      description: item.description || `${workspaceLabel.value} Workspace`,
      image: '',
      choices: [],
    }))
)

const workspaceLabel = computed(
  () => toWorkspaceFamilyLabel(workspace.value) || 'Workspace'
)
</script>

<style scoped>
.workspace-page-content {
  animation: workspace-arrive 150ms ease-out;
}

@keyframes workspace-arrive {
  from {
    opacity: 0.65;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-page-content {
    animation: none;
  }
}
</style>
