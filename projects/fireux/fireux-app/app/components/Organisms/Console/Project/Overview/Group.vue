<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Projects available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Projects
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Projects</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <div v-if="groupCards.length" class="mt-4 space-y-2">
      <ProjectCardsPill
        v-for="card in groupCards"
        :key="card.id"
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </div>

    <p v-else class="mt-4 console-card-header__description">
      {{ emptyGroupDescription }}
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

type ProjectOverviewGroupState = {
  items: ProjectSurface[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: ProjectOverviewGroupState
  mode: string
}>()

const { pill } = useProjectInterface()

const groupCards = computed<ProjectPillCard[]>(() =>
  props.group.items
    .map((project) => pill(project))
    .filter((card): card is ProjectPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo projects available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test project available in this console.'
      : 'Live projects available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo projects are currently in scope.'
    : props.mode === 'test'
      ? 'No test project is currently in scope.'
      : 'No live projects are currently in scope.'
)
</script>
