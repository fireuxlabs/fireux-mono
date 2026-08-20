<template>
  <div class="kitchen-ai-welcome__tools" aria-label="AI tools">
    <UButton
      v-for="tool in tools"
      :key="tool.id"
      :label="tool.label"
      :icon="tool.icon"
      color="primary"
      variant="soft"
      size="sm"
      @click="emit('select', tool.prompt)"
    />
  </div>
</template>

<script setup lang="ts">
import type { KitchenAIToolNugget } from './types'

withDefaults(defineProps<{ tools?: readonly KitchenAIToolNugget[] }>(), {
  tools: () => [],
})
const emit = defineEmits<{ select: [prompt: string] }>()
</script>
