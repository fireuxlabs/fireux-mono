<template>
  <UChatPrompt
    :model-value="modelValue"
    :placeholder="placeholder"
    :loading="submitting"
    variant="soft"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @update:model-value="emit('update:modelValue', $event)"
    @submit.prevent="emit('submit')"
  >
    <template #footer>
        <div class="flex w-full items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <slot name="leading">
            <span v-if="status" class="text-xs text-muted">{{ status }}</span>
          </slot>
        </div>
        <slot name="submit">
          <UChatPromptSubmit
            :status="submitting ? 'submitted' : 'ready'"
            label="Send"
            :disabled="!canSubmit"
          />
        </slot>
      </div>
    </template>
  </UChatPrompt>

  <div
    v-if="suggestions.length"
    class="flex flex-wrap gap-2"
    :aria-label="suggestionsAriaLabel"
  >
    <UButton
      v-for="suggestion in suggestions"
      :key="suggestion.label"
      :label="suggestion.label"
      :icon="suggestion.icon"
      color="neutral"
      variant="outline"
      size="sm"
      class="rounded-full"
      :disabled="suggestionsDisabled"
      @click="emit('selectSuggestion', suggestion)"
    />
  </div>
</template>

<script setup lang="ts">
export interface WorkspaceAISuggestion {
  label: string
  icon?: string
}

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    status?: string
    ariaLabel?: string
    submitting?: boolean
    disabled?: boolean
    canSubmit?: boolean
    suggestions?: readonly WorkspaceAISuggestion[]
    suggestionsAriaLabel?: string
    suggestionsDisabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask about this Workspace…',
    status: 'No actions are connected yet.',
    ariaLabel: 'Ask Workspace AI',
    submitting: false,
    disabled: false,
    canSubmit: false,
    suggestions: () => [],
    suggestionsAriaLabel: 'Suggested Workspace AI actions',
    suggestionsDisabled: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  selectSuggestion: [suggestion: WorkspaceAISuggestion]
}>()
</script>
