<template>
  <section v-if="items.length" aria-label="Project selector">
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
import { computed, watchEffect } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useWorkspace } from '../../../composables/fireux/workspace/useWorkspace'
import { useProjectCollection } from '../../composables/useProjectCollection'
import type { ProjectWorkspaceIndexState } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const props = defineProps<{
  project: ProjectWorkspaceIndexState['project']
  canSelectMultiple: boolean
  refresh: () => Promise<unknown>
}>()
const workspace = useWorkspace('project')
const { currentUser } = useAuth()
const targets = useProjectCollection({
  filter: computed(() => (props.canSelectMultiple ? undefined : { ids: [] })),
})
const projects = computed(() =>
  props.canSelectMultiple
    ? targets.projects.value.map((item) => ({
        id: item.id,
        name: item.name,
        tagline: item.description,
        url: item.image_url,
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

watchEffect(() => {
  workspace.setChoices(
    projects.value.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.tagline,
      image: item.url,
    }))
  )
})

async function selectProject(projectId: string | number) {
  const selected = projects.value.find((item) => item.id === projectId)
  if (!selected) return
  const user = currentUser.value
  if (props.canSelectMultiple && user) {
    await $fetch('/api/internal/control/projects/primary', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { projectId: selected.id },
    })
    await props.refresh()
  }
  workspace.activate(selected.id, selected.name, selected.tagline, selected.url)
}
</script>
