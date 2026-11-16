<template>
  <UPageCTA
    title="Your Kitchen, organised"
    description="Manage your Kitchen, Menus and Team in one Workspace."
    :links="[
      {
        label: 'Open Workspace',
        to: workspaceEntryHref,
        trailingIcon: 'i-lucide-arrow-up-right',
        color: 'neutral',
        variant: 'soft',
      },
    ]"
  />
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'

const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
</script>
