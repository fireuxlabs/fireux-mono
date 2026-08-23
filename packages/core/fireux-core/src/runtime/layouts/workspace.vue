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
      <NuxtErrorBoundary>
        <slot />

        <template #error="{ clearError: clearPageError }">
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

  <ClientOnly>
    <UBadge
      v-if="roleLens"
      :label="roleLens.label"
      :icon="roleLens.icon"
      :color="roleLens.color"
      variant="soft"
      size="sm"
      class="pointer-events-none fixed right-4 bottom-4 z-50 shadow-lg ring-1 ring-default"
      aria-live="off"
    />
  </ClientOnly>

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
import { useUser } from '../user/composables/useUser'
defineOptions({ name: 'workspace' })

const open = ref(false)
const { isOpen: isNotificationsSlideoverOpen } = useWorkspaceNotifications()
const workspaceNav = useWorkspaceNav()
const { appUser } = useUser()
const roleLens = computed(() => {
  if (appUser.value?.role === 'dev') {
    return {
      label: 'Developer view',
      icon: 'i-lucide-code-2',
      color: 'warning' as const,
    }
  }
  if (appUser.value?.role === 'admin') {
    return {
      label: 'Admin view',
      icon: 'i-lucide-shield-check',
      color: 'info' as const,
    }
  }
  return null
})
const route = useRoute()
const workspace = computed(() =>
  workspaceFamilyFromRouteContext(String(route.path || ''), route.query.family)
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

const workspaceLabel = computed(
  () => toWorkspaceFamilyLabel(workspace.value) || 'Workspace'
)
</script>
