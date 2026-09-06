<template>
  <WorkspaceAI :aria-label="`${entityLabel} Test AI`" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(request && prompt.trim() && !submitting)"
      :submitting="submitting"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
      :placeholder="`Ask ${entityLabel} Test AI…`"
      :suggestions="suggestions"
      suggestions-aria-label="Available Test primitives"
      :aria-label="`Ask ${entityLabel} Test AI`"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import {
  useTestAI,
  type TestAIIntent,
} from '../../../composables/fireux/useTestAI'
import type { useTest } from '../../../composables/fireux/useTest'
type WorkspaceTestDerived = ReturnType<typeof useTest>['derived']['value']
const props = defineProps<{
  entityLabel: string
  derived: WorkspaceTestDerived
  selectedId?: string
  request?: (prompt: string) => Promise<TestAIIntent>
}>()
const emit = defineEmits<{ action: [intent: TestAIIntent] }>()
const prompt = ref('')
const message = ref('')
const submitting = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
async function submit() {
  if (!props.request || !prompt.value.trim() || submitting.value) return
  const selectedId = props.selectedId
  submitting.value = true
  message.value = ''
  try {
    const intent = await props.request(prompt.value.trim())
    if (!active) return
    if (selectedId !== props.selectedId) {
      message.value =
        'The selected Test changed. Please send your request again.'
      return
    }
    if (
      intent.action !== 'none' &&
      !props.derived.capability.primitives[intent.action].available
    ) {
      message.value = 'That action is not currently available.'
      return
    }
    message.value =
      intent.action === 'none'
        ? intent.message
        : `Opened the ${intent.action} dialog for you to review.`
    if (intent.action !== 'none') emit('action', intent)
  } catch (cause) {
    message.value =
      cause instanceof Error
        ? cause.message
        : 'AI request failed. Please try again.'
  } finally {
    submitting.value = false
  }
}

const { suggestions } = useTestAI(() => props.derived)
</script>
