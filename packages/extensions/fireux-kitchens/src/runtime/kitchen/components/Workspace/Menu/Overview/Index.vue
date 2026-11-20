<template>
  <Overview.Controls
    v-model:query="query"
    v-model:status="status"
    :ready="ready"
    :count="visibleMenus.length"
    :status-options="statusOptions"
    :create-disabled="!ready || !canCreateMenu"
    :create-blocked-message="createBlockedMessage"
    @create="openCreate"
  />
  <Overview.Collection
    :outcome="menusOutcome"
    :visible-menus="visibleMenus"
    :query="query"
    :status="status"
    :total-count="totalCount"
    :palette="palette"
    :kitchen-id="kitchenId"
    :timezone="timezone"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import * as Overview from './index'
import { useKitchenWorkspaceMenuOverview } from '../../../../composables/workspace/menu/overview'

const {
  menusOutcome,
  query,
  status,
  statusOptions,
  totalCount,
  visibleMenus,
  canCreateMenu,
  createBlockedMessage,
  openCreate,
  palette,
  kitchenId,
  timezone,
} = useKitchenWorkspaceMenuOverview()
const ready = computed(() => ['ready', 'empty'].includes(menusOutcome.value))
</script>
