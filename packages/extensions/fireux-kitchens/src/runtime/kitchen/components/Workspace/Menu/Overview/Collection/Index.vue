<template>
  <FireState v-if="feedback" :outcome="feedback" entity="menus" />
  <Collection.Grid
    v-else-if="visibleMenus.length"
    :menus="visibleMenus"
    :palette="palette"
    :kitchen-id="kitchenId"
    :timezone="timezone"
  />
  <p v-else role="status">{{ emptyMessage }}</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import type { Menu } from '../../../../../../menu/models/menu.model'
import type { MenuListStatus } from '../../../../../composables/workspace/menu/overview'
import * as Collection from './index'

const props = defineProps<{
  outcome: string
  visibleMenus: Menu[]
  query: string
  status: MenuListStatus
  totalCount: number
  palette: WorkspacePalette | null
  kitchenId: string
  timezone: string
}>()
const feedback = computed(() => {
  if (props.outcome === 'idle' || props.outcome === 'pending') return 'pending'
  if (props.outcome === 'error') return 'error'
})
const emptyMessage = computed(() => {
  if (props.query.trim()) return 'No matching menus.'
  if (props.status === 'published') return 'No published menus yet.'
  if (props.status === 'draft') return 'No draft menus.'
  if (props.status === 'archived') return 'No archived menus.'
  if (props.totalCount)
    return 'No current menus. Choose Archived to view previous menus.'
  return 'No menus yet. Add your first menu to get started.'
})
</script>
