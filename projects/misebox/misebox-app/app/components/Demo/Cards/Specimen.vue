<template>
  <UCard as="article">
    <template #header>{{ label }}</template>
    <slot />
    <template #footer>
      <UButton
        :label="
          copied
            ? 'Copied'
            : failed
              ? 'Copy failed — try again'
              : 'Copy reference'
        "
        :aria-label="`Copy ${reference}`"
        icon="i-lucide-copy"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="copyReference"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ family: string; label: string }>()
const reference = computed(() => `${props.family} · ${props.label}`)
const copied = ref(false)
const failed = ref(false)

async function copyReference() {
  try {
    await navigator.clipboard.writeText(reference.value)
    copied.value = true
    failed.value = false
  } catch {
    copied.value = false
    failed.value = true
  }
}
</script>
