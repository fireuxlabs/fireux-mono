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
import { useKitchenConsoleMenuUploadPayload } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuUploadPayload'

const { canUseTool, payload, authToken } =
  useKitchenConsoleMenuUploadPayload()
</script>
