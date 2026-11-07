<template>
  <UPage ref="toolRoot">
    <ProviderToolsOrdering />
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

definePageMeta({
  layout: false,
})

const toolRoot = ref<HTMLElement | null>(null)

useToolProviderHeight({
  provider: 'misebox',
  root: toolRoot,
  tool: 'ordering',
})
</script>
