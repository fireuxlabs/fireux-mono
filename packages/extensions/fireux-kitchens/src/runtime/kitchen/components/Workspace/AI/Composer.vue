<template>
  <div class="contents">
    <div
      v-if="starters.length"
      class="kitchen-ai-welcome__starters"
      aria-label="Suggested starting points"
    >
      <UButton
        v-for="starter in starters"
        :key="starter.label"
        :label="starter.label"
        :icon="starter.icon"
        color="neutral"
        variant="soft"
        @click="emit('update:modelValue', starter.prompt)"
      />
    </div>

    <ToolNuggets
      v-if="aiTools.length"
      :tools="aiTools"
      @select="emit('update:modelValue', $event)"
    />

    <form class="kitchen-ai-welcome__composer" @submit.prevent="emit('submit')">
      <input
        v-if="allowFile"
        ref="fileInput"
        class="sr-only"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.xlsx,.xls"
        @change="selectFile"
      />
      <UButton
        v-if="allowFile"
        icon="i-lucide-paperclip"
        color="neutral"
        variant="ghost"
        aria-label="Upload your existing menu"
        @click="fileInput?.click()"
      />
      <PromptInput
        :model-value="modelValue"
        class="kitchen-ai-welcome__input"
        :placeholder="placeholder"
        :suggestions="suggestions"
        :aria-label="ariaLabel"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <UButton
        type="submit"
        icon="i-lucide-arrow-up"
        color="primary"
        :loading="submitting"
        :disabled="!modelValue.trim() || submitting"
        aria-label="Send"
      />
    </form>

    <p v-if="allowFile" class="kitchen-ai-welcome__privacy">
      Selected files stay in your browser. Kitchen questions use the selected
      Live Kitchen only.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PromptInput from './PromptInput.vue'
import ToolNuggets from './ToolNuggets.vue'
import type { KitchenAIStarter, KitchenAIToolNugget } from './types'

withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    suggestions?: readonly string[]
    starters?: readonly KitchenAIStarter[]
    aiTools?: readonly KitchenAIToolNugget[]
    allowFile?: boolean
    commandMode?: boolean
    ariaLabel?: string
    submitting?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Ask Kitchen AI…',
    suggestions: () => [],
    starters: () => [],
    aiTools: () => [],
    allowFile: true,
    commandMode: false,
    ariaLabel: 'Ask KitchenAI',
    submitting: false,
  }
)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  file: [file: File]
}>()
const fileInput = ref<HTMLInputElement | null>(null)

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('file', file)
  input.value = ''
}
</script>
