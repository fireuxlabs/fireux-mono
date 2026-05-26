<template>
  <div>
    <PublicQrFileUploadTool
      v-if="tool"
      :endpoint="client.resolveUrl(tool.endpoints.create)"
      :config-endpoint="client.resolveUrl('/api/tools/public-doc/config')"
      :upload-label="tool.ui.upload_label"
      :cta-label="tool.ui.cta_label"
      :loading-label="tool.ui.loading_label"
      :safety-copy="tool.ui.safety_copy"
      :slug-label="tool.slug.label"
      :slug-validation-label="tool.slug.validation_label"
      :slug-placeholder="tool.slug.placeholder"
      :preview-base-url="tool.preview.base_url"
      :preview-path-suffix="tool.preview.path_suffix"
      :availability-endpoint="client.resolveUrl(tool.endpoints.availability)"
      :taken-message="tool.slug.taken_message"
      :reserved-slugs="tool.slug.reserved"
      :max-file-size-mb="tool.tool.max_file_size_mb"
      :success-title="tool.ui.success_title"
      :open-target-label="tool.ui.open_target_label"
      :open-qr-label="tool.ui.open_qr_label"
      navigate-on-success
    />

    <UCard
      v-else
      variant="subtle"
    >
      <div class="space-y-3">
        <USkeleton class="h-5 w-2/3" />
        <USkeleton class="h-32 w-full" />
        <USkeleton class="h-10 w-full" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { createGoQrClient, type GoQrToolContract } from '../utils/goQrProviderClient'

const props = withDefaults(defineProps<{
  providerBaseUrl?: string
}>(), {
  providerBaseUrl: '',
})

const client = createGoQrClient({ baseUrl: props.providerBaseUrl })
const { data: tool } = await useAsyncData<GoQrToolContract>(
  `go-qr-public-doc-tool:${props.providerBaseUrl || 'self'}`,
  () => client.publicDoc.config()
)
</script>
