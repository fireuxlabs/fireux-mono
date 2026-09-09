<template>
  <UCard>
    <template #header><div class="flex items-center justify-between gap-3"><h3 class="font-semibold">{{ app.name }} — preview</h3><UButton @click="download">Download HTML</UButton></div></template>
    <iframe :srcdoc="html" sandbox="" :title="`${app.name} preview`" class="h-[32rem] w-full rounded-lg border border-default" />
    <template #footer><p class="text-sm text-muted">Generated from the saved App. Hosting has not been provisioned.</p></template>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { App } from '../models/app.model'
import { renderAppPreview } from '../utils/renderAppPreview'
const props = defineProps<{ app: App }>()
const html = computed(() => renderAppPreview(props.app))
function download() {
  const url = URL.createObjectURL(new Blob([html.value], { type: 'text/html' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.app.id}.html`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
