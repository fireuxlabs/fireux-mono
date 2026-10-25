<template>
  <div
    v-if="message"
    class="fx-state"
    :role="outcome === 'error' ? 'alert' : 'status'"
    :aria-live="outcome === 'error' ? 'assertive' : 'polite'"
    :aria-busy="outcome === 'pending'"
    aria-atomic="true"
  >
    <UIcon
      v-if="outcome === 'pending'"
      name="i-lucide-loader-2"
      class="fx-state__spinner"
      aria-hidden="true"
    />
    <p>{{ message }}</p>
    <FireCopyError
      v-if="outcome === 'error' && error"
      :message="String(error)"
    />
    <UButton
      v-if="outcome === 'error' && retryable"
      label="Try again"
      variant="soft"
      color="neutral"
      @click="$emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReadOutcome } from '../../utils/read-outcome'

const props = withDefaults(
  defineProps<{
    outcome: ReadOutcome
    entity?: string
    error?: unknown
    retryable?: boolean
  }>(),
  { entity: 'content' }
)

defineEmits<{ retry: [] }>()

const message = computed(() => {
  const entity = props.entity.trim() || 'content'
  switch (props.outcome) {
    case 'pending':
      return `Loading ${entity}…`
    case 'error':
      return `Unable to load ${entity}.`
    case 'empty':
      return `No ${entity} yet.`
    default:
      return ''
  }
})
</script>

<style scoped>
.fx-state {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
}

.fx-state p {
  margin: 0;
}

.fx-state__spinner {
  width: 1.25em;
  height: 1.25em;
  color: var(--ui-primary);
  animation: fx-state-spin 1s linear infinite;
}

@keyframes fx-state-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fx-state__spinner {
    animation: none;
  }
}
</style>
