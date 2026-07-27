<!-- Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make idle target presentation explicit. -->
<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: render target states from outcome rather than count. -->
<template>
  <section v-if="outcome !== 'idle'" class="space-y-2">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <slot name="header" />
          </div>

          <UBadge v-if="isSettled" variant="soft">
            {{ count }}
          </UBadge>
        </div>
      </template>

      <MoleculesStateCard
        v-if="outcome === 'pending'"
        :entity="entity"
        state="loading"
        surface="bare"
      />

      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        :entity="entity"
        state="error"
        surface="bare"
        :description="errorDescription"
      >
        <UButton
          v-if="retryable"
          size="sm"
          variant="soft"
          @click="emit('retry')"
        >
          Retry
        </UButton>
      </MoleculesStateCard>

      <div v-else-if="outcome === 'ready'" :class="itemsClass">
        <slot />
      </div>

      <MoleculesStateCard
        v-else-if="outcome === 'empty'"
        :entity="entity"
        state="empty"
        surface="bare"
        :title="emptyTitle"
        :description="emptyDescription"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from '../../composables/fireux/app/console/useConsoleIndex'

const props = withDefaults(
  defineProps<{
    outcome: ConsoleTargetOutcome
    count: number
    entity: string
    errorDescription: string
    emptyTitle: string
    emptyDescription: string
    itemsClass?: string
    retryable?: boolean
  }>(),
  {
    itemsClass: 'space-y-3',
    retryable: false,
  }
)
const emit = defineEmits<{
  (event: 'retry'): void
}>()

const isSettled = computed(() =>
  props.outcome === 'ready' || props.outcome === 'empty'
)
</script>
