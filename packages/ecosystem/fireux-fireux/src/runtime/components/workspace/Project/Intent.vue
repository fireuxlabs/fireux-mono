<template>
  <WorkspaceAI :aria-label="`${label} AI`" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      :placeholder="`Ask ${label} AI…`"
      :aria-label="`Ask ${label} AI`"
      :can-submit="
        Boolean(prompt.trim() && availableActions.length && !submitting)
      "
      :submitting="submitting"
      :suggestions="suggestions"
      :suggestions-aria-label="`Available ${label} actions`"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { ProjectIntent } from '../../../project/models/intent'
const props = defineProps<{
  initialPrompt?: string
  label: string
  scopeKey: string
  availableActions: readonly string[]
  suggestions: { label: string }[]
  request: (prompt: string) => Promise<ProjectIntent>
}>()
const emit = defineEmits<{ action: [intent: ProjectIntent] }>()
const prompt = ref('')
watch(
  () => props.initialPrompt,
  (value: string | undefined) => {
    if (value && !prompt.value) prompt.value = value
  },
  { immediate: true }
)
const message = ref('')
const submitting = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
async function submit() {
  if (!prompt.value.trim() || submitting.value) return
  const scope = props.scopeKey
  submitting.value = true
  message.value = ''
  try {
    const intent = await props.request(prompt.value.trim())
    if (!active) return
    if (scope !== props.scopeKey) {
      message.value =
        'The workspace or selected record changed. Send your request again.'
      return
    }
    if (
      intent.action !== 'none' &&
      !props.availableActions.includes(intent.action)
    ) {
      message.value = 'That action is no longer available.'
      return
    }
    message.value =
      intent.action === 'none' || intent.action === 'read'
        ? intent.message
        : 'Review the prepared form. Nothing has been saved yet.'
    if (intent.action !== 'none') emit('action', intent)
  } catch (cause) {
    if (active)
      message.value =
        cause instanceof Error
          ? cause.message
          : 'AI could not prepare that action. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>
