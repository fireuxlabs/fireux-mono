<template>
  <WorkspaceIntroInfo :intro="intro" />
  <UPageHeader title="Supplier Team" description="Supplier workspace team." />
  <WorkspaceSupplierSelector />
  <WorkspaceAI compact aria-label="Supplier Team AI"
    ><UAlert
      title="Team AI is not connected yet"
      color="neutral"
    /> </WorkspaceAI
  ><WorkspaceSupplierTeam :key="team.state.value.supplier.id" :team="team" />
  <WorkspaceFreemium
    family="supplier"
    capability="team"
    :used-count="team.state.value.team.members.length"
    page-label="Team"
    placement="bottom"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import WorkspaceSupplierTeam from '../../../supplier/components/Workspace/Team/Index.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
import { useSupplierWorkspaceTeam } from '../../../supplier/composables/workspace/useSupplierWorkspaceTeam'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

const team = useSupplierWorkspaceTeam()
const intro = computed(() => ({
  title: 'Supplier Team',
  purpose: 'Add people to your team, update their details and assign roles.',
  data: 'People, optional linked accounts, assigned workspace roles.',
  boundaries:
    'Team labels organise people. Workspace association and subscription limits govern access.',
  ai: 'Supplier Team AI is not implemented.',
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
}))
const { appName } = useFireUXConfig()
useAppLandingSeo({
  title: `Team | ${appName}`,
  description: 'Manage this Supplier’s people and Team roles.',
  path: '/workspace/supplier/team',
  logo: '/img/app/logo.png',
  language: 'en',
})

definePageMeta({
  layout: false,
  workspacePage: true,
  workspace: 'supplier',
  pageTransition: false,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-suppliers'] },
  nav: {
    key: 'workspace-supplier-team',
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
