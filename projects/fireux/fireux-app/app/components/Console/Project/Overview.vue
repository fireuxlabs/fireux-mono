<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
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

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">All</div>
            <p class="console-card-header__description">
              Your live projects available in this console.
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
            Live projects available in your current workspace scope.
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
          No live projects are currently in scope.
        </p>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useProjectInterface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import { useProjectConsoleOverview } from '../../../composables/fireux/project-console/useProjectConsoleOverview'

type ProjectPillCard = NonNullable<
  ReturnType<ReturnType<typeof useProjectInterface>['pill']>
>

const { focus, group } = useProjectConsoleOverview()
const { pill } = useProjectInterface()

const focusCard = computed<ProjectPillCard | null>(() => {
  const project = focus.value.entity
  if (!project) return null
  return pill(project) ?? null
})

const groupCards = computed<ProjectPillCard[]>(() =>
  group.value.items
    .map((project) => pill(project))
    .filter((card): card is ProjectPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(group.value.count))
const focusModeLabel = computed(() =>
  focus.value.mode === 'demo' ? 'Demo' : focus.value.mode === 'test' ? 'Test' : 'Live'
)
</script>
