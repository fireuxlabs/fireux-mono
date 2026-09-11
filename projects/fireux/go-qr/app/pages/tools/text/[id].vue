<template>
  <main ref="toolRoot" class="bg-transparent text-default">
    <GoQrProviderToolsText
      v-if="toolConfig"
      class="w-full"
      :tool="toolConfig"
    />
    <GoQrProviderToolsComingSoon v-else name="Text" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

type TextToolConfig = {
  copy: {
    title: string
    description: string
  }
  content: {
    message: string
  }
}

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
const id = readRouteParam(route.params.id)
const toolRead = useLiveAsyncData<{ config: TextToolConfig } | null>(
  `go-qr-text:${id}`,
  (liveFetch) =>
    id
      ? liveFetch(`/api/tools/text/${encodeURIComponent(id)}`)
      : Promise.resolve(null)
)
const toolConfig = computed(() => toolRead.data.value?.config || null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'text',
})
</script>
