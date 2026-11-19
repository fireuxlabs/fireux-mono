<template>
  <TablesCollection />

  <UAlert
    v-if="readOnly"
    color="neutral"
    variant="soft"
    title="Read only"
    description="This kitchen can be inspected, but table configuration is disabled."
  />
</template>

<script setup lang="ts">
import TablesCollection from './Collection/Index.vue'
import { useKitchenWorkspaceTableTabs } from '../../../../composables/workspace/orders/tables/useKitchenWorkspaceTableTabs'

const { readOnly } = useKitchenWorkspaceTableTabs()
</script>
