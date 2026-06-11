<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected Blank in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <div class="console-summary-grid">
        <div class="console-summary-field">
          Mode:
          <span class="console-summary-value">{{ focusModeLabel }}</span>
        </div>
        <div class="console-summary-field">
          Blank ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Blanks in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No Blank is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Blank } from '../../../models/blank.model'

type BlankOverviewFocusState = {
  entity: Blank | null
  id: string
  mode: string
  hasSelection: boolean
}

type BlankOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: BlankOverviewFocusState
  group: BlankOverviewGroupSummary
}>()

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
