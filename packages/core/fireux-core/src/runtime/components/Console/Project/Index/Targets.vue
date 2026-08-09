<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Project target wrapper. -->
<template>
  <ConsoleTargetCollection
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
  </ConsoleTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from '../../../../composables/fireux/app/console/useConsoleIndex'
import type { ProjectSurface } from '../../../../composables/fireux/project/useProjectInterface'
import { useProjectInterface } from '../../../../composables/fireux/project/useProjectInterface'

const props = withDefaults(
  defineProps<{
    collection?: ProjectSurface[]
    outcome: ConsoleTargetOutcome
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const consoleIds = computed(() =>
  props.collection
    .map((project) => String(project.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
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
  if (!consoleIdSet.value.has(projectId)) return
  emit('select', projectId)
}
</script>
