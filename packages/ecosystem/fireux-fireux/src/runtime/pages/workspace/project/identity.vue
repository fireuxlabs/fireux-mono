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
                ai: 'AI prepares this same Identity editor. You review and save all changes.',
              }" /></template
        ></LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="project"
          capability="identity"
          page-label="Identity"
          placement="top"
        />
        <WorkspaceProjectIntent
          label="Project Identity"
          :scope-key="scopeKey"
          :available-actions="availableActions"
          :suggestions="suggestions"
          :request="requestAI"
          @action="openAction"
        />
        <section class="space-y-4">
          <WorkspaceProjectIdentity
            ref="identityView"
            :key="identity.projectId.value"
            :identity="identity"
          />
        </section>
        <WorkspaceFreemium
          family="project"
          capability="identity"
          page-label="Identity"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useProjectAppContext } from '../../../project/composables/workspace/identity/useProjectAppContext'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import WorkspaceProjectIdentity from 'fireux-core/runtime/project/components/Workspace/Identity/Index.vue'
import type { ProjectIdentityIntent } from 'fireux-core/runtime/project/models/identity-intent'
import { useProjectIntent } from '../../../project/composables/workspace/ai/useProjectIntent'
import type { ProjectIntent } from '../../../project/models/intent'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useProjectWorkspaceIdentity } from 'fireux-core/runtime/project/composables/workspace/identity/useProjectWorkspaceIdentity'
const appContext = useProjectAppContext()
const identity = useProjectWorkspaceIdentity({
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
const identityView = ref<InstanceType<typeof WorkspaceProjectIdentity>>()
const { request } = useProjectIntent()
const scopeKey = computed(() =>
  JSON.stringify([
    identity.projectId.value,
    identity.name.value,
    identity.description.value,
    identity.imageUrl.value,
  ])
)
const availableActions = computed(() =>
  identity.intro.value.tools
    .filter((tool) => tool.available)
    .map((tool) => tool.id)
)
const suggestions = computed(() => [
  ...(availableActions.value.includes('read')
    ? [{ label: 'Describe this workspace' }]
    : []),
  ...(identity.canWrite.value
    ? [
        { label: 'Rename this workspace to CleanFlow' },
        ...(!identity.publication.value
          ? [{ label: 'Help me edit the workspace description' }]
          : []),
      ]
    : []),
])
function requestAI(prompt: string) {
  return request<ProjectIdentityIntent>({
    capability: 'identity',
    prompt,
    identity: {
      name: identity.name.value,
      description: identity.description.value,
      imageUrl: identity.imageUrl.value,
      source: identity.publication.value,
    },
    availableActions: availableActions.value,
  })
}
function openAction(intent: ProjectIntent) {
  if ('description' in intent) identityView.value?.openAction(intent)
}
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
