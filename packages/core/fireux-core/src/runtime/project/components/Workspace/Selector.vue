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
import { useToast } from '#imports'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useWorkspace } from '../../../composables/fireux/workspace/useWorkspace'
import type { ProjectWorkspaceIndexState } from '../../composables/workspace/index/useProjectWorkspaceIndex'
import { useProjectWorkspaceChoices } from '../../composables/workspace/index/useProjectWorkspaceChoices'

const props = defineProps<{
  project: ProjectWorkspaceIndexState['project']
  canSelectMultiple: boolean
  projectIds: string[]
  refresh: () => Promise<unknown>
}>()
const workspace = useWorkspace('project')
const { currentUser } = useAuth()
const toast = useToast()
const showChoices = computed(
  () => props.canSelectMultiple || props.projectIds.length > 1
)
const targets = useProjectWorkspaceChoices(
  showChoices,
  () => props.projectIds
)
const projects = computed(() =>
  showChoices.value
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
  if (!selected || selected.id === props.project.id) return
  const user = currentUser.value
  if (!user) return
  const response = await $fetch<{ updated?: true; notified: number }>(
    '/api/internal/control/projects/primary',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { projectId: selected.id },
    }
  )
  if (response.updated) {
    await props.refresh()
    return
  }
  toast.add({
    title: 'Primary Project change requested',
    description: 'An App administrator has been notified.',
  })
}
</script>
