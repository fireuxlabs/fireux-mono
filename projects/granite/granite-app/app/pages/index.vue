<template>
  <UDashboardPanel id="granite-portfolio-home">
    <LayoutsWorkspaceNavbar title="Portfolio Workspace">
      <template #right>
        <!-- 07 Info — LAST: explain how the completed page, context, capabilities and boundaries fit together. -->
        <WorkspacePortfolioInfo />
      </template>
    </LayoutsWorkspaceNavbar>
    <!-- 01 Hero — define the Portfolio page promise, audience and intended outcome. -->
    <WorkspacePortfolioHero />
    <!-- 02 AI — provide the page-scoped PortfolioAI entry without claiming connected actions. -->
    <WorkspacePortfolioIndexAI />
    <!-- 03 Workspace — render only the AppUser primary Portfolio presentation. -->
    <WorkspacePortfolio />
    <!-- 04 Operations — curate only the main Portfolio index Operations. -->
    <WorkspacePortfolioOperations />
    <!-- 05 Tools — state the bounded Tool release surface truthfully. -->
    <WorkspacePortfolioTools />
    <!-- 06 Discovery — publish Portfolio literature and routes for this exact index. -->
    <WorkspacePortfolioDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'


definePageMeta({
  layout: 'workspace',
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

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
