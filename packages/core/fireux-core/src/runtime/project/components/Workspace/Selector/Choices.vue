<template>
  <section v-if="items.length" aria-label="Project choices">
    <UTabs
      :model-value="project.id"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="selectProject"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'
import type { ProjectWorkspaceIndexState } from '../../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  project: ProjectWorkspaceIndexState['project']
  canSelectMultiple: boolean
  projectIds: string[]
}>()
const workspace = useProjectWorkspace()
const showChoices = computed(
  () => props.canSelectMultiple || props.projectIds.length > 1
)
const projects = computed(() =>
  showChoices.value
    ? workspace.choices.value.map((item) => ({
        id: item.id,
        name: item.name,
        tagline: item.description,
        url: item.image,
      }))
    : props.project.id
      ? [props.project]
      : []
)
const items = computed(() =>
  projects.value.map((item) => ({
    label: item.name || item.id,
    value: item.id,
    avatar: {
      src: item.url || undefined,
      alt: item.name,
      icon: 'i-lucide-briefcase-business',
    },
  }))
)

function selectProject(projectId: string | number) {
  const selected = projects.value.find((item) => item.id === projectId)
  if (!selected || selected.id === props.project.id) return
  void workspace.select(selected.id)
}
</script>
