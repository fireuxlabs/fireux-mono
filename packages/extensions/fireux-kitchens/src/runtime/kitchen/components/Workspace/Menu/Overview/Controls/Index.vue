<template>
  <Controls.Actions :disabled="createDisabled" @create="emit('create')" />
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
import type { MenuListStatus } from '../../../../../composables/workspace/menu/overview'

defineProps<{
  ready: boolean
  statusOptions: { label: string; value: MenuListStatus }[]
  count: number
  createDisabled: boolean
  createBlockedMessage: string
}>()
const emit = defineEmits<{ create: [] }>()
const query = defineModel<string>('query', { required: true })
const status = defineModel<MenuListStatus>('status', { required: true })
</script>
