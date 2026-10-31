<template>
  <section class="fx-page-stack" aria-label="Supplied menu sources">
    <a
      v-if="state.request?.sourceUrl"
      :href="state.request.sourceUrl"
      target="_blank"
      rel="noopener noreferrer"
      >Supplied menu source</a
    >
    <UButton
      v-for="source in state.request?.sources"
      :key="source.id"
      variant="outline"
      @click="state.download(source.id, source.name)"
      >Download {{ source.name }}</UButton
    >
    <UFormField
      v-if="allowUpload && state.request?.stage === 'received'"
      label="Upload source"
      description="PDF, JPEG, PNG or WebP; up to 6 MB each, five files."
    >
      <UInput
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        :disabled="state.busy"
        @change="selectFile"
      />
    </UFormField>
  </section>
</template>
<script setup lang="ts">
import type { MenuExpressRequestView } from '../../composables/useMenuExpressRequest'
const props = defineProps<{
  state: Pick<
    MenuExpressRequestView,
    'request' | 'busy' | 'upload' | 'download'
  >
  allowUpload?: boolean
}>()
function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void props.state.upload(file)
}
</script>
