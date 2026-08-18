<!-- Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make idle target presentation explicit. -->
<!-- Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: render target states from outcome rather than count. -->
<template>
  <section
    v-if="outcome !== 'idle'"
    class="console-target-collection"
    :aria-busy="outcome === 'pending'"
  >
    <header class="console-target-collection__header">
      <div class="console-target-collection__copy">
        <slot name="header">
          <h2 class="console-target-collection__title">
            {{ resolvedTitle }}
          </h2>
          <p
            v-if="description"
            class="console-target-collection__description"
          >
            {{ description }}
          </p>
        </slot>
      </div>

      <div
        v-if="$slots.actions || isSettled"
        class="console-target-collection__aside"
      >
        <slot name="actions" />

        <UBadge
          v-if="isSettled"
          color="neutral"
          variant="soft"
          :aria-label="`${count} ${entity}`"
        >
          {{ count }}
        </UBadge>
      </div>
    </header>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      class="console-target-collection__state"
      :entity="entity"
      state="loading"
      surface="bare"
      layout="banner"
      :uppercase="false"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      class="console-target-collection__state"
      :entity="entity"
      state="error"
      surface="bare"
      layout="banner"
      :uppercase="false"
      :description="errorDescription"
    >
      <div
        v-if="retryable"
        class="console-target-collection__state-action"
      >
        <UButton
          size="sm"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="emit('retry')"
        >
          Retry
        </UButton>
      </div>
    </MoleculesStateCard>

    <div
      v-else-if="outcome === 'ready'"
      class="console-target-collection__items"
      :class="[
        `console-target-collection__items--${layout}`,
        itemsClass,
      ]"
    >
      <slot />
    </div>

    <MoleculesStateCard
      v-else-if="outcome === 'empty'"
      class="console-target-collection__state"
      :entity="entity"
      state="empty"
      surface="bare"
      layout="banner"
      :uppercase="false"
      :title="emptyTitle"
      :description="emptyDescription"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from '../../composables/fireux/console/useConsoleIndex'

const props = withDefaults(
  defineProps<{
    outcome: ConsoleTargetOutcome
    count: number
    entity: string
    errorDescription: string
    emptyTitle: string
    emptyDescription: string
    title?: string
    description?: string
    layout?: 'grid' | 'list'
    itemsClass?: string
    retryable?: boolean
  }>(),
  {
    title: '',
    description: '',
    layout: 'grid',
    itemsClass: '',
    retryable: false,
  }
)
const emit = defineEmits<{
  (event: 'retry'): void
}>()

const isSettled = computed(() =>
  props.outcome === 'ready' || props.outcome === 'empty'
)
const resolvedTitle = computed(
  () => String(props.title ?? '').trim() || 'Choose target'
)
</script>

<style scoped>
.console-target-collection {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}

.console-target-collection__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.console-target-collection__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.console-target-collection__copy :deep(h2),
.console-target-collection__title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.console-target-collection__copy :deep(p),
.console-target-collection__description {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.console-target-collection__aside {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 2);
}

.console-target-collection__items {
  min-width: 0;
}

.console-target-collection__items--grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, calc(var(--spacing) * 72)), 1fr)
  );
  gap: calc(var(--spacing) * 3);
}

.console-target-collection__items--list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 3);
}

.console-target-collection__state {
  border-block: 1px solid var(--ui-border);
}

.console-target-collection__state-action {
  display: flex;
  justify-content: center;
  margin-top: calc(var(--spacing) * 4);
}
</style>
