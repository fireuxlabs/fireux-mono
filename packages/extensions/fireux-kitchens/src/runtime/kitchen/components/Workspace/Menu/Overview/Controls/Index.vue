<template>
  <Controls.Actions :disabled="createDisabled" @create="openCreate" />
  <Controls.Filters
    v-if="ready"
    v-model:query="query"
    v-model:status="status"
    :status-options="statusOptions"
    :count="count"
  />
  <p v-if="ready && createBlockedMessage" class="fx-type-caption">
    {{ createBlockedMessage }}
  </p>
</template>
<script setup lang="ts">
import * as Controls from './index'
import { useKitchenWorkspaceMenuOverviewControls } from './useControls'

const {
  ready,
  query,
  status,
  statusOptions,
  count,
  createDisabled,
  createBlockedMessage,
  openCreate,
} = useKitchenWorkspaceMenuOverviewControls()
</script>
