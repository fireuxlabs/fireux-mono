<template>
  <WorkspacePortfolioHomeInfo />
  <UDashboardToolbar v-if="isSignedIn" :ui="{ root: 'border-b-0' }"
    ><WorkspacePortfolioSelector /> </UDashboardToolbar
  ><WorkspacePortfolioHomeHero />
  <WorkspaceGuestWelcome />
  <WorkspacePortfolio />
  <WorkspacePortfolioHomeCapabilityLinks />
  <WorkspacePortfolioHomeTools />
  <WorkspacePortfolioHomeDiscoveryLinks />
</template>

<script setup lang="ts">
import { useWorkspaceEntryState } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryState'
const { isSignedIn } = useWorkspaceEntryState()
import WorkspaceGuestWelcome from 'fireux-core/runtime/workspace/components/GuestWelcome.vue'
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: false,
  workspacePage: true,
  pageTransition: false,
  workspace: 'portfolio',
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-portfolio',
    label: 'Portfolio',
    description: 'Portfolio Workspace',
    icon: 'i-lucide-layout-dashboard',
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

useSeoMeta({ title: 'Portfolio Workspace', robots: 'noindex, nofollow' })
</script>
