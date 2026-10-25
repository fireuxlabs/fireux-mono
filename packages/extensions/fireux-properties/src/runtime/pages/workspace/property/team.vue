<template>
  <WorkspaceIntroInfo :intro="intro" />
  <UPageHeader title="Property Team" description="Property workspace team." />
  <WorkspacePropertySelector />
  <WorkspaceAI compact aria-label="Property Team AI"
    ><UAlert
      title="Team AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><PropertyTeam :key="team.state.value.property.id" :team="team" />
  <WorkspaceFreemium
    family="property"
    capability="team"
    :used-count="team.state.value.team.members.length"
    page-label="Team"
    placement="bottom"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
import { usePropertyWorkspaceTeam } from '../../../property/composables/workspace/usePropertyWorkspaceTeam'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

const team = usePropertyWorkspaceTeam()
const intro = computed(() => ({
  title: 'Property Team',
  purpose: 'Add people to your team, update their details and assign roles.',
  data: 'People, optional linked accounts, assigned workspace roles.',
  boundaries:
    'Team labels organise people. Workspace association and subscription limits govern access.',
  ai: 'Property Team AI is not implemented.',
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
}))
const { appName } = useFireUXConfig()
useAppLandingSeo({
  title: `Team | ${appName}`,
  description: 'Manage this Property’s people and Team roles.',
  path: '/workspace/property/team',
  logo: '/img/app/logo.png',
  language: 'en',
})

definePageMeta({
  layout: false,
  workspacePage: true,
  workspace: 'property',
  pageTransition: false,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-properties'] },
  nav: {
    key: 'workspace-property-team',
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
