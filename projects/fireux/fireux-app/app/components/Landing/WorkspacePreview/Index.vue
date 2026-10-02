<template>
  <LandingWorkspacePreviewFrame
    :model-value="selectedSurfaceId"
    :items="operations"
    label="Interactive Project Workspace preview"
    navigation-label="Project Workspace"
    workspace-to="/workspace/project"
    open-workspace-aria-label="Open the full Project Workspace"
    @update:model-value="selectedSurfaceId = $event"
    @open-workspace="openFullProjectWorkspace"
  >
    <template #target>
      <UAvatar
        v-if="projectPill"
        :src="projectPill.imageUrl || undefined"
        :alt="projectPill.title"
        icon="i-lucide-folders"
        size="md"
        :title="projectPill.title"
      />
      <UAvatar
        v-else
        icon="i-lucide-folders"
        size="md"
        :aria-label="
          productDemoError ? 'Demo Project unavailable' : 'Loading Demo Project'
        "
      />
    </template>

    <LandingWorkspacePreviewApps
      v-if="selectedSurface?.id === 'project.apps'"
      :key="selectedSurface.id"
      :apps="productDemo?.workspace.apps || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewEcosystems
      v-else-if="selectedSurface?.id === 'project.ecosystem'"
      :key="selectedSurface.id"
      :ecosystems="productDemo?.workspace.ecosystems || []"
      :error="Boolean(productDemoError)"
    />
    <LandingWorkspacePreviewPrivateState
      v-else
      :key="selectedSurface?.id || 'project.private'"
      :title="selectedSurface?.title || 'Private Project operation'"
      :description="
        selectedSurface?.description ||
        'Open the Project Workspace to manage this private operation.'
      "
      :icon="selectedSurface?.icon || 'i-lucide-lock-keyhole'"
    />
  </LandingWorkspacePreviewFrame>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import type { ProjectInterfaceCard } from 'fireux-fireux/runtime/project/composables/useProjectInterface'
import type { LandingWorkspacePreviewItem } from 'fireux-core/types/landing-product'
import { useFireuxProductDemo } from '~/composables/product-demo/useFireuxProductDemo'

type PreviewOperation = LandingWorkspacePreviewItem & {
  description: string
  to: string
}

const props = defineProps<{
  operations: readonly PreviewOperation[]
}>()

const selectedSurfaceId = defineModel<string>('surfaceId', {
  default: 'project.apps',
})
const { data: productDemo, error: productDemoError } =
  await useFireuxProductDemo()

const selectedSurface = computed(
  () =>
    props.operations.find(
      (operation) => operation.id === selectedSurfaceId.value
    ) ??
    props.operations[0] ??
    null
)

const projectPill = computed<ProjectInterfaceCard | null>(
  () => productDemo.value?.workspace.projectPill ?? null
)

const openFullProjectWorkspace = async (event: MouseEvent) => {
  event.preventDefault()
  await navigateTo('/workspace/project')
}
</script>
