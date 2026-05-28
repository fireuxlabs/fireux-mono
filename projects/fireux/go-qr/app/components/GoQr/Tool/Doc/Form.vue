<template>
  <PublicQrFileUploadTool
    :endpoint="tool.endpoints.create"
    config-endpoint="/api/tools/doc/config"
    :upload-label="tool.ui.upload_label"
    :cta-label="tool.ui.cta_label"
    :loading-label="tool.ui.loading_label"
    :slug-label="tool.slug.label"
    :slug-validation-label="tool.slug.validation_label"
    :slug-placeholder="tool.slug.placeholder"
    :preview-base-url="tool.preview.base_url"
    :preview-path-suffix="tool.preview.path_suffix"
    :availability-endpoint="tool.endpoints.availability"
    :taken-message="tool.slug.taken_message"
    :reserved-slugs="tool.slug.reserved"
    :max-file-size-mb="tool.tool.max_file_size_mb"
    :success-title="tool.ui.success_title"
    :open-target-label="tool.ui.open_target_label"
    :open-qr-label="tool.ui.open_qr_label"
    navigate-on-success
  />
</template>

<script setup lang="ts">
import type { GoQrDocToolContract } from '../../../../utils/goQrProviderClient'

defineProps<{
  tool: GoQrDocToolContract
}>()
</script>
