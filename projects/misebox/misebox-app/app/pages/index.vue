<template>
  <div>
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Workspace" :show-title="false">
          <template #right>
            <WorkspaceKitchenInfo />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <div
            class="grid min-h-[calc(100dvh-8rem)] grid-rows-[1fr_auto] py-6"
          >
            <div class="grid content-center gap-6 py-12 sm:py-16">
              <WorkspaceKitchenHero />
              <WorkspaceKitchenAI />
            </div>

            <UButton
              to="#kitchen-workspace-content"
              icon="i-lucide-arrow-down"
              color="neutral"
              variant="ghost"
              size="xl"
              class="mx-auto rounded-full"
              aria-label="Explore the Kitchen Workspace"
            />
          </div>

          <div
            id="kitchen-workspace-content"
            class="grid scroll-mt-6 gap-6"
          >
            <WorkspaceKitchen />
          </div>

          <ClientOnly>
            <pre v-if="isDev" class="overflow-x-auto text-xs text-muted">{{
              state
            }}</pre>
          </ClientOnly>
        </section>
        <div class="workspace-surface grid gap-6">
          <WorkspaceKitchenOperations />
          <WorkspaceKitchenTools />
          <WorkspaceKitchenDiscovery />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceMain } from 'fireux-kitchens/runtime/kitchen/composables/workspace/main/useKitchenWorkspaceMain'
import { appMeta } from '../meta'

const isDev = import.meta.dev
const { state } = useKitchenWorkspaceMain()

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
