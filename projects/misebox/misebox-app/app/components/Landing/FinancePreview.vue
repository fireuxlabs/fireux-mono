<template>
  <LandingWorkspacePreviewFinance
    :error="Boolean(error)"
    :finance="productDemo?.workspace.finance || emptyFinance"
  />
</template>

<script setup lang="ts">
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'
import LandingWorkspacePreviewFinance from './WorkspacePreview/Finance.vue'

const emptyFinance: MiseboxProductDemo['workspace']['finance'] = {
  periods: [],
}
const { data: productDemo, error } = await useMiseboxProductDemo()
</script>
