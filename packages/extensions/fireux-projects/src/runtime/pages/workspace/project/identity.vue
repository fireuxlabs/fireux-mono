<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <WorkspaceIntroInfo
    :intro="{
      ...identity.intro.value,
      ai: 'Use the Identity editor to review and save changes.',
    }"
  />
  <WorkspaceFreemium
    family="project"
    capability="identity"
    page-label="Identity"
    hide-description
    placement="top"
  />
  <ProjectIdentity :key="identity.projectId.value" :identity="identity" />
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import { useProjectWorkspaceIdentity } from '../../../project/composables/workspace/useProjectWorkspaceIdentity'
const identity = useProjectWorkspaceIdentity()
const pageState = useWorkspacePageState('project')
watchEffect(() =>
  pageState.publish({
    identity: {
      id: identity.projectId.value,
      name: identity.name.value,
      description: identity.description.value,
      imageUrl: identity.imageUrl.value,
    },
    derived: {
      status: identity.outcome.value,
      canUpdate: identity.canWrite.value,
    },
  })
)
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
