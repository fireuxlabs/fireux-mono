<template>
  <main ref="toolRoot" class="min-h-svh bg-[#f7f3e8] p-4 sm:p-6">
    <ProviderToolFrame
      provider-name="Misebox"
      provider-url="https://misebox.app"
      title="Misebox ordering"
      description="Hosted ordering tool placeholder for external websites."
      endpoint="/tools/ordering"
      logo-alt="Misebox"
    >
      <div class="flex min-h-64 items-center justify-center rounded-2xl bg-white p-8">
        <img
          src="/img/app/logo.png"
          alt="Misebox"
          class="h-24 w-24 rounded-2xl object-contain shadow-sm"
        >
      </div>
    </ProviderToolFrame>
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
  provider: 'misebox',
  root: toolRoot,
  tool: 'ordering',
})
</script>
