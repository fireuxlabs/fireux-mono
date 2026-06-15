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
import { useKitchenConsoleMenuUploadTool } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuUploadTool'

const { canUseTool, payload, authToken } = useKitchenConsoleMenuUploadTool()
</script>
