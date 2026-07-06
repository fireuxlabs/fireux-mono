<template>
  <aside class="rounded-md border border-default bg-muted/30 p-4">
    <div class="mb-3 flex items-start justify-between gap-3">
      <h3 class="text-sm font-black text-highlighted">
        {{ title }}
      </h3>

      <UButton
        color="neutral"
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        size="xs"
        variant="ghost"
        :aria-label="copyLabel"
        @click="copyShape"
      />
    </div>

    <div class="max-h-96 overflow-auto rounded-md bg-default p-3 text-xs leading-5">
      <OrderingObjectNode :value="data" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  data: unknown
  title: string
}>()

const copied = ref(false)
const copyLabel = computed(() =>
  copied.value ? 'Copied object shape' : `Copy ${props.title}`
)
const copyPayload = computed(() => {
  try {
    return JSON.stringify(props.data, null, 2)
  } catch {
    return String(props.data)
  }
})

async function copyShape() {
  if (!import.meta.client || !navigator.clipboard) return

  await navigator.clipboard.writeText(copyPayload.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>
