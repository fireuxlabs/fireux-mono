<template>
  <UDashboardSidebar
    id="core-workspace"
    v-model:open="open"
    v-model:collapsed="sidebarCollapsed"
    collapsible
    class="workspace-sidebar"
    :ui="{ body: 'workspace-sidebar__body' }"
  >
    <template #header="{ collapsed }">
      <div class="workspace-sidebar__brand">
        <NuxtLink
          v-if="!collapsed"
          :to="workspaceEntryPath"
          class="workspace-sidebar__home"
          aria-label="Workspace Home"
        >
          <AppBrandWordmark size="card" alt="FireUX" />
        </NuxtLink>
        <UTooltip :text="sidebarNext.label">
          <UButton
            :class="
              collapsed
                ? 'workspace-sidebar__toggle--compact'
                : 'workspace-sidebar__toggle'
            "
            :icon="sidebarNext.icon"
            :aria-label="sidebarNext.label"
            color="neutral"
            variant="ghost"
            @click="sidebarMode = sidebarNext.mode"
          />
        </UTooltip>
      </div>
    </template>

    <template #default="{ collapsed }">
      <div class="workspace-sidebar__navigation">
        <UNavigationMenu
          v-if="topNavItems.length"
          :key="`${workspace}:${activeNavGroup}:${groupVisit}:${sidebarMode}`"
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
      <div class="workspace-sidebar__footer">
        <div class="workspace-sidebar__account">
          <div class="workspace-sidebar__account">
            <ClientOnly>
              <component
                v-if="workspaceNavigation"
                :is="workspaceNavigation"
                :collapsed="collapsed ?? false"
              />
              <template #fallback>
                <div
                  class="workspace-sidebar__loading"
                  aria-label="Loading Workspace"
                >
                  <USkeleton class="workspace-sidebar__loading-icon" />
                  <USkeleton
                    v-if="!collapsed"
                    class="workspace-sidebar__loading-label"
                  />
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
</template>
<script setup lang="ts">
// Concurrent edit — 2026-07-20 15:20 CEST — Customer order notification pass: share the notification slideover owner across workspace and dashboard.
// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: pre-create family workspace and selection state for layout guards.
import { useNuxtApp, useRoute } from '#imports'
import { computed, ref } from 'vue'
import {
  workspaceSidebarNext,
  type WorkspaceSidebarMode,
} from '../utils/sidebar-mode'
import type { NavigationMenuItem } from '@nuxt/ui'
import {
  workspaceFamilyFromRouteContext,
  toWorkspaceFamilyLabel,
} from '../utils/routes'
import { useWorkspaceNav } from '../composables/useWorkspaceNav'
import { workspaceActiveDestination } from '../utils/active-destination'
import { useWorkspaceEntryCta } from '../composables/useWorkspaceEntryCta'

const open = ref(false)
const sidebarMode = ref<WorkspaceSidebarMode>('expanded')
const sidebarNext = computed(() => workspaceSidebarNext(sidebarMode.value))
const sidebarCollapsed = computed({
  get: () => sidebarMode.value === 'compact',
  set: (value: boolean) => {
    sidebarMode.value = value ? 'compact' : 'expanded'
  },
})
// Remount the accordion defaults when revisiting an already-active group index.
const groupVisit = ref(0)
const workspaceNav = useWorkspaceNav()
const route = useRoute()
const { workspaceEntryPath } = useWorkspaceEntryCta()
const nuxtApp = useNuxtApp()
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
const activeDestination = computed(() =>
  workspaceActiveDestination(
    topNav.value.flatMap((item) =>
      item.children?.length
        ? [
            ...(item.groupIndex ? [item.to] : []),
            ...item.children.map((child) => child.to),
          ]
        : [item.to]
    ),
    route
  )
)
const destinationActive = (to: string) => activeDestination.value === to
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
        type: item.groupIndex ? 'link' : 'trigger',
        to: item.groupIndex ? item.to : undefined,
        onSelect: item.groupIndex
          ? () => {
              groupVisit.value += 1
              open.value = false
            }
          : undefined,
        active: activeNavGroup.value === item.label,
        defaultOpen:
          sidebarMode.value === 'all' || activeNavGroup.value === item.label,
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
        active: destinationActive(item.to),
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
      result.push({ ...item, active: destinationActive(item.to) })
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
        defaultOpen:
          sidebarMode.value === 'all' || label === activeNavGroup.value,
        children: [],
      }
      groups.set(label, group)
      result.push(group)
    }
    if (item.groupIndex) {
      group.to = item.to
      group.type = 'link'
      group.onSelect = () => {
        groupVisit.value += 1
        open.value = false
      }
      continue
    }
    group.children!.push({
      ...item,
      active: destinationActive(item.to),
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
// Entity selection belongs to the active Workspace, independently of nav placement.
const workspaceNavigation = computed(() =>
  workspace.value
    ? nuxtApp.vueApp.component(
        `Workspace${toWorkspaceFamilyLabel(workspace.value)}Navigation`
      )
    : undefined
)

const workspaceLabel = computed(
  () => toWorkspaceFamilyLabel(workspace.value) || 'Workspace'
)
</script>
