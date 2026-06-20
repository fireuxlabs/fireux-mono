<template>
  <section class="space-y-3">
    <ProviderGoQrTools
      v-if="canUseTool"
      tool="doc"
      :payload="payload"
      :auth-token="authToken"
    />
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useKitchenConsoleMenuUploadPayload } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuUploadPayload'

const props = defineProps<{
  uploadId?: string
  lockSlug?: boolean
  replaceExisting?: boolean
  title?: string
  description?: string
  ctaLabel?: string
}>()

const { canUseTool, payload, authToken } =
  useKitchenConsoleMenuUploadPayload({
    uploadId: toRef(props, 'uploadId'),
    lockSlug: toRef(props, 'lockSlug'),
    replaceExisting: toRef(props, 'replaceExisting'),
    title: toRef(props, 'title'),
    description: toRef(props, 'description'),
    ctaLabel: toRef(props, 'ctaLabel'),
  })
</script>
