<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Blank target wrapper. -->
<template>
  <WorkspaceTargetCollection
    :outcome="props.outcome"
    :count="cards.length"
    entity="blank targets"
    error-description="Blank targets could not be loaded. Please try again."
    empty-title="No Blank targets found"
    empty-description="Blank targets you can access will appear here."
    items-class="grid gap-3 md:grid-cols-2"
  >
    <template #header>
      <h2>Choose Blank</h2>
      <p>Select the Blank workspace target you want to work on.</p>
    </template>

    <WorkspaceTargetCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      action
      :show-badges="false"
      @action="selectBlank(card.id)"
    />
  </WorkspaceTargetCollection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDirectoryIndex'
import type { Blank } from '../../../../models/blank.model'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
    outcome: WorkspaceTargetOutcome
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const text = (value: unknown) => String(value ?? '').trim()
const workspaceBlankIds = computed(() =>
  props.collection.map((blank) => text(blank.id)).filter(Boolean)
)
const workspaceBlankIdSet = computed(() => new Set(workspaceBlankIds.value))
const cards = computed(() =>
  props.collection
    .map((blank) => {
      const id = text(blank.id)
      if (!id) return null

      return {
        id,
        title: text(blank.name) || id,
        subtitle: text(blank.status),
        meta: id,
        badges: [text(blank.status)].filter(Boolean),
      }
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

function selectBlank(id: string) {
  if (!workspaceBlankIdSet.value.has(text(id))) return
  emit('select', id)
}
</script>
