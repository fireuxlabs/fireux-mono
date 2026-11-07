<template>
  <UCard title="Embed code" description="HTML">
    <UTextarea
      :id="codeId"
      :model-value="code"
      :rows="expanded ? 20 : 8"
      readonly
      aria-label="Website ordering HTML code"
    />
    <template #footer>
      <div class="fx-card-body-stack">
        <p>Copy the whole snippet into an HTML block.</p>
        <div class="fx-card__actions">
          <UButton
            :label="copied ? 'Copied' : 'Copy code'"
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            :color="copied ? 'success' : 'neutral'"
            variant="ghost"
            size="sm"
            :disabled="!code"
            @click="copy"
          />
          <UButton
            :label="expanded ? 'Collapse' : 'Expand'"
            :icon="expanded ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
            :aria-expanded="expanded"
            :aria-controls="codeId"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="expanded = !expanded"
          />
        </div>
        <p role="status">{{ copied ? 'Code copied to clipboard.' : '' }}</p>
        <FireCopyError v-if="copyError" :message="copyError" />
      </div>
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { ref, useId, watch } from 'vue'

const props = defineProps<{ code: string }>()
const codeId = useId()
const expanded = ref(false)
const copied = ref(false)
const copyError = ref('')

watch(
  () => props.code,
  () => {
    copied.value = false
    copyError.value = ''
    expanded.value = false
  }
)

async function copy() {
  const code = props.code
  copyError.value = ''
  try {
    await navigator.clipboard.writeText(code)
    if (props.code === code) copied.value = true
  } catch {
    if (props.code === code)
      copyError.value = 'Select the code above and copy it manually.'
  }
}
</script>
