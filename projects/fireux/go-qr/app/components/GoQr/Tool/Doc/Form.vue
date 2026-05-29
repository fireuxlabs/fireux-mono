<template>
  <GoQrToolDoc
    :tool="tool"
    :show-powered-by="false"
    navigate-on-success
  />
</template>

<script setup lang="ts">
import type { GoQrDocToolContract } from '../../../../utils/goQrProviderClient'

defineProps<{
  tool: GoQrDocToolContract
}>()
</script>
