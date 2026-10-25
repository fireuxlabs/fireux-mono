<!-- Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make idle entity presentation explicit. -->
<!-- Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: render entity states from outcome rather than count. -->
<template>
  <section
    v-if="outcome !== 'idle'"
    class="workspace-entity-collection"
    :aria-busy="outcome === 'pending'"
  >
    <header class="workspace-entity-collection__header">
      <div class="workspace-entity-collection__copy">
        <slot name="header">
          <h2 class="workspace-entity-collection__title">
            {{ resolvedTitle }}
          </h2>
          <p
            v-if="description"
            class="workspace-entity-collection__description"
          >
            {{ description }}
          </p>
        </slot>
      </div>

      <div
        v-if="$slots.actions || isSettled"
        class="workspace-entity-collection__aside"
      >
        <slot name="actions" />

        <UBadge
          v-if="isSettled && count > 0"
          color="neutral"
          variant="soft"
          :aria-label="`${count} ${entity}`"
        >
          {{ count }}
        </UBadge>
      </div>
    </header>

    <FireStateCard
      v-if="outcome === 'pending'"
      class="workspace-entity-collection__state"
      :entity="entity"
      state="loading"
      surface="bare"
      layout="banner"
      :uppercase="false"
    />

    <FireStateCard
      v-else-if="outcome === 'error' || outcome === 'missing'"
      class="workspace-entity-collection__state"
      :entity="entity"
      state="error"
      surface="bare"
      layout="banner"
      :uppercase="false"
      :description="errorDescription"
    >
      <div v-if="retryable" class="workspace-entity-collection__state-action">
        <UButton
          size="sm"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="emit('retry')"
        >
          Retry
        </UButton>
      </div>
    </FireStateCard>

    <div
      v-else-if="outcome === 'ready'"
      class="workspace-entity-collection__items"
      :class="[`workspace-entity-collection__items--${layout}`, itemsClass]"
    >
      <slot />
    </div>

    <FireStateCard
      v-else-if="outcome === 'empty'"
      class="workspace-entity-collection__state"
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
import type { WorkspaceEntityOutcome } from '../models/outcome'

const props = withDefaults(
  defineProps<{
    outcome: WorkspaceEntityOutcome
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

const isSettled = computed(
  () => props.outcome === 'ready' || props.outcome === 'empty'
)
const resolvedTitle = computed(
  () => String(props.title ?? '').trim() || 'Choose entity'
)
</script>

<style scoped>
.workspace-entity-collection {
  display: grid;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}

.workspace-entity-collection__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.workspace-entity-collection__copy {
  display: grid;
  gap: var(--spacing);
  min-width: 0;
}

.workspace-entity-collection__copy :deep(h2),
.workspace-entity-collection__title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.workspace-entity-collection__copy :deep(p),
.workspace-entity-collection__description {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}

.workspace-entity-collection__aside {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) * 2);
}

.workspace-entity-collection__items {
  min-width: 0;
}

.workspace-entity-collection__items--grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, calc(var(--spacing) * 72)), 1fr)
  );
  gap: calc(var(--spacing) * 3);
}

.workspace-entity-collection__items--list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 3);
}

.workspace-entity-collection__state {
  padding: calc(var(--spacing) * 4);
  border: 1px dashed var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.workspace-entity-collection__state-action {
  display: flex;
  justify-content: center;
  margin-top: calc(var(--spacing) * 4);
}
</style>
