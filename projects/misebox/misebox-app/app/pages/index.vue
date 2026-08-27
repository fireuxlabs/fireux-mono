<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar :title="pageTitle" :show-title="false">
          <template #right>
            <MiseboxWorkspaceKitchenContextInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenHero
          </span>
          <WorkspaceKitchenHero
            :introduction="subscriptionIntroduction"
            :complete="hasKitchenPresentation"
          />

          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenActive
          </span>
          <WorkspaceKitchenActive />

          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenCollection
          </span>
          <div id="kitchen-workspace" class="scroll-mt-4">
            <WorkspaceKitchenCollection />
          </div>

          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenOperations
          </span>
          <WorkspaceKitchenOperations />
          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenFreeTools
          </span>
          <WorkspaceKitchenFreeTools />
          <span v-if="isDev" style="color: hotpink">
            WorkspaceKitchenDiscovery
          </span>
          <WorkspaceKitchenDiscovery />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenInterface } from 'fireux-kitchens/runtime/kitchen/composables/firestore/utils/view/useKitchenInterface'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspace'
import { appMeta } from '../meta'

const isDev = import.meta.dev
const kitchenWorkspace = useWorkspace('kitchen')
const kitchen = useKitchenWorkspace()
const { workspaceTarget } = useKitchenInterface()
const { appAccess, appAccessOutcome } = useUser()
const activeKitchen = computed(() =>
  kitchen.selection.kitchen.value
    ? workspaceTarget(kitchen.selection.kitchen.value)
    : null
)
const hasKitchenPresentation = computed(() =>
  Boolean(
    activeKitchen.value?.name &&
      activeKitchen.value?.prop &&
      activeKitchen.value?.imageUrl
  )
)
const pageTitle = computed(
  () => kitchenWorkspace.activeName.value || 'Kitchen Workspace'
)
const visibleSubscription = computed(() =>
  appAccessOutcome.value === 'ready' ? appAccess.value.subscription : 'free'
)
const subscriptionIntroduction = computed(() => {
  if (visibleSubscription.value === 'business') {
    return 'Manage multiple Kitchens, Menus and teams.'
  }
  if (visibleSubscription.value === 'premium') {
    return 'Manage your Kitchen and publish multiple Menus.'
  }
  return 'Start one Kitchen and publish one restaurant Menu for free. No sign-up required.'
})

definePageMeta({
  layout: 'workspace',
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  nav: {
    key: 'workspace-kitchen',
    label: 'Current Kitchen',
    description: 'My Kitchen',
    icon: 'i-lucide-chef-hat',
    position: 'bottom',
    order: 900,
    prominent: true,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
