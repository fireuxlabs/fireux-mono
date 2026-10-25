<template>
  <div class="min-w-0 space-y-2">
    <div
      class="overflow-hidden rounded-xl border border-default bg-elevated/40"
    >
      <div
        class="flex items-center justify-between gap-3 border-b border-default px-4 py-2.5"
      >
        <div class="flex min-w-0 items-center gap-2 text-sm">
          <UIcon name="i-lucide-code-xml" class="size-4 shrink-0 text-muted" />
          <span class="font-medium">Embed code</span>
          <span class="text-xs text-muted">HTML</span>
        </div>
        <UButton
          :label="copied ? 'Copied' : 'Copy code'"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          :color="copied ? 'success' : 'neutral'"
          variant="ghost"
          size="sm"
          :disabled="!code"
          @click="copy"
        />
      </div>
      <pre
        :id="codeId"
        tabindex="0"
        role="region"
        aria-label="Website ordering HTML code"
        class="m-0 overflow-auto p-4 font-mono text-xs leading-6 text-toned outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        :class="expanded ? 'max-h-128' : 'max-h-56'"
      ><code>{{ code }}</code></pre>
      <div
        class="flex items-center justify-between gap-3 border-t border-default px-4 py-2"
      >
        <span class="text-xs text-muted"
          >Copy the whole snippet into an HTML block.</span
        >
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
    </div>
    <span class="sr-only" role="status">{{
      copied ? 'Code copied to clipboard.' : ''
    }}</span>
    <FireCopyError v-if="copyError" :message="copyError" />
  </div>
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
