<template>
  <KitchenTablesCollection />

  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but table configuration is disabled."
  />
</template>

<script setup lang="ts">
import { useKitchenWorkspaceTableTabs } from '../../composables/workspace/tables/useKitchenWorkspaceTableTabs'

const { readOnly } = useKitchenWorkspaceTableTabs()
</script>
