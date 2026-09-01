<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Test detail"
  >
    <template v-if="test">
      <p class="text-sm font-medium text-muted">Test detail</p>
      <h1 class="text-2xl font-semibold text-highlighted">
        {{ test.name }}
      </h1>
    </template>
    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      icon="i-lucide-file-question"
      title="Test not found"
      description="Return to Tests and choose an available record."
    />
    <UButton
      to="/workspace/project/test"
      label="Back to Tests"
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="soft"
      class="w-fit"
    />
  </section>
</template>

<script setup lang="ts">
import type { ProjectTest } from '../../../../project/composables/workspace/test/useProjectWorkspaceTest'

defineProps<{
  test: ProjectTest | null
}>()
</script>
