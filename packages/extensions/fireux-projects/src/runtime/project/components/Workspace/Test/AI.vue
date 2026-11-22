<template>
  <TestAI
    :test="test"
    family="project"
    label="Project"
    endpoint="/api/workspace/project/tests/intent"
  >
    <template #model>
      <WorkspaceAIModelLabel />
    </template>
  </TestAI>
</template>
<script setup lang="ts">
import TestAI from 'fireux-workspace/runtime/workspace/components/Test/AI.vue'
import type { TestController } from 'fireux-workspace/runtime/workspace/composables/useWorkspaceTest'
defineProps<{ test: TestController }>()
</script>
