<template>
  <UDashboardPanel id="workspace-portfolio-team">
    <template #header>
      <LayoutsWorkspaceNavbar title="Portfolio Team">
        <template #right><WorkspaceIntroInfo :intro="intro" /></template>
      </LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspacePortfolioTeam :key="team.state.value.portfolio.id" :team="team" />
      <WorkspaceFreemium
        family="portfolio"
        capability="team"
        :used-count="team.state.value.team.members.length"
        page-label="Team"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspacePortfolioTeam from '../../../portfolio/components/Workspace/Team/Index.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import { usePortfolioTeam } from '../../../portfolio/composables/usePortfolioTeam'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

const team = usePortfolioTeam()
const intro = computed(() => ({
  title: 'Portfolio Team',
  purpose: 'Add people to your team, update their details and assign roles.',
  data: 'People, optional linked accounts, assigned workspace roles.',
  boundaries:
    'Team labels organise people. Workspace association and subscription limits govern access.',
  ai: 'Portfolio Team AI is not implemented.',
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
}))
const { appName } = useFireUXConfig()
useAppLandingSeo({
  title: `Team | ${appName}`,
  description: 'Manage this Portfolio’s people and Team roles.',
  path: '/workspace/portfolio/team',
  logo: '/img/app/logo.png',
  language: 'en',
})

definePageMeta({
  layout: 'workspace',
  workspace: 'portfolio',
  pageTransition: false,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-portfolio-team',
    label: 'Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
