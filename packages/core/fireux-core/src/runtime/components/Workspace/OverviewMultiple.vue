<!-- Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: render overview collection state from outcome. -->
<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: use Nuxt UI for the single compact collection summary. -->
<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Multiple</div>
        <p class="workspace-card-header__description">
          {{ entityPluralLabel }} available in the selected workspace source.
        </p>
      </div>
    </template>

    <p v-if="multiple.outcome === 'idle'" class="workspace-card-header__description">
      No {{ entityPluralLower }} source is active.
    </p>

    <p v-else-if="multiple.outcome === 'pending'" class="workspace-card-header__description">
      Loading {{ entityPluralLower }}…
    </p>

    <UAlert
      v-else-if="multiple.outcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="`${entityPluralLabel} could not be loaded`"
      description="Please try again."
    />

    <UPageFeature
      v-else
      icon="i-lucide-layers-3"
      :title="`${multipleCountLabel} ${entityPluralLabel}`"
      :description="multipleDescription"
    />

    <div
      v-if="multiple.outcome === 'ready' && cards.length"
      class="mt-4 space-y-2"
    >
      <WorkspaceTargetCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :show-badges="showBadges"
      />
    </div>

    <p
      v-else-if="multiple.outcome === 'empty'"
      class="mt-4 workspace-card-header__description"
    >
      {{ emptyMultipleDescription }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard as WorkspaceTargetCardType } from './types'
import type { WorkspaceOutcome } from '../../composables/fireux/workspace/workspace-outcome'

type WorkspaceOverviewMultipleState = {
  count: number
  hasItems: boolean
  outcome: WorkspaceOutcome
}

const props = withDefaults(
  defineProps<{
    entityLabel: string
    entityPluralLabel: string
    multiple: WorkspaceOverviewMultipleState
    cards?: WorkspaceTargetCardType[]
    showBadges?: boolean
  }>(),
  {
    cards: () => [],
    showBadges: false,
  }
)

const entityPluralLower = computed(() => props.entityPluralLabel.toLowerCase())
const multipleCountLabel = computed(() =>
  props.multiple.outcome === 'ready' || props.multiple.outcome === 'empty'
    ? String(props.multiple.count)
    : '—'
)
const multipleDescription = computed(() =>
  `Available ${entityPluralLower.value} in your current workspace scope.`
)
const emptyMultipleDescription = computed(() =>
  `No ${entityPluralLower.value} are currently in scope.`
)
</script>
