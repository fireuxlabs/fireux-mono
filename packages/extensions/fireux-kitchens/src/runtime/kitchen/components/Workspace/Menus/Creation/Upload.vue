<template>
  <section class="space-y-3">
    <ProviderGoQrTools
      v-if="canUseTool"
      tool="doc"
      :payload="payload"
      :auth-token="authToken"
    />

    <UAlert
      v-else-if="!currencyCode"
      color="warning"
      variant="soft"
      title="Currency required"
      description="Select a kitchen currency code before creating menus."
    />
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useKitchenWorkspaceMenuUploadPayload } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuUploadPayload'

const props = defineProps<{
  uploadId?: string
  lockSlug?: boolean
  replaceExisting?: boolean
  title?: string
  description?: string
  ctaLabel?: string
}>()

const { canUseTool, currencyCode, payload, authToken } =
  useKitchenWorkspaceMenuUploadPayload({
    uploadId: toRef(props, 'uploadId'),
    lockSlug: toRef(props, 'lockSlug'),
    replaceExisting: toRef(props, 'replaceExisting'),
    title: toRef(props, 'title'),
    description: toRef(props, 'description'),
    ctaLabel: toRef(props, 'ctaLabel'),
  })
</script>
