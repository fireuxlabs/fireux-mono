<template>
  <WorkspaceKitchenTablesRead />

  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but table configuration is disabled."
  />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceTables } from '../../../composables/workspace/Tables/useKitchenWorkspaceTables'

const { readOnly } = useKitchenWorkspaceTables()
</script>
