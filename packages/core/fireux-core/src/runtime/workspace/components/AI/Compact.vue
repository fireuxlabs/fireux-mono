<template>
  <section class="workspace-ai-compact" :aria-label="ariaLabel">
    <div
      v-if="$slots.results"
      class="workspace-ai-compact__results"
      role="region"
      :aria-label="resultsLabel"
      tabindex="0"
    >
      <slot name="results" />
    </div>
    <div class="workspace-ai-compact__composer">
      <slot name="composer" :spacious="false">
        <WorkspaceAICompactComposer
          :model-value="modelValue"
          :placeholder="placeholder"
          :aria-label="ariaLabel"
          :submitting="submitting"
          :disabled="disabled"
          :can-submit="canSubmit"
          @update:model-value="emit('update:modelValue', $event)"
          @submit="emit('submit')"
        />
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    resultsLabel?: string
    submitting?: boolean
    disabled?: boolean
    canSubmit?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask about this page…',
    ariaLabel: 'Workspace AI',
    resultsLabel: 'Workspace AI results',
    submitting: false,
    disabled: false,
    canSubmit: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>

<style scoped>
.workspace-ai-compact {
  display: grid;
  gap: calc(var(--spacing) * 3);
  min-width: 0;
}

.workspace-ai-compact__results {
  display: grid;
  gap: calc(var(--spacing) * 3);
  max-height: 18rem;
  overflow: auto;
  overflow-wrap: anywhere;
  min-width: 0;
  padding: calc(var(--spacing) * 2);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}

.workspace-ai-compact__results:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.workspace-ai-compact__composer {
  min-width: 0;
}
</style>
