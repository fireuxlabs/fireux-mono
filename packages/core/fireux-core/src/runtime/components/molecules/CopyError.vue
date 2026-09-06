<template>
  <UButton
    :label="
      copied ? 'Copied' : failed ? 'Copy failed — try again' : 'Copy error'
    "
    icon="i-lucide-copy"
    color="neutral"
    variant="ghost"
    size="sm"
    @click="copy"
  />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ message: string }>()
const copied = ref(false)
const failed = ref(false)
watch(
  () => props.message,
  () => {
    copied.value = false
    failed.value = false
  }
)
async function copy() {
  try {
    await navigator.clipboard.writeText(props.message)
    copied.value = true
    failed.value = false
  } catch {
    copied.value = false
    failed.value = true
  }
}
</script>
