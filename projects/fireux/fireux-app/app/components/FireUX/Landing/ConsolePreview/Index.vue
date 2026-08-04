<template>
  <LandingConsolePreviewFrame
    :model-value="selectedSurfaceId"
    :items="operations"
    label="Interactive Project Console preview"
    navigation-label="Project Console"
    console-to="/console/project"
    open-console-aria-label="Open the full Project Console"
    @update:model-value="selectedSurfaceId = $event"
    @open-console="openFullProjectConsole"
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

    <FireUXLandingConsolePreviewApps
      v-if="selectedSurface?.id === 'project.apps'"
      :key="selectedSurface.id"
      :apps="productDemo?.console.apps || []"
      :error="Boolean(productDemoError)"
    />
    <FireUXLandingConsolePreviewEcosystems
      v-else-if="selectedSurface?.id === 'project.ecosystem'"
      :key="selectedSurface.id"
      :ecosystems="productDemo?.console.ecosystems || []"
      :error="Boolean(productDemoError)"
    />
    <FireUXLandingConsolePreviewPrivateState
      v-else-if="selectedSurface && privateState"
      :key="selectedSurface.id"
      v-bind="privateState"
    />
  </LandingConsolePreviewFrame>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import { useProjectConsoleSelection } from 'fireux-core/runtime/composables/fireux/console/project/core/useProjectConsoleSelection'
import type { ProjectInterfaceCard } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import type { LandingConsolePreviewItem } from 'fireux-core/types/landing-product'
import { useFireuxProductDemo } from '~/composables/product-demo/useFireuxProductDemo'

type PreviewOperation = LandingConsolePreviewItem & {
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
const { setProjectConsoleSelection } = useProjectConsoleSelection()

const selectedSurface = computed(
  () =>
    props.operations.find(
      (operation) => operation.id === selectedSurfaceId.value
    ) ??
    props.operations[0] ??
    null
)

const projectPill = computed<ProjectInterfaceCard | null>(
  () => productDemo.value?.console.projectPill ?? null
)

const privateState = computed(() => {
  if (selectedSurface.value?.id === 'project.users') {
    return {
      title: 'User activity stays private',
      description:
        'Open the authenticated Project Console to review the bounded cross-App signup feed.',
      icon: 'i-lucide-shield-check',
    }
  }

  return null
})

const openFullProjectConsole = async (event: MouseEvent) => {
  event.preventDefault()
  const projectId = productDemo.value?.console.projectId
  if (projectId) {
    setProjectConsoleSelection({
      projectId,
      type: 'demo',
    })
  }
  await navigateTo('/console/project')
}
</script>
