<template>
  <main ref="toolRoot" class="bg-transparent text-default">
    <GoQrProviderToolsUrl v-if="toolConfig" class="w-full" :tool="toolConfig" />
    <GoQrProviderToolsComingSoon v-else name="URL" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

type UrlToolConfig = {
  copy: {
    title: string
    description: string
    ctaLabel: string
    downloadLabel: string
    openTargetLabel: string
  }
  url: {
    label: string
    placeholder: string
    initialValue: string
    autoGenerate: boolean
    invalidMessage: string
  }
  qr: {
    centreLabel: string
  }
  presentation: {
    qrOnly: boolean
  }
}

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
const id = readRouteParam(route.params.id)
const toolRead = useLiveAsyncData<{ config: UrlToolConfig } | null>(
  `go-qr-url:${id}`,
  (liveFetch) =>
    id
      ? liveFetch(`/api/tools/url/${encodeURIComponent(id)}`)
      : Promise.resolve(null)
)
const toolConfig = computed(() => toolRead.data.value?.config || null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'url',
})
</script>
