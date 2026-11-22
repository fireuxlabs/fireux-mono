<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <WorkspaceIntroInfo
    :intro="{
      ...identity.intro.value,
      ai: 'Use the Identity editor to review and save changes.',
    }"
  />
  <WorkspaceProjectIdentity
    :key="identity.projectId.value"
    :identity="identity"
  />
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useWorkspacePageState } from 'fireux-workspace/runtime/workspace/composables/useWorkspacePageState'
import WorkspaceIntroInfo from 'fireux-workspace/runtime/workspace/components/IntroInfo.vue'
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
definePageMeta({
  layout: 'workspace',

  workspaceSurface: 'browse',
  nav: {
    key: 'workspace-project-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    menus: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
