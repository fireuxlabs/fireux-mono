<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected project in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <ProjectCardsPill
        v-if="focusCard"
        v-bind="focusCard"
        :link="false"
        :show-badges="false"
      />

      <div class="console-summary-grid">
        <div class="console-summary-field">
          Mode:
          <span class="console-summary-value">{{ focusModeLabel }}</span>
        </div>
        <div class="console-summary-field">
          Project ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Projects in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No project is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useProjectInterface,
  type ProjectSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

type ProjectPillCard = NonNullable<
  ReturnType<ReturnType<typeof useProjectInterface>['pill']>
>

type ProjectOverviewFocusState = {
  entity: ProjectSurface | null
  id: string
  mode: string
  hasSelection: boolean
}

type ProjectOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: ProjectOverviewFocusState
  group: ProjectOverviewGroupSummary
}>()

const { pill } = useProjectInterface()

const focusCard = computed<ProjectPillCard | null>(() => {
  const project = props.focus.entity
  if (!project) return null
  return pill(project) ?? null
})

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
