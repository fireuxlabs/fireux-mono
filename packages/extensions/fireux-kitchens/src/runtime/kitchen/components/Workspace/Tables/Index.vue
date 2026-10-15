<template>
  <WorkspaceKitchenTablesCollection />

  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but table configuration is disabled."
  />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceTables } from '../../../composables/workspace/tables/useKitchenWorkspaceTables'

const { readOnly } = useKitchenWorkspaceTables()
</script>
