<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <GoQrProviderToolsText class="w-full" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

definePageMeta({
  layout: false,
})

const toolRoot = ref<HTMLElement | null>(null)

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'text',
})
</script>
