<template>
  <UBadge
    color="neutral"
    variant="outline"
    icon="i-lucide-sparkles"
    role="status"
  >
    {{ placeholder }}
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ capability: string }>()
const placeholder = computed(() => `Ask about ${props.capability}…`)
</script>
