<template>
  <div class="grid min-w-0 gap-4">
    <UBreadcrumb
      :ui="{ list: 'flex-wrap' }"
      :items="[
        { label: kitchenName || 'Kitchen', to: workspaceEntryPath },
        { label: title },
      ]"
    />
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
  </div>
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
defineProps<{ title: string; kitchenName?: string }>()
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
</script>
