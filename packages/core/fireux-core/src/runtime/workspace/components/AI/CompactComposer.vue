<template>
  <UChatPrompt
    class="workspace-ai-prompt-bar"
    :model-value="modelValue"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    :autofocus="false"
    :rows="1"
    :maxrows="4"
    :disabled="disabled"
    variant="soft"
    @update:model-value="emit('update:modelValue', $event)"
    @submit.prevent="submit"
  >
    <template #footer>
      <slot name="actions" />
      <UChatPromptSubmit
        :status="submitting ? 'submitted' : 'ready'"
        :disabled="disabled || submitting || !canSubmit || !modelValue.trim()"
        aria-label="Submit prompt"
      />
    </template>
  </UChatPrompt>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    submitting?: boolean
    disabled?: boolean
    canSubmit?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask about this page…',
    ariaLabel: 'Ask Workspace AI',
    submitting: false,
    disabled: false,
    canSubmit: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
function submit() {
  if (
    props.disabled ||
    props.submitting ||
    !props.canSubmit ||
    !props.modelValue.trim()
  )
    return
  emit('submit')
}
</script>

<style scoped>
.workspace-ai-prompt-bar {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: calc(var(--spacing) * 2);
}

.workspace-ai-prompt-bar :deep([data-slot='body']) {
  flex: 1 1 0%;
  min-width: 0;
}

.workspace-ai-prompt-bar :deep([data-slot='footer']) {
  flex: 0 0 auto;
  gap: var(--spacing);
}
</style>
