<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Project target wrapper. -->
<template>
  <WorkspaceEntityCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="project targets"
    title="Your projects"
    description="Live projects linked to your current user profile."
    error-description="Your projects could not be loaded. Please try again."
    empty-title="No projects linked to you"
    empty-description="Projects linked to your current user profile will appear here."
  >
    <ProjectCardsCell
      v-for="card in cards"
      :key="card.id"
      v-bind="card"
      :link="false"
      action
      :show-badges="false"
      @action="selectProject(card.id)"
    />
  </WorkspaceEntityCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from '../../../../composables/fireux/workspace/workspace-outcome'
import type { ProjectSurface } from '../../../composables/useProjectInterface'
import { useProjectInterface } from '../../../composables/useProjectInterface'

const props = withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
    outcome: WorkspaceTargetOutcome
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const workspaceIds = computed(() =>
  props.collection
    .map((project) => String(project.id ?? '').trim())
    .filter(Boolean)
)
const workspaceIdSet = computed(() => new Set(workspaceIds.value))
const { cell } = useProjectInterface()
const cards = computed(() =>
  props.collection
    .map((project) => cell(project))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
function selectProject(id: string) {
  const projectId = String(id ?? '').trim()
  if (!workspaceIdSet.value.has(projectId)) return
  emit('select', projectId)
}
</script>
