<template>
  <MiseboxLandingConsolePreviewFinance
    :error="Boolean(error)"
    :finance="productDemo?.console.finance || emptyFinance"
  />
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'
import MiseboxLandingConsolePreviewFinance from './ConsolePreview/Finance.vue'

const emptyFinance: MiseboxProductDemo['console']['finance'] = {
  periods: [],
}
const { data: productDemo, error } = await useMiseboxProductDemo()
</script>
