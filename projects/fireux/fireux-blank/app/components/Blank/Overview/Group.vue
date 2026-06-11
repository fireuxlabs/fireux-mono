<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Blanks available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Blanks
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Blanks</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <p v-if="!group.hasItems" class="mt-4 console-card-header__description">
      {{ emptyGroupDescription }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Blank } from '../../../models/blank.model'

type BlankOverviewGroupState = {
  items: Blank[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: BlankOverviewGroupState
  mode: string
}>()

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo Blanks available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test Blank available in this console.'
      : 'Live Blanks available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo Blanks are currently in scope.'
    : props.mode === 'test'
      ? 'No test Blank is currently in scope.'
      : 'No live Blanks are currently in scope.'
)
</script>
