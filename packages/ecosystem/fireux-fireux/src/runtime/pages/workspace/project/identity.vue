<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine project cleanup: adopt route-level workspace metadata. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-project-identity">
      <template #header>
        <LayoutsWorkspaceNavbar title="Project Identity"
          ><template #right
            ><WorkspaceIntroInfo
              :intro="{
                ...identity.intro.value,
                ai: 'Use the Identity editor to review and save changes.',
              }" /></template
        ></LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="project"
          capability="identity"
          page-label="Identity"
          hide-description
          placement="top"
        />
        <section class="space-y-4">
          <WorkspaceProjectIdentity
            :key="identity.projectId.value"
            :identity="identity"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useProjectAppContext } from '../../../project/composables/workspace/identity/useProjectAppContext'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import WorkspaceProjectIdentity from '../../../project/components/Workspace/Identity/Index.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useProjectIdentity } from '../../../project/composables/useProjectIdentity'
const appContext = useProjectAppContext()
const identity = useProjectIdentity({
  publication: appContext.publication,
})
const pageState = useWorkspacePageState('project')
watchEffect(() =>
  pageState.publish({
    identity: {
      id: identity.projectId.value,
      name: identity.name.value,
      description: identity.description.value,
      imageUrl: identity.imageUrl.value,
      source: identity.publication.value,
    },
    derived: {
      status: identity.outcome.value,
      canUpdate: identity.canWrite.value,
    },
  })
)
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
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
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
