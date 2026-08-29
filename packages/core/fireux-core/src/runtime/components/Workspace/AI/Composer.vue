<template>
  <UChatPrompt
    :model-value="modelValue"
    :placeholder="placeholder"
    :loading="submitting"
    :disabled="!connected"
    :aria-label="ariaLabel"
    @update:model-value="emit('update:modelValue', $event)"
    @submit.prevent="emit('submit')"
  >
    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <slot name="leading">
            <span class="text-xs text-muted">{{ status }}</span>
          </slot>
        </div>
        <slot name="submit">
          <UChatPromptSubmit
            v-if="connected"
            :status="submitting ? 'submitted' : 'ready'"
            label="Send"
          />
          <UButton
            v-else
            label="Not connected"
            color="neutral"
            variant="soft"
            disabled
          />
        </slot>
      </div>
    </template>
  </UChatPrompt>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    status?: string
    ariaLabel?: string
    submitting?: boolean
    connected?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask about this Workspace…',
    status: 'No actions are connected yet.',
    ariaLabel: 'Ask Workspace AI',
    submitting: false,
    connected: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>
