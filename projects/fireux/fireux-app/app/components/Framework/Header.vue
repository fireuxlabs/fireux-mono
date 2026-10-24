<template>
  <UHeader title="FireUX" to="/" mode="slideover">
    <template #title>
      <img src="/img/app/logo.png" width="28" height="28" alt="" />
      FireUX
    </template>
    <UNavigationMenu :items="desktop" aria-label="Framework" />
    <template #right>
      <UColorModeButton />
      <UButton
        v-if="hasWorkspaceEntry"
        :to="workspaceEntryHref"
        label="Workspace"
        color="neutral"
        variant="outline"
        icon="i-lucide-panels-top-left"
      />
    </template>
    <template #body>
      <UNavigationMenu
        :items="mobile"
        orientation="vertical"
        aria-label="Framework"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'

const { desktop, mobile } = useNav('framework')
const { hasWorkspaceEntry, workspaceEntryHref } = useWorkspaceEntryCta()
</script>
